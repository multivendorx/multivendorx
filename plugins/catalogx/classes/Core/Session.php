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
    private $cookie_name;

    /**
     * Session due to expire timestamp
     *
     * @var string
     */
    private $session_expiring;

    /**
     * Session expiration timestamp
     *
     * @var string
     */
    private $session_expiration;

    /**
     * Bool based on whether a cookie exists
     *
     * @var bool
     */
    private $is_cookie_set = false;

    /**
     * Constructor for the session class.
     */
    public function __construct() {
        if ( ! defined( 'COOKIEHASH' ) ) {
            $siteurl = get_site_option( 'siteurl' );
            define(
                'COOKIEHASH',
                md5(
                    $siteurl ?: wp_guess_url()
                )
            );
        }

        $this->cookie_name = 'catalogx_session_' . COOKIEHASH;
        $session_cookie    = $this->get_session_cookie();

        if ( $session_cookie ) {
            $this->_customer_id       = $session_cookie[0];
            $this->session_expiration = $session_cookie[1];
            $this->session_expiring   = $session_cookie[2];
            $this->is_cookie_set         = true;

            // Update session if its close to expiring.
            if ( time() > $this->session_expiring ) {
                $this->set_session_expiration();
                $session_expiry_option = 'catalogx_session_expires_' . $this->_customer_id;

                if ( false === get_option( $session_expiry_option ) ) {
                    add_option( $session_expiry_option, $this->session_expiration, '', 'no' );
                } else {
                    update_option( $session_expiry_option, $this->session_expiration );
                }
            }
        } else {
            $this->set_session_expiration();
            $this->_customer_id = $this->generate_customer_id();
        }

        $this->_data = $this->get_customer_session();

        // Actions.
        add_action( 'woocommerce_cleanup_sessions', array( $this, 'cleanup_expired_sessions' ), 10 );
        add_action( 'shutdown', array( $this, 'save_session_data' ), 20 );
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
            $cookie_signature          = $this->_customer_id . '|' . $this->session_expiration;
            $cookie_hash               = hash_hmac( 'md5', $cookie_signature, wp_hash( $cookie_signature ) );
            $cookie_value              = $this->_customer_id . '||' . $this->session_expiration . '||' . $this->session_expiring . '||' . $cookie_hash;
            $this->is_cookie_set          = true;

            // Set the cookie.
            wc_setcookie( $this->cookie_name, $cookie_value, $this->session_expiration, apply_filters( 'catalogx_session_use_secure_cookie', false ) );
        }
    }

    /**
     * Return true if the current user has an active session, i.e. a cookie to retrieve values.
     *
     * @return bool
     */
    public function has_session() {
        return isset( $_COOKIE[ $this->cookie_name ] ) || $this->is_cookie_set || is_user_logged_in();
    }

    /**
     * Set session expiration.
     */
    public function set_session_expiration() {
        $this->session_expiring   = time() + intval( apply_filters( 'catalogx_session_expiring', ( DAY_IN_SECONDS * 2 ) - 1 ) ); // 47 Hours.
        $this->session_expiration = time() + intval( apply_filters( 'catalogx_session_expiration', DAY_IN_SECONDS * 2 ) ); // 48 Hours.
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
        }
        require_once ABSPATH . 'wp-includes/class-phpass.php';
        $hasher = new \PasswordHash( 8, false );
        return md5( $hasher->get_random_bytes( 32 ) );
    }

    /**
     * Get session cookie.
     *
     * @return bool|array
     */
    public function get_session_cookie() {
        if ( empty( $_COOKIE[ $this->cookie_name ] ) ) {
            return false;
        }

        list( $customer_id, $session_expiration, $session_expiring, $cookie_hash ) = explode( '||', $_COOKIE[ $this->cookie_name ] );

        // Validate hash.
        $cookie_signature = $customer_id . '|' . $session_expiration;
        $hash    = hash_hmac( 'md5', $cookie_signature, wp_hash( $cookie_signature ) );

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
    public function get_customer_session() {
        return $this->has_session() ? (array) $this->get_session( $this->_customer_id, array() ) : array();
    }

    /**
     * Save data.
     */
    public function save_session_data() {
        // Dirty if something changed - prevents saving nothing new.
        if ( $this->_dirty && $this->has_session() ) {
            $session_option        = '_catalogx_session_' . $this->_customer_id;
            $session_expiry_option = '_catalogx_session_expires_' . $this->_customer_id;

            if ( false === get_option( $session_option ) ) {
                add_option( $session_option, $this->_data, '', 'no' );
                add_option( $session_expiry_option, $this->session_expiration, '', 'no' );
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
        wc_setcookie( $this->cookie_name, '', time() - YEAR_IN_SECONDS, apply_filters( 'catalogx_session_use_secure_cookie', false ) );

        $this->delete_session( $this->_customer_id );

        // Clear data.
        $this->_data        = array();
        $this->_dirty       = false;
        $this->_customer_id = $this->generate_customer_id();
    }

    /**
     * Cleanup sessions.
     */
    public function cleanup_expired_sessions() {
        global $wpdb;

        if ( defined( 'WP_SETUP_CONFIG' ) || defined( 'WP_INSTALLING' ) ) {
            return;
        }

            $now              = time();
            $expired_sessions = array();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wc_session_expires = $wpdb->get_col( "SELECT option_name FROM $wpdb->options WHERE option_name LIKE '\_wcce\_session\_expires\_%' AND option_value < '$now'" );

		foreach ( $wc_session_expires as $option_name ) {
			$session_id         = substr( $option_name, 20 );
			$expired_sessions[] = $option_name;  // Expires key.
			$expired_sessions[] = "_catalogx_session_$session_id"; // Session key.
		}

                $expired_sessions_chunked = array_chunk( $expired_sessions, 100 );
		foreach ( $expired_sessions_chunked as $session_option_batch ) {
			if ( wp_using_ext_object_cache() ) {
				// delete from object cache first, to avoid cached but deleted options.
				foreach ( $session_option_batch as $option_name ) {
					wp_cache_delete( $option_name, 'options' );
				}
			}

			// delete from options table.
			$option_names = implode( "','", $session_option_batch );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name IN ('$option_names')" );
		}
    }

    /**
     * Returns the session.
     *
     * @param string $customer_id The unique identifier for the customer.
     * @return string|array
     */
    public function get_session( $customer_id ) {

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
