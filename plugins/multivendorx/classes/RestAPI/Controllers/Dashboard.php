<?php
/**
 * Class Dashboard
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Dashboard Controller.
 *
 * @class       Dashboard class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Dashboard extends \WP_REST_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'endpoints';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'create_stores' );
    }

    /**
     * Get all items.
     *
     * @param object $request Full details about the request.
     */
    public function get_items( $request ) {
        $menu_only = $request->get_param( 'menuOnly' );

        $endpoints = $this->all_endpoints( $menu_only );

        $other_endpoints = apply_filters(
            'dashboard_other_endpoints',
            array(
                'view-notifications' => array(
                    'name'       => '',
                    'icon'       => '',
                    'slug'       => 'view-notifications',
                    'submenu'    => array(),
                    'capability' => array( 'edit_products' ),
                    'filename'   => 'view-notifications',
                ),
            )
        );

        if ( ! $menu_only ) {
            $endpoints = array_merge( $endpoints, $other_endpoints );
        }
        return rest_ensure_response( $endpoints );
    }

    /**
     * Get all endpoints.
     *
     * @param bool $menu_only Whether the function is called from the admin settings or the dashboard.
     * @return array
     */
    public function all_endpoints( $menu_only = false ) {
        // Default endpoints.
        $all_endpoints = array(
            'dashboard'     => array(
                'name'       => 'Dashboard',
                'icon'       => 'adminfont-module',
                'slug'       => '',
                'submenu'    => array(),
                'capability' => array( 'create_stores' ),
            ),
            'products'      => array(
                'name'       => 'Products',
                'slug'       => 'products',
                'icon'       => 'adminfont-single-product',
                'submenu'    => array(),
                'capability' => array( 'read_products' ),
            ),
            'coupons'       => array(
                'name'       => 'Coupons',
                'slug'       => 'coupons',
                'icon'       => 'adminfont-coupon',
                'capability' => array( 'read_shop_coupons' ),
            ),
            'sales'         => array(
                'name'       => 'Sales',
                'slug'       => 'sales',
                'icon'       => 'adminfont-sales',
                'submenu'    => array(
                    array(
                        'key'        => 'orders',
                        'name'       => 'Orders',
                        'slug'       => 'orders',
                        'capability' => array( 'view_shop_orders', 'edit_shop_orders', 'delete_shop_orders', 'add_shop_orders_note' ),
                    ),
                    array(
                        'key'        => 'refund',
                        'name'       => 'Refund',
                        'slug'       => 'refund',
                        'capability' => array( 'view_shop_orders', 'edit_shop_orders' ),
                        'module'     => array('marketplace-refund'),
                    ),
                    array(
                        'key'        => 'commissions',
                        'name'       => 'Commissions',
                        'slug'       => 'commissions',
                        'capability' => array( 'view_commission_history' ),
                    ),
                ),
                'capability' => array( 'view_shop_orders', 'view_commission_history' ),

            ),
            'wallet'        => array(
                'name'       => 'Wallet',
                'icon'       => 'adminfont-wallet',
                'slug'       => 'wallet',
                'submenu'    => array(
                    array(
                        'key'        => 'transactions',
                        'name'       => 'Transactions',
                        'slug'       => 'transactions',
                        'capability' => array( 'read_shop_earning', 'view_transactions' ),
                    ),
                    array(
                        'key'        => 'withdrawls',
                        'name'       => 'Withdrawls',
                        'slug'       => 'withdrawls',
                        'capability' => array( 'read_shop_earning', 'edit_withdrawl_request' ),
                    ),
                ),
                'capability' => array( 'edit_withdrawl_request' ),
            ),

            'store_support' => array(
                'name'       => 'Store Support',
                'icon'       => 'adminfont-customer-service',
                'slug'       => 'store-support',
                'submenu'    => array(
                    array(
                        'key'        => 'support-tickets',
                        'name'       => 'Support Tickets',
                        'slug'       => 'support-tickets',
                        'capability' => array( 'view_support_tickets', 'reply_support_tickets' ),
                        'module'     => array('customer-support'),
                    ),
                    array(
                        'key'        => 'customer-questions',
                        'name'       => 'Customer Questions',
                        'slug'       => 'customer-questions',
                        'capability' => array( 'view_customer_questions', 'reply_customer_questions' ),
                        'module'     => array('question-answer'),
                    ),
                    array(
                        'key'        => 'store-followers',
                        'name'       => 'Store Followers',
                        'slug'       => 'store-followers',
                        'capability' => array( 'view_store_followers' ),
                        'module'     => array('follow-store'),
                    ),
                    array(
                        'key'        => 'store-review',
                        'name'       => 'Store Review',
                        'slug'       => 'store-review',
                        'capability' => array( 'view_store_reviews', 'reply_store_reviews' ),
                        'module'     => array('store-review'),
                    ),
                ),
                'capability' => array( 'view_support_tickets' ),
            ),
            'reports'       => array(
                'name'       => 'Stats / Report',
                'slug'       => 'reports',
                'icon'       => 'adminfont-report',
                'submenu'    => array(
                    array(
                        'key'        => 'overview',
                        'name'       => 'Overview',
                        'slug'       => 'overview',
                        'capability' => array( 'view_store_reports', 'export_store_reports' ),
                    ),
                ),
                'capability' => array( 'read_shop_coupons' ),
            ),
            'resources'     => array(
                'name'       => 'Resources',
                'icon'       => 'adminfont-resources',
                'slug'       => 'resources',
                'submenu'    => array(
                    array(
                        'key'        => 'documentation',
                        'name'       => 'Documentation',
                        'slug'       => 'documentation',
                        'capability' => array( 'view_documentation' ),
                        'module'     => array('knowladgebase'),
                    ),
                    array(
                        'key'        => 'tools',
                        'name'       => 'Tools',
                        'slug'       => 'tools',
                        'capability' => array( 'access_tools' ),
                    ),
                ),
                'capability' => array( 'view_documentation' ),
            ),
            'setup-wizard'       => array(
                'name'       => 'Setup Wizard',
                'slug'       => '',
                'icon'       => 'adminfont-report',
                'submenu'    => array(),
                'capability' => array( 'read_shop_coupons' ),
            ),
            'settings'      => array(
                'name'       => 'Settings',
                'slug'       => 'settings',
                'icon'       => 'adminfont-setting',
                'capability' => array( 'manage_store_settings' ),
            ),
        );

        $saved_endpoints = MultiVendorX()->setting->get_setting( 'menu_manager' );

        if ( $menu_only && ! empty( $saved_endpoints ) ) {
            return $saved_endpoints;
        }

        if ( is_array( $saved_endpoints ) ) {
            $visible_endpoints = array();
            foreach ( $saved_endpoints as $key => $endpoint ) {
                if ( ! empty( $endpoint['visible'] && $endpoint['visible'] ) ) {
                    $visible_endpoints[ $key ] = array_merge(
                        $all_endpoints[ $key ] ?? array(),
                        $endpoint
                    );
                }
            }
            return $visible_endpoints;
        }

        return $all_endpoints;
    }
}
