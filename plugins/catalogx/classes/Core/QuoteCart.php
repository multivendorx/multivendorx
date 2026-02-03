<?php
/**
 * Quote Cart class file
 *
 * @package CatalogX
 */

namespace CatalogX\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * CatalogX QuoteCart class
 *
 * @class       QuoteCart class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class QuoteCart {

    /**
     * Holds the session handler instance.
     *
     * @var Session
     */
    public $session;

    /**
     * Holds the quote cart data.
     *
     * @var array
     */
    public $quote_cart_content = array();

    /**
     * Holds error messages.
     *
     * @var array
     */
    public $errors = array();

    /**
     * Constructor
     *
     * @access public
     * @return void
     */
    public function __construct() {
        add_action( 'init', array( $this, 'quote_session_start' ) );
        add_action( 'wp_loaded', array( $this, 'init_callback' ) );
        add_action( 'wp', array( $this, 'maybe_set_cart_cookies' ), 99 );
        add_action( 'shutdown', array( $this, 'maybe_set_cart_cookies' ), 0 );
        add_action( 'quote_clean_cron', array( $this, 'clean_session' ) );
        add_action( 'wp_loaded', array( $this, 'add_to_quote_action' ), 30 );
    }

    /**
     * Starts the php session data for the cart.
     */
    public function quote_session_start() {
        if ( ! isset( $_COOKIE['woocommerce_items_in_cart'] ) ) {
            do_action( 'woocommerce_set_cart_cookies', true );
        }
        $this->session = new Session();
        $this->set_session();
    }

    /**
     * Initializes necessary components when WordPress has loaded.
     *
     * @return void
     */
    public function init_callback() {
        $this->get_quote_cart_session();
        $this->session->set_customer_session_cookie( true );
        $this->quote_cron_schedule();
    }

    /**
     * Retrieves the current quote cart session data.
     *
     * @return array
     */
    public function get_quote_cart_session() {
        $this->quote_cart_content = $this->session->get( 'quote_cart', array() );
        return $this->quote_cart_content;
    }

    /**
     * Schedules the cron event to clean quote cart data hourly.
     *
     * @return void
     */
    public function quote_cron_schedule() {
        if ( ! wp_next_scheduled( 'quote_clean_cron' ) ) {
            wp_schedule_event( time(), 'hourly', 'quote_clean_cron' );
        }
    }

    /**
     * Clean all CatalogX session data from the options table.
     *
     * Deletes all options where the option_name starts with '_catalogx_session_'.
     *
     * @return void
     */
    public function clean_session() {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $query = $wpdb->query( 'DELETE FROM ' . $wpdb->prefix . "options  WHERE option_name LIKE '_catalogx_session_%'" );
    }


    /**
     * Sets the PHP session data for the enquiry cart.
     *
     * @param array $cart_session The session data to set for the quote cart.
     * @param bool  $can_be_empty Whether the session can be set to an empty array.
     *
     * @return void
     */
    public function set_session( $cart_session = array(), $can_be_empty = false ) {

        if ( empty( $cart_session ) && ! $can_be_empty ) {
            $cart_session = $this->get_quote_cart_session();
        }
        // Set quote_cart session data.
        $this->session->set( 'quote_cart', $cart_session );
    }

    /**
     * Unsets the quote cart session data.
     *
     * @return void
     */
    public function unset_session() {
        $this->session->__unset( 'quote_cart' );
    }

    /**
     * Conditionally sets or unsets cart cookies.
     *
     * @return void
     */
    public function maybe_set_cart_cookies() {
        $set = true;

        if ( ! headers_sent() ) {
            if ( count( $this->quote_cart_content ) > 0 ) {
                $this->set_cart_cookies( true );
                $set = true;
            } elseif ( isset( $_COOKIE['quote_items_in_cart'] ) ) {
                $this->set_cart_cookies( false );
                $set = false;
            }
        }

        do_action( 'quote_set_cart_cookies', $set );
    }

    /**
     * Set or clear quote cart cookies.
     *
     * @param bool $set Whether to set (true) or clear (false) the cart cookies.
     * @return void
     */
    private function set_cart_cookies( $set = true ) {
        if ( $set ) {
            wc_setcookie( 'quote_items_in_cart', 1 );
            wc_setcookie( 'quote_hash', md5( json_encode( $this->quote_cart_content ) ) );
        } elseif ( isset( $_COOKIE['quote_items_in_cart'] ) ) {
            wc_setcookie( 'quote_items_in_cart', 0, time() - HOUR_IN_SECONDS );
            wc_setcookie( 'quote_hash', '', time() - HOUR_IN_SECONDS );
        }
    }

    /**
     * Handles the "Add to Quote" action.
     *
     * Retrieves product ID, variation ID, and quantity from the query string,
     * prepares the request data, and adds the item to the quote cart.
     *
     * @return void
     */
    public function add_to_quote_action() {
        $add_to_quote = filter_input( INPUT_GET, 'add-to-quote', FILTER_SANITIZE_NUMBER_INT );
        if ( ! $add_to_quote ) {
            return;
        }

        $product_id   = absint( $add_to_quote );
        $variation_id = filter_input( INPUT_GET, 'variation_id', FILTER_SANITIZE_NUMBER_INT );
        $variation_id = ( null !== $variation_id ) ? $variation_id : '';
        $quantity     = filter_input( INPUT_GET, 'quantity', FILTER_SANITIZE_NUMBER_INT );
        $quantity     = empty( $quantity ) ? 1 : wc_stock_amount( intval( $quantity ) );

        $adding_to_quote = wc_get_product( $product_id );

        if ( ! $adding_to_quote ) {
            return;
        }

        $raq_data = array();

        if ( $adding_to_quote->is_type( 'variable' ) && $variation_id ) {
            $variation  = wc_get_product( $variation_id );
            $attributes = $variation->get_attributes();

            if ( ! empty( $attributes ) ) {
                foreach ( $attributes as $name => $value ) {
                    $raq_data[ 'attribute_' . $name ] = $value;
                }
            }
        }

        // Merge request data into array.
        $raq_data = array_merge(
            array(
                'product_id'   => $product_id,
                'variation_id' => $variation_id,
                'quantity'     => $quantity,
            ),
            $raq_data
        );

        // Add item to quote cart.
        $return = $this->add_cart_item( $raq_data );

        // Handle response messages.
        if ( 'true' === $return ) {
            wc_add_notice( 'product_added', 'success' );
        } elseif ( 'exists' === $return ) {
            wc_add_notice( 'already_in_quote', 'notice' );
        }
    }

    /**
     * Add a product to the quote cart.
     *
     * Checks if the product already exists in the cart. If not, adds it to the session.
     *
     * @param array $cart_data The data of the product being added to the quote cart.
     *                         Must include 'product_id', 'variation' (array), and optionally 'quantity'.
     * @return string Returns 'true' on success, or 'exists' if the item is already in the quote cart.
     */
    public function add_cart_item( $cart_data ) {

        $cart_data['quantity'] = ( isset( $cart_data['quantity'] ) ) ? (int) $cart_data['quantity'] : 1;
        $return                = '';

        do_action( 'catalogx_add_to_quote_cart', $cart_data );

        if ( ! $this->exists_in_cart( $cart_data['product_id'] ) ) {
            $enquiry = array(
                'product_id' => $cart_data['product_id'],
                'variation'  => $cart_data['variation'],
                'quantity'   => $cart_data['quantity'],
            );

            $this->quote_cart_content[ md5( $cart_data['product_id'] ) ] = $enquiry;
        } else {
            $return = 'exists';
        }

        if ( 'exists' != $return ) {
            $this->set_session( $this->quote_cart_content );
            $return = 'true';
            $this->set_cart_cookies( count( $this->quote_cart_content ) > 0 );
        }
        return $return;
    }

    /**
     * Check if a product (and optional variation) already exists in the quote cart.
     *
     * @param int       $product_id The ID of the product to check.
     * @param int|false $variation_id Optional. The variation ID of the product. Default false.
     * @return bool True if the product (and variation, if provided) exists in the cart, false otherwise.
     */
    public function exists_in_cart( $product_id, $variation_id = false ) {
        if ( $variation_id ) {
            $key_to_find = md5( $product_id . $variation_id );
        } else {
            $key_to_find = md5( $product_id );
        }
        if ( array_key_exists( $key_to_find, $this->quote_cart_content ) ) {
            $this->errors[] = __( 'Product already in Cart.', 'catalogx' );
            return true;
        }
        return false;
    }

    /**
     * Retrieve all data from the quote cart session.
     *
     * @return array The quote cart content.
     */
    public function get_cart_data() {
        return $this->quote_cart_content;
    }

    /**
     * Retrieve the URL of the request quote page.
     *
     * @return string
     */
    public function get_request_quote_page_url() {
        $catalogx_quote_page_id = get_option( 'catalogx_request_quote_page' );
        $translated_id          = function_exists( 'pll_get_post' ) ? pll_get_post( $catalogx_quote_page_id ) : $catalogx_quote_page_id;
        $base_url               = get_the_permalink( $translated_id );

        return apply_filters( 'catalogx_request_quote_page_url', $base_url );
    }

    /**
     * Check if the quote cart is empty.
     *
     * @return bool True if the quote cart is empty, false otherwise.
     */
    public function is_empty_cart() {
        return empty( $this->quote_cart_content );
    }

    /**
     * Remove an item from the quote cart by its key.
     *
     * @param string $key The cart item key to remove.
     * @return bool True if the item was removed, false if it was not found.
     */
    public function remove_cart( $key ) {

        if ( isset( $this->quote_cart_content[ $key ] ) ) {
            unset( $this->quote_cart_content[ $key ] );
            $this->set_session( $this->quote_cart_content, true );
            return true;
        } else {
            return false;
        }
    }

    /**
     * Clear all items from the quote cart.
     *
     * @return void
     */
    public function clear_cart() {
        $this->quote_cart_content = array();
        $this->set_session( $this->quote_cart_content, true );
    }

    /**
     * Update an item in the quote cart.
     *
     * @param string      $key   The cart item key (usually a hashed product ID).
     * @param string|bool $field Optional. The specific field of the item to update. If false, replaces the entire item.
     * @param mixed       $value The new value for the field or item.
     *
     * @return bool True on success, false on failure.
     */
    public function update_cart( $key, $field = false, $value = '' ) {
        if ( $field && isset( $this->quote_cart_content[ $key ][ $field ] ) ) {
            $this->quote_cart_content[ $key ][ $field ] = $value;
            $this->set_session( $this->quote_cart_content );
        } elseif ( isset( $this->quote_cart_content[ $key ] ) ) {
            $this->quote_cart_content[ $key ] = $value;
            $this->set_session( $this->quote_cart_content );
        } else {
            return false;
        }
        $this->set_session( $this->quote_cart_content );
        return true;
    }
}
