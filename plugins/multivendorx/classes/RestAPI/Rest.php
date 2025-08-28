<?php

namespace MultiVendorX\RestAPI;

use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Orders_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Settings_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Dashboard_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Store_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Commission_Controller;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Rest class
 *
 * @version		PRODUCT_VERSION
 * @package		MultivendorX
 * @author 		MultiVendorX
 */
class Rest {

    private $container = array();
    public function __construct() {
        $this->init_classes();
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ), 10 );
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->container = array(
            'orders'    => new MultiVendorX_REST_Orders_Controller(),
            'settings'  => new MultiVendorX_REST_Settings_Controller(),
            'dashboard' => new MultiVendorX_REST_Dashboard_Controller(),
            'store'     => new MultiVendorX_REST_Store_Controller(),
            'commission'=> new MultiVendorX_REST_Commission_Controller(),
        );
    }

    /**
     * Register REST API routes.
     */
    public function register_rest_routes() {
        foreach ( $this->container as $controller ) {
            if ( method_exists( $controller, 'register_routes' ) ) {
                $controller->register_routes();
            }
        }
    }

    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

}