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
     * Container for all our classes
     *
     * @var array
     */
    private $container = array();
    /**
     * Rest class constructor function
     */
    public function __construct() {
        $this->init_classes();
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'rest_api_init', array( $this, 'register_rest_apis' ) );
        }
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->container = array(
            'settings'          => new Settings(),
            'tour'              => new Tour(),
        );
    }

    /**
     * Register rest api
     *
     * @return void
     */
    public function register_rest_apis() {

        register_rest_route(
            CatalogX()->rest_namespace,
            '/buttons',
            array(
				'methods'             => 'GET',
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
            EnquiryModule::init()->frontend->add_enquiry_button( intval( $product_id ) );
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
