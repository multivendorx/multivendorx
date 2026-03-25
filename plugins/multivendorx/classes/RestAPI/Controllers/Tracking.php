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
 * @version     PRODUCT_VERSION
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

        do_action(
            'multivendorx_notify_shipment_tracking_added',
            'shipment_tracking_added',
            array(
                'admin_email'     => MultiVendorX()->setting->get_setting( 'receiver_email_address' ),
                'admin_phone'     => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                'store_phone'     => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                'store_email'     => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                'store_name'      => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
                'order_id'        => $order_id,
                'tracking_url'    => $data['tracking_url'],
                'tracking_number' => $data['tracking_number'],
                'provider'        => $data['provider'],
                'date'            => $data['date'],
                'store_id'        => $store_id,
                'category'        => 'notification',
            )
        );
    }
}
