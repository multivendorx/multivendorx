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
                'icon'    => 'adminlib-cart',
                'slug'    => 'dashboard',
                'submenu' => array(),
                'capability' => ['manage_users']
            ),
            'products' => array(
                'name'    => 'Products',
                'slug'    => 'products',
                'icon'    => 'adminlib-cart',
                'submenu' => array(
                    array(
                        'key'  => 'all-products',
                        'name' => 'All Products',
                        'slug' => 'all-products',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    array(
                        'key'  => 'add-product',
                        'name' => 'Add Product',
                        'slug' => 'add-product',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'upload_files']
                    )
                    ),
                'capability' => ['manage_products']
            ),
            'orders' => array(
                'name'    => 'Orders',
                'slug'    => 'orders',
                'icon'    => 'adminlib-cart',
                'submenu' => array(
                    array(
                        'key'  => 'all-orders',
                        'name' => 'All Orders',
                        'slug' => 'all-orders',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    )
                ),
                'capability' => ['read_shop_orders']

            ),
            'coupons' => array(
                'name'    => 'Coupons',
                'slug'    => 'coupons',
                'submenu' => array(
                    array(
                        'key'  => 'all-coupons',
                        'name' => 'All Coupons',
                        'slug' => 'all-coupons',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'add-coupons',
                        'name' => 'Add Coupons',
                        'slug' => 'add-coupons',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    )
                ),
                'capability' => ['read_shop_coupons']
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