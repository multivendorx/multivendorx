<?php
/**
 * Notifima Rest API
 *
 * @package Notifima
 */

namespace Notifima\RestAPI;

use Notifima\RestAPI\Controllers\Settings;
use Notifima\RestAPI\Controllers\Subscribers;
use Notifima\Utill;


defined( 'ABSPATH' ) || exit;

/**
 * Notifima Main Rest class
 *
 * @version     PRODUCT_VERSION
 * @class       Rest class
 * @author      MultiVendorX
 */
class Rest {

    /**
     * Container for all our classes
     *
     * @var array
     */
    private $container = array();
    /**
     * Constructor
     */
    public function __construct() {
        $this->init_classes();
        add_action( 'rest_api_init', array( $this, 'register_rest_api_routes' ), 10 );
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->container = array(
            'settings'   => new Settings(),
            'subscriber' => new Subscribers(),
        );
    }
    /**
     * Register REST API routes.
     */
    public function register_rest_api_routes() {
        foreach ( $this->container as $controller ) {
            if ( method_exists( $controller, 'register_routes' ) ) {
                $controller->register_routes();
            }
        }

        register_rest_route(
            Notifima()->rest_namespace,
            '/stock-notification-form',
            array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_stock_notification_form' ),
				'permission_callback' => array( $this, 'notifima_permission' ),
			)
        );
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param object $request The REST request object.
     */
    public function notifima_permission( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Get stock notification form
     *
     * @param \WP_REST_Request $request The REST request object.
     */
    public function get_stock_notification_form( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }
        try {
            $product_id = $request->get_param( 'product_id' );

            // Start output buffering.
            ob_start();

            Notifima()->frontend->display_product_subscription_form( intval( $product_id ) );

            // Return the output.
            return rest_ensure_response( array( 'html' => ob_get_clean() ) );
        } catch ( \Exception $e ) {
			return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'notifima' ),
                array( 'status' => 500 )
            );
        }
    }
}
