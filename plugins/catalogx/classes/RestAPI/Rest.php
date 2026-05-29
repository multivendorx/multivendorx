<?php
/**
 * Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX\RestAPI;

use CatalogX\Enquiry\Module as EnquiryModule;
use CatalogX\Quote\Module as QuoteModule;

use CatalogX\RestAPI\Controllers\Settings;
use CatalogX\RestAPI\Controllers\Tour;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Rest class
 *
 * @class       Rest class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Rest {

    /**
     * Controllers for all our classes
     *
     * @var array
     */
    private $controllers = array();
    /**
     * Rest class constructor function
     */
    public function __construct() {
        $this->register_controllers();
        add_action( 'rest_api_init', array( $this, 'register_rest_api_routes' ), 10 );
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function register_controllers() {
        $this->controllers = array(
            'settings' => new Settings(),
            'tour'     => new Tour(),
        );
    }

    /**
     * Register rest api
     *
     * @return void
     */
    public function register_rest_api_routes() {

        foreach ( $this->controllers as $rest_controller ) {
            if ( method_exists( $rest_controller, 'register_routes' ) ) {
                $rest_controller->register_routes();
            }
        }

        register_rest_route(
            CatalogX()->rest_namespace,
            '/buttons',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_buttons' ),
                'permission_callback' => array( $this, 'catalogx_permission' ),
            )
        );
    }

    /**
     * Get the enquiry or quote button markup.
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_REST_Response The HTML response.
     */
    public function get_buttons( $request ) {
        $product_id  = $request->get_param( 'product_id' );
        $button_type = $request->get_param( 'button_type' );

        // Start output buffering.
        ob_start();

        if ( 'enquiry' === $button_type ) {
            EnquiryModule::init()->frontend->render_product_enquiry_button( intval( $product_id ) );
        }

        if ( 'quote' === $button_type ) {
            QuoteModule::init()->frontend->add_button_for_quote( intval( $product_id ) );
        }

        do_action( 'catalogx_get_buttons', $button_type, $product_id );

        // Return the output.
        return rest_ensure_response( array( 'html' => ob_get_clean() ) );
    }

    /**
     * Catalog rest api permission functions
     *
     * @return bool
     */
    public function catalogx_permission() {
        return current_user_can( 'manage_options' );
    }
}
