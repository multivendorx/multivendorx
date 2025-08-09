<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Dashboard_Controller extends \WP_REST_Controller {
    /**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'multivendorx/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'endpoints';

    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
            ],
        ] );
    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' );
    }

    public function get_items( $request ) {
        $endpoints = $this->all_endpoints();
        return rest_ensure_response($endpoints);
    }

    public function all_endpoints() {
        // Default endpoints
        $all_endpoints = array(
            'dashboard' => array(
                'name'    => 'Dashboard',
                'slug'    => 'dashboard',
                'submenu' => array()
            ),
            'products' => array(
                'name'    => 'Products',
                'slug'    => 'products',
                'submenu' => array(
                    array(
                        'key'  => 'all-products',
                        'name' => 'All Products',
                        'slug' => 'all-products',
                    ),
                    array(
                        'key'  => 'add-product',
                        'name' => 'Add Product',
                        'slug' => 'add-product',
                    )
                )
            ),
            'orders' => array(
                'name'    => 'Orders',
                'slug'    => 'orders',
                'submenu' => array(
                    array(
                        'key'  => 'all-orders',
                        'name' => 'All Orders',
                        'slug' => 'all-orders',
                    )
                )
            ),
            'coupons' => array(
                'name'    => 'Coupons',
                'slug'    => 'coupons',
                'submenu' => array(
                    array(
                        'key'  => 'all-coupons',
                        'name' => 'All Coupons',
                        'slug' => 'all-coupons',
                    ),
                    array(
                        'key'  => 'add-coupons',
                        'name' => 'Add Coupons',
                        'slug' => 'add-coupons',
                    )
                )
            ),
        );

        $saved_endpoints = MultiVendorX()->setting->get_setting('menu_manager');

        if (!empty($saved_endpoints) && is_array($saved_endpoints)) {
            $visible_endpoints = array();
            foreach ($saved_endpoints as $key => $endpoint) {
                if (isset($endpoint['visible']) && $endpoint['visible']) {
                    $visible_endpoints[$key] = array_merge(
                        $all_endpoints[$key] ?? [],
                        $endpoint
                    );
                }
            }
            return $visible_endpoints;
        }

        return $all_endpoints;
    }

}