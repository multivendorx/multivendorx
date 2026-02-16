<?php
/**
 * Session class file
 *
 * @package CatalogX
 */

namespace CatalogX\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'WC_Session' ) ) {
    include_once WC()->plugin_path() . '/includes/abstracts/abstract-wc-session.php';
}

/**
 * Handle data for the current customers session.
 * Implements the WC_Session abstract class.
 *
 * WC_Session.
 */
class Session extends \WC_Session {

    /**
     * Cookie name
     *
     * @var string
     */
    private $_cookie;

    /**
     * Session due to expire timestamp
     *
     * @var string
     */
    private $_session_expiring;

    /**
     * Session expiration timestamp
     *
     * @var string
     */
    private $_session_expiration;

    /**
     * Bool based on whether a cookie exists
     *
     * @var bool
     */
    private $_has_cookie = false;

    /**
     * Constructor for the session class.
     */
    public function __construct() {
        global $wpdb;
        if ( ! defined( 'COOKIEHASH' ) ) {
            $siteurl = get_site_option( 'siteurl' );
            if ( $siteurl ) {
                define( 'COOKIEHASH', md5( $siteurl ) );
            } else {
				define( 'COOKIEHASH', md5( wp_guess_url() ) );
            }
        }

        $this->_cookie = 'catalogx_session_' . COOKIEHASH;

        $cookie = $this->get_session_cookie();
        if ( false !== $cookie ) {
            $this->_customer_id        = $cookie[0];
            $this->_session_expiration = $cookie[1];
            $this->_session_expiring   = $cookie[2];
            $this->_has_cookie         = true;

            // Update session if its close to expiring.
            if ( time() > $this->_session_expiring ) {
                $this->set_session_expiration();
                $session_expiry_option = 'catalogx_session_expires_' . $this->_customer_id;

                if ( false === get_option( $session_expiry_option ) ) {
                    add_option( $session_expiry_option, $this->_session_expiration, '', 'no' );
                } else {
                    update_option( $session_expiry_option, $this->_session_expiration );
                }
            }
        } else {
            $this->set_session_expiration();
            $this->_customer_id = $this->generate_customer_id();
        }

        $this->_data = $this->get_session_data();

        // Actions.
        add_action( 'woocommerce_cleanup_sessions', array( $this, 'cleanup_sessions' ), 10 );
        add_action( 'shutdown', array( $this, 'save_data' ), 20 );
        add_action( 'wp_logout', array( $this, 'destroy_session' ) );
        add_action( 'clear_auth_cookie', array( $this, 'destroy_session' ) );
        if ( ! is_user_logged_in() ) {
            add_action( 'woocommerce_thankyou', array( $this, 'destroy_session' ) );
        }
    }

    /**
     * Sets the session cookie on-demand (usually after adding an item to the cart).
     *
     * Since the cookie name (as of 2.1) is prepended with wp, cache systems like batcache will not cache pages when set.
     *
     * Warning: Cookies will only be set if this is called before the headers are sent.
     *
     * @param bool $set Whether to set the session cookie.
     */
    public function set_customer_session_cookie( $set ) {
        if ( $set ) {
            // Set/renew our cookie.
            $to_hash           = $this->_customer_id . '|' . $this->_session_expiration;
            $cookie_hash       = hash_hmac( 'md5', $to_hash, wp_hash( $to_hash ) );
            $cookie_value      = $this->_customer_id . '||' . $this->_session_expiration . '||' . $this->_session_expiring . '||' . $cookie_hash;
            $this->_has_cookie = true;

            // Set the cookie.
            wc_setcookie( $this->_cookie, $cookie_value, $this->_session_expiration, apply_filters( 'catalogx_session_use_secure_cookie', false ) );
        }
    }

    /**
     * Return true if the current user has an active session, i.e. a cookie to retrieve values.
     *
     * @return bool
     */
    public function has_session() {
        return isset( $_COOKIE[ $this->_cookie ] ) || $this->_has_cookie || is_user_logged_in();
    }

    /**
     * Set session expiration.
     */
    public function set_session_expiration() {
        $this->_session_expiring   = time() + intval( apply_filters( 'catalogx_session_expiring', 60 * 60 * 47 ) ); // 47 Hours.
        $this->_session_expiration = time() + intval( apply_filters( 'catalogx_session_expiration', 60 * 60 * 48 ) ); // 48 Hours.
    }

    /**
     * Generate a unique customer ID for guests, or return user ID if logged in.
     *
     * Uses Portable PHP password hashing framework to generate a unique cryptographically strong ID.
     *
     * @return int|string
     */
    public function generate_customer_id() {
        if ( is_user_logged_in() ) {
            return get_current_user_id();
        } else {
            require_once ABSPATH . 'wp-includes/class-phpass.php';
            $hasher = new \PasswordHash( 8, false );
            return md5( $hasher->get_random_bytes( 32 ) );
        }
    }

    /**
     * Get session cookie.
     *
     * @return bool|array
     */
    public function get_session_cookie() {
        if ( empty( $_COOKIE[ $this->_cookie ] ) ) {
            return false;
        }

        $cookie_value = isset( $_COOKIE[ $this->_cookie ] ) ? sanitize_text_field( wp_unslash( $_COOKIE[ $this->_cookie ] ) ) : '';
        list( $customer_id, $session_expiration, $session_expiring, $cookie_hash ) = explode( '||', $cookie_value );

        // Validate hash.
        $to_hash = $customer_id . '|' . $session_expiration;
        $hash    = hash_hmac( 'md5', $to_hash, wp_hash( $to_hash ) );

        if ( empty( $cookie_hash ) || ! hash_equals( $hash, $cookie_hash ) ) {
            return false;
        }

        return array( $customer_id, $session_expiration, $session_expiring, $cookie_hash );
    }

    /**
     * Get session data.
     *
     * @return array
     */
    public function get_session_data() {
        return $this->has_session() ? (array) $this->get_session( $this->_customer_id, array() ) : array();
    }

    /**
     * Save data.
     */
    public function save_data() {
        // Dirty if something changed - prevents saving nothing new.
        if ( $this->_dirty && $this->has_session() ) {
            $session_option        = '_catalogx_session_' . $this->_customer_id;
            $session_expiry_option = '_catalogx_session_expires_' . $this->_customer_id;

            if ( false === get_option( $session_option ) ) {
                add_option( $session_option, $this->_data, '', 'no' );
                add_option( $session_expiry_option, $this->_session_expiration, '', 'no' );
            } else {
                update_option( $session_option, $this->_data );
            }
        }
    }

    /**
     * Destroy all session data.
     */
    public function destroy_session() {
        // Clear cookie.
        wc_setcookie( $this->_cookie, '', time() - YEAR_IN_SECONDS, apply_filters( 'catalogx_session_use_secure_cookie', false ) );

        $this->delete_session( $this->_customer_id );

        // Clear data.
        $this->_data        = array();
        $this->_dirty       = false;
        $this->_customer_id = $this->generate_customer_id();
    }

    /**
     * Cleanup sessions.
     */
    public function cleanup_sessions() {
        global $wpdb;

        if ( ! defined( 'WP_SETUP_CONFIG' ) && ! defined( 'WP_INSTALLING' ) ) {
            $now              = time();
            $expired_sessions = array();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wc_session_expires = $wpdb->get_col( "SELECT option_name FROM $wpdb->options WHERE option_name LIKE '\_wcce\_session\_expires\_%' AND option_value < '$now'" );

            foreach ( $wc_session_expires as $option_name ) {
                $session_id         = substr( $option_name, 20 );
                $expired_sessions[] = $option_name;  // Expires key.
                $expired_sessions[] = "_catalogx_session_$session_id"; // Session key.
            }

            if ( ! empty( $expired_sessions ) ) {
                $expired_sessions_chunked = array_chunk( $expired_sessions, 100 );
                foreach ( $expired_sessions_chunked as $chunk ) {
                    if ( wp_using_ext_object_cache() ) {
                        // delete from object cache first, to avoid cached but deleted options.
                        foreach ( $chunk as $option ) {
                            wp_cache_delete( $option, 'options' );
                        }
                    }

                    // delete from options table.
                    $option_names = implode( "','", $chunk );
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                    $wpdb->query( "DELETE FROM $wpdb->options WHERE option_name IN ('$option_names')" );
                }
            }
        }
    }

    /**
     * Returns the session.
     *
     * @param string $customer_id The unique identifier for the customer.
     * @param mixed  $default The default value to return if no session is found.
     * @return string|array
     */
    public function get_session( $customer_id, $default = false ) {
        global $wpdb;

        if ( defined( 'WP_SETUP_CONFIG' ) ) {
            return false;
        }

        return get_option( '_catalogx_session_' . $customer_id );
    }

    /**
     * Delete the session from the cache and database.
     *
     * @param int $customer_id The ID of the customer whose session should be deleted.
     */
    public function delete_session( $customer_id ) {
        // Delete session.
        $session_option        = '_catalogx_session_' . $customer_id;
        $session_expiry_option = '_catalogx_session_expires_' . $customer_id;

        delete_option( $session_option );
        delete_option( $session_expiry_option );
    }
}
