<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

use Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema;

/**
 * MultiVendorX Store Review Frontend class
 *
 * @class       Block Checkout class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Block_Checkout {

    /**
     * Frontend class constructor function
     */
    public function __construct() {
        // Register the schema endpoint namespace alongside the update runtime callback hook
        add_action( 'woocommerce_blocks_loaded', array( $this, 'register_multivendorx_store_api_extensions' ) );
        
        // Final action to persist structural values onto the completed order record context
        add_action( 'woocommerce_store_api_checkout_update_order_from_request', array( $this, 'multivendorx_block_checkout_user_location_save' ), 10, 2 );
    }

    /**
     * White-lists the namespace and hooks into the Store API routing workflow pipeline
     */
    public function register_multivendorx_store_api_extensions() {
        if ( ! function_exists( 'woocommerce_store_api_register_endpoint_data' ) || ! function_exists( 'woocommerce_store_api_register_update_callback' ) ) {
            return;
        }

        // 1. MUST DO FIRST: Whitelist the 'multivendorx' namespace on the Cart endpoint schema registry
        woocommerce_store_api_register_endpoint_data( array(
            'endpoint'        => CartSchema::IDENTIFIER, // Target endpoint route context target string
            'namespace'       => 'multivendorx',
            'schema_type'     => ARRAY_A,
            'schema_callback' => array( $this, 'multivendorx_extension_schema_definition' ),
            'data_callback'   => array( $this, 'multivendorx_extension_data_fallback' ),
        ) );

        // 2. Map runtime handling of client requests executing 'extensionCartUpdate' methods
        woocommerce_store_api_register_update_callback( array(
            'namespace' => 'multivendorx',
            'callback'  => array( $this, 'multivendorx_block_checkout_user_location_update' ),
        ) );
    }

    /**
     * Defines extension value schemas safely for validation processes
     */
    public function multivendorx_extension_schema_definition() {
        return array(
            'user_location'     => array( 'type' => 'string', 'context' => array( 'view', 'edit' ) ),
            'user_location_lat' => array( 'type' => 'string', 'context' => array( 'view', 'edit' ) ),
            'user_location_lng' => array( 'type' => 'string', 'context' => array( 'view', 'edit' ) ),
        );
    }

    /**
     * Populates schema contexts using ongoing session properties dynamically
     */
    public function multivendorx_extension_data_fallback() {
        return array(
            'user_location'     => WC()->session->get( '_multivendorx_user_location', '' ),
            'user_location_lat' => WC()->session->get( '_multivendorx_user_location_lat', '' ),
            'user_location_lng' => WC()->session->get( '_multivendorx_user_location_lng', '' ),
        );
    }

    /**
     * Processes values from custom on-demand Map interactive components seamlessly
     */
    public function multivendorx_block_checkout_user_location_update( $data ) {
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: data: " . var_export($data, true) . "\n", FILE_APPEND);
        if ( empty( $data ) ) {
            return;
        }

        WC()->session->set( '_multivendorx_user_location', sanitize_text_field( $data['user_location'] ?? '' ) );
        WC()->session->set( '_multivendorx_user_location_lat', sanitize_text_field( $data['user_location_lat'] ?? '' ) );
        WC()->session->set( '_multivendorx_user_location_lng', sanitize_text_field( $data['user_location_lng'] ?? '' ) );
    }

    /**
     * Persists cached context values onto Order Meta layers directly during creation
     */
    public function multivendorx_block_checkout_user_location_save( $order, $request ) {
        $user_location     = WC()->session->get( '_multivendorx_user_location' );
        $user_location_lat = WC()->session->get( '_multivendorx_user_location_lat' );
        $user_location_lng = WC()->session->get( '_multivendorx_user_location_lng' );

        if ( ! empty( $user_location ) ) {
            $order->update_meta_data( '_multivendorx_user_location', $user_location );
        }
        if ( ! empty( $user_location_lat ) ) {
            $order->update_meta_data( '_multivendorx_user_location_lat', $user_location_lat );
        }
        if ( ! empty( $user_location_lng ) ) {
            $order->update_meta_data( '_multivendorx_user_location_lng', $user_location_lng );
        }
    }
}