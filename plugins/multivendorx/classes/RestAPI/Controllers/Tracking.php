<?php
/**
 * MultiVendorX REST API Store Controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Store Controller.
 *
 * @class       Store class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Tracking extends \WP_REST_Controller {


    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'tracking';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'create_item_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Create tracking.
     *
     * @param object $request Request data.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'create_stores' );// phpcs:ignore WordPress.WP.Capabilities.Unknown
    }
	/**
	 * Send notification when a shipment tracking item is added.
	 *
	 * @param WP_REST_Request $request REST request with 'formData' and 'order_id'.
	 *
	 * @return void
	 */
    public function create_item( $request ) {
        $data     = $request->get_param( 'formData' );
        $order_id = $request->get_param( 'order_id' );
        $store_id = MultiVendorX()->active_store;
        $store    = new Store( $store_id );

        $order = wc_get_order($order_id);

        $provider        = sanitize_text_field( $data['provider'] ?? '' );
        $date            = sanitize_text_field( $data['date'] ?? '' );
        $tracking_number = sanitize_text_field( $data['tracking_number'] ?? '' );
        $tracking_url    = esc_url_raw( $data['tracking_url'] ?? '' );

        $order->update_meta_data( 'multivendorx_shipping_provider', $provider );
        $order->update_meta_data( 'multivendorx_tracking_date', $date );
        $order->update_meta_data( 'multivendorx_tracking_id', $tracking_number );
        $order->update_meta_data( 'multivendorx_tracking_url', $tracking_url );
        $order->save();

        MultiVendorX()->notifications->send_notification_helper(
            'shipment_tracking_added',
            $store,
            null,
            array(
				'store_name'      => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
				'order_id'        => $order_id,
				'tracking_url'    => $tracking_url,
				'tracking_number' => $tracking_number,
				'provider'        => $provider,
				'date'            => $date,
				'store_id'        => $store_id,
				'category'        => 'notification',
			)
        );

        do_action( 'multivendorx_shipment_tracking', $order_id );
    }
}
