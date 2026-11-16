<?php
/**
 * Notifima Rest API
 *
 * @package Notifima
 */

namespace Notifima\RestAPI;

use Notifima\RestAPI\Controllers\Settings;
use Notifima\RestAPI\Controllers\Subscribers;
use Notifima\SubscriptionForm as SubscriptionFormService;
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
				'permission_callback' => array( $this, 'notifima_permissions_check' ),
			)
        );

        register_rest_route(
            Notifima()->rest_namespace,
            '/subscription-form',
            array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_subscription_form' ),
				'permission_callback' => array( $this, 'notifima_permissions_check' ),
			)
        );
    }

    /**
     * Check if a given request has access to get items.
     */
    public function notifima_permissions_check() {
        return Utill::current_user_has_capability( 'manage_options' );
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

    /**
     * The subscription form for the settings preview.
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_REST_Response
     */
    public function get_subscription_form( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
        $form_id = SubscriptionFormService::form_id();

        // VuloForm is either on the site but switched off (activate it on the Plugins screen) or not
        // installed at all (search for it in the plugin directory).
        $installed = Utill::is_vuloform_installed();

        $available = SubscriptionFormService::is_available();

        return rest_ensure_response(
            array(
                'installed'  => $installed,
                'plugin_url' => $installed ? admin_url( 'plugins.php' ) : admin_url( 'plugin-install.php?s=VuloForm&tab=search&type=term' ),
                'available'  => $available,
                'form_id'    => $form_id,
                'edit_url'   => $form_id ? admin_url( 'admin.php?page=vuloform#&tab=forms&form=' . $form_id ) : '',
                'style_url'  => $available ? VuloForm()->plugin_url . 'assets/styles/public/vuloform-form.min.css' : '',
                'html'       => $form_id ? vuloform_render( $form_id ) : '',
            )
        );
    }
}
