<?php
/**
 * MultiVendorX Blocks Checkout Compatibility Handler
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

use Automattic\WooCommerce\StoreApi\Schemas\V1\CheckoutSchema;

class Blocks_Checkout_Integration {

    /**
     * Constructor: Setup Blocks and Store API Architecture Hooks
     */
    public function __construct() {
        // Run as soon as WooCommerce Blocks framework loads
        add_action( 'woocommerce_blocks_loaded', array( $this, 'register_blocks_checkout_updates' ) );
        
        // Define payload variables accepted by the store endpoints
        add_action( 'woocommerce_store_api_register_endpoint_data', array( $this, 'register_blocks_extension_schema' ) );
        
        // Intercept block order placement to save permanently to order meta
        add_action( 'woocommerce_store_api_checkout_update_order_from_request', array( $this, 'save_blocks_order_meta' ), 10, 2 );
    }

    /**
     * Initialize the Block Store Update Registry listener
     */
    public function register_blocks_checkout_updates() {
        if ( function_exists( 'woocommerce_store_api_register_update_callback' ) ) {
            woocommerce_store_api_register_update_callback([
                'namespace' => 'multivendorx',
                'callback'  => array( $this, 'multivendorx_blocks_checkout_session_sync' ),
            ]);
        }
    }

    /**
     * Expose valid payload parameters to the WooCommerce Block endpoint schema
     */
    public function register_blocks_extension_schema() {
        if ( function_exists( 'woocommerce_store_api_register_endpoint_extension_fields' ) ) {
            woocommerce_store_api_register_endpoint_extension_fields( [
                'endpoint'        => CheckoutSchema::IDENTIFIER,
                'namespace'       => 'multivendorx',
                'schema_callback' => function() {
                    return [
                        'user_location'     => [ 'type' => 'string' ],
                        'user_location_lat' => [ 'type' => 'string' ],
                        'user_location_lng' => [ 'type' => 'string' ],
                    ];
                },
            ] );
        }
    }

    /**
     * Process real-time updates arriving dynamically via the React client store API payload
     *
     * @param array $data Sent payload variables from extensionCartUpdate/setExtensionData
     */
    public function multivendorx_blocks_checkout_session_sync( $data ) {
        if ( ! function_exists( 'WC' ) || ! WC()->session ) {
            return;
        }
        
        if ( isset( $data['user_location'] ) ) {
            WC()->session->set( '_multivendorx_user_location', sanitize_text_field( $data['user_location'] ) );
        }
        if ( isset( $data['user_location_lat'] ) ) {
            WC()->session->set( '_multivendorx_user_location_lat', sanitize_text_field( $data['user_location_lat'] ) );
        }
        if ( isset( $data['user_location_lng'] ) ) {
            WC()->session->set( '_multivendorx_user_location_lng', sanitize_text_field( $data['user_location_lng'] ) );
        }
    }

    /**
     * Save the blocks runtime request data directly to Order Meta at submission
     *
     * @param \WC_Order $order   The current processed order object
     * @param \WP_REST_Request $request The current block request object
     */
    public function save_blocks_order_meta( $order, $request ) {
        $extension_data = $request['extensions']['multivendorx'] ?? [];

        if ( ! empty( $extension_data['user_location'] ) ) {
            $order->update_meta_data( '_multivendorx_user_location', sanitize_text_field( $extension_data['user_location'] ) );
        }
        if ( ! empty( $extension_data['user_location_lat'] ) ) {
            $order->update_meta_data( '_multivendorx_user_location_lat', sanitize_text_field( $extension_data['user_location_lat'] ) );
        }
        if ( ! empty( $extension_data['user_location_lng'] ) ) {
            $order->update_meta_data( '_multivendorx_user_location_lng', sanitize_text_field( $extension_data['user_location_lng'] ) );
        }
        
        $order->save();
    }
}