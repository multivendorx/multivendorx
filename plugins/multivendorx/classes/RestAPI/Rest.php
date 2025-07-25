<?php

namespace MultiVendorX\RestAPI;

use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Orders_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Settings_Controller;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Rest class
 *
 * @version     PRODUCT_VERSION
 * @package     MultivendorX
 * @author      MultiVendorX
 */
class Rest {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ), 10 );
    }

    public function register_rest_routes() {
        $endpoints = $this->all_rest_endpoints();
        foreach ( $endpoints as $endpoint => $controller_class ) {
            $controller = new $controller_class();
            $controller->register_routes();
        }
    }

    public function all_rest_endpoints() {
        return array(
			'orders'   => MultiVendorX_REST_Orders_Controller::class,
			'settings' => MultiVendorX_REST_Settings_Controller::class,
		);
    }
}
