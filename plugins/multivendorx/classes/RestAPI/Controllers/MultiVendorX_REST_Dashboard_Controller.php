<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Dashboard_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'endpoints';

    public function register_routes() {
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
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
                'icon'    => 'adminlib-module',
                'slug'    => 'dashboard',
                'submenu' => array(),
                'capability' => ['edit_products']
            ),            
            'store-settings' => array(
                'name'    => 'Store Settings',
                'slug'    => 'store-settings',
                'icon'    => 'adminlib-storefront',
                'submenu' => array(
                    array(
                        'key'  => 'storefront',
                        'name' => 'Storefront',
                        'slug' => 'storefront',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    array(
                        'key'  => 'store-information',
                        'name' => 'Store Information',
                        'slug' => 'store-information',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'upload_files']
                    ),                    
                    array(
                        'key'  => 'payout-configuration',
                        'name' => 'Payout Configuration',
                        'slug' => 'payout-configuration',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'upload_files']
                    ),
                    array(
                        'key'  => 'shop-policies',
                        'name' => 'Shop Policies',
                        'slug' => 'shop-policies',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'upload_files']
                    ),
                    array(
                        'key'  => 'privacy',
                        'name' => 'Privacy',
                        'slug' => 'privacy',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'upload_files']
                    ),
                    ),
                'capability' => ['manage_products']
            ),
            'products' => array(
                'name'    => 'Products',
                'slug'    => 'products',
                'icon'    => 'adminlib-single-product',
                'submenu' => array(
                    array(
                        'key'  => 'products',
                        'name' => 'All Products',
                        'slug' => 'products',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    ),
                    array(
                        'key'  => 'add-product',
                        'name' => 'Edit Product',
                        'slug' => 'add-product',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    ),
                ),
                'capability' => ['manage_products']
            ),
            'orders' => array(
                'name'    => 'Orders',
                'slug'    => 'orders',
                'icon'    => 'adminlib-order',
                'submenu' => array(
                    array(
                        'key'  => 'all-orders',
                        'name' => 'All Orders',
                        'slug' => 'all-orders',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    ),
                    array(
                        'key'  => 'refund-requests',
                        'name' => 'Refund Requests',
                        'slug' => 'refund-requests',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    ),
                ),
                'capability' => ['read_shop_orders']

            ),
            'coupons' => array(
                'name'    => 'Coupons',
                'slug'    => 'coupons',
                'icon'    => 'adminlib-contact-form',
                'capability' => ['read_shop_coupons']
            ),
			'reports' => array(
                'name'    => 'Stats / Report',
                'slug'    => 'reports',
                'icon'    => 'adminlib-report',
                'submenu' => array(
                    array(
                        'key'  => 'overview',
                        'name' => 'Overview',
                        'slug' => 'overview',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'banking overview',
                        'name' => 'Banking Overview',
                        'slug' => 'banking overview',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    )
                ),
                'capability' => ['read_shop_coupons']
            ),
			'payments' => array(
                'name'    => 'Payments',
                'slug'    => 'payments',
                'icon'    => 'adminlib-payment',
                'submenu' => array(
                    array(
                        'key'  => 'withdrawl',
                        'name' => 'Withdrawal',
                        'slug' => 'withdrawl',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'history',
                        'name' => 'History',
                        'slug' => 'history',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key'  => 'refund',
                        'name' => 'Refund',
                        'slug' => 'refund',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    )
                ),
                'capability' => ['read_shop_coupons']
            ),
            'finance' => array(
                'name'    => 'Finance',
                'slug'    => 'finance',
                'icon'    => 'adminlib-finance',
                'submenu' => array(
                    array(
                        'key'  => 'transactions',
                        'name' => 'Transactions',
                        'slug' => 'transactions',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'commissions',
                        'name' => 'Commissions',
                        'slug' => 'commissions',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key'  => 'invoices',
                        'name' => 'Invoices',
                        'slug' => 'invoices',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key'  => 'taxes',
                        'name' => 'Taxes',
                        'slug' => 'taxes',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key'  => 'withdrawals',
                        'name' => 'Withdrawals',
                        'slug' => 'withdrawals',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    )
                ),
                'capability' => ['read_shop_coupons']
            ),
			 'store_support' => array(
                'name'    => 'Store Support',
                'icon'    => 'adminlib-customer-service',
                'slug'    => 'store-support',
                'submenu' =>  array(
                    array(
                        'key'  => 'support-tickets',
                        'name' => 'Support Tickets',
                        'slug' => 'support-tickets',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'customer-questions',
                        'name' => 'Customer Questions',
                        'slug' => 'customer-questions',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                ),
                'capability' => ['manage_users']
            ),
			 'knowledgebase' => array(
                'name'    => 'Reviews',
                'icon'    => 'adminlib-cart',
                'slug'    => 'reviews',
                'capability' => ['manage_users']
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
