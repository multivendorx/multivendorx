<?php

namespace MultiVendorX\RestAPI;

use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Orders_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Settings_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Dashboard_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Store_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Commission_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Status_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Announcement_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Knowledge_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Products_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Coupons_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Payouts_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Transaction_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Reports_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Refund_Controller;
use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Rest class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */
class Rest {

    private $container = array();
    public function __construct() {
        $this->init_classes();
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ), 10 );
        add_filter('woocommerce_rest_check_permissions', array($this,'give_permission'), 10, 4);
        add_filter('woocommerce_rest_shop_order_object_query', array($this, 'filter_orders_by_store_id'), 10, 2);
        add_filter('woocommerce_rest_prepare_product_object', array($this, 'add_store_data_to_product_response'), 10, 3);
        add_filter('woocommerce_rest_product_object_query', array($this, 'filter_products_by_meta_exists'), 10, 2);
        add_filter('woocommerce_rest_shop_coupon_object_query', array($this, 'filter_coupons_by_meta_exists'), 10, 2);
        add_filter('woocommerce_analytics_products_query_args', array($this, 'filter_low_stock_by_meta_exists'), 10, 1);
    }

    /**
     * Add store data to WooCommerce product API response
     */
    public function add_store_data_to_product_response($response, $product, $request) {
        $product_id = $product->get_id();
        
        // Get store ID from product meta
        $store_id = get_post_meta($product_id, 'multivendorx_store_id', true);
        
        if ($store_id) {
            // Get store information
            $store      = new Store( $store_id );
            $store_name = $store->get('name');
            $store_name = $store->get('name');
            $store_slug = $store->get('slug');
            
            // Add store data to API response
            $response->data['store_name'] = $store_name ?: '';
            $response->data['store_slug'] = $store_slug ?: '';
            $response->data['store_id'] = $store_id;
        } else {
            $response->data['store_name'] = '';
            $response->data['store_slug'] = '';
            $response->data['store_id'] = '';
        }
        
        return $response;
    }
    
    /**
     * Ensure store meta is included in API queries
     */
    public function add_store_meta_to_api_query($args, $request) {
        // Make sure multivendorx_store_id meta is always included when needed
        if (!isset($args['meta_query'])) {
            $args['meta_query'] = array();
        }
        
        return $args;
    }

    public function filter_low_stock_by_meta_exists( $args ) {
        if ( isset( $request['meta_key'] ) && $request['meta_key'] === 'multivendorx_store_id' ) {
            
            // Build the meta query to check for the existence of the MultiVendorX key
            $meta_query = array(
                'key'     => 'multivendorx_store_id',
                'compare' => 'EXISTS',
            );
    
            if ( ! isset( $args['meta_query'] ) ) {
                $args['meta_query'] = array();
            }
            $args['meta_query'][] = $meta_query;
        }

        return $args;
    }

    /**
     * Filter orders dynamically by meta key and optionally by value
     */
    public function filter_orders_by_store_id( $args, $request ) {
        $meta_key   = $request->get_param('meta_key');
        $meta_value = $request->get_param('value');
    
        if ( empty( $meta_key ) ) {
            return $args;
        }
    
        $store_meta_query = [
            'key'     => sanitize_key( $meta_key ),
            'compare' => $meta_value ? '=' : 'EXISTS',
        ];
    
        if ( $meta_value ) {
            $store_meta_query['value'] = sanitize_text_field( $meta_value );
        }
    
        if ( isset( $args['meta_query'] ) ) {
            $args['meta_query']['relation'] = 'AND';
            $args['meta_query'][] = $store_meta_query;
        } else {
            $args['meta_query'] = [ $store_meta_query ];
        }
    
        return $args;
    }

    /**
     * Filter WooCommerce products by meta key existence.
     *
     * @param array           $args    WP_Query arguments.
     * @param WP_REST_Request $request REST API request object.
     * @return array Modified WP_Query arguments.
     */
    public function filter_products_by_meta_exists( $args, $request ) {
        if ( isset( $request['meta_key'] ) && $request['meta_key'] === 'multivendorx_store_id' ) {
    
            // Check if a value (store_id) was passed
            $meta_query = [];
    
            if ( isset( $request['value'] ) && ! empty( $request['value'] ) ) {
                //Filter for exact match
                $meta_query[] = [
                    'key'     => 'multivendorx_store_id',
                    'value'   => sanitize_text_field( $request['value'] ),
                    'compare' => '=',
                ];
            } else {
                //If no value, just check that the key exists
                $meta_query[] = [
                    'key'     => 'multivendorx_store_id',
                    'compare' => 'EXISTS',
                ];
            }
    
            // Merge with existing meta_query if present
            if ( isset( $args['meta_query'] ) ) {
                $args['meta_query']['relation'] = 'AND';
                $args['meta_query'][] = $meta_query;
            } else {
                $args['meta_query'] = $meta_query;
            }
        }
    
        return $args;
    }
    

    public function filter_coupons_by_meta_exists( $args, $request ) {

        $meta_query = array();
    
        //Handle filtering by store ID (existing logic)
        if ( isset( $request['meta_key'] ) && $request['meta_key'] === 'multivendorx_store_id' ) {
    
            if ( isset( $request['value'] ) && $request['value'] !== '' ) {
                $meta_query[] = array(
                    'key'     => 'multivendorx_store_id',
                    'value'   => sanitize_text_field( $request['value'] ),
                    'compare' => '=',
                );
            } else {
                $meta_query[] = array(
                    'key'     => 'multivendorx_store_id',
                    'compare' => 'EXISTS',
                );
            }
        }
    
        //Handle filtering by discount_type (new addition)
        if ( isset( $request['discount_type'] ) && ! empty( $request['discount_type'] ) ) {
            $meta_query[] = array(
                'key'     => 'discount_type',
                'value'   => sanitize_text_field( $request['discount_type'] ),
                'compare' => '=',
            );
        }
    
        // 3️⃣ Merge with existing meta_query if present
        if ( ! empty( $meta_query ) ) {
            if ( isset( $args['meta_query'] ) ) {
                $args['meta_query']['relation'] = 'AND';
                $args['meta_query'] = array_merge( $args['meta_query'], $meta_query );
            } else {
                $args['meta_query'] = $meta_query;
            }
        }
    
        return $args;
    }
    
    

    public function give_permission($permission, $context, $object_id, $post_type) {
        $current_user = wp_get_current_user();
        $user_id      = $current_user->ID;
    
        // Fetch custom user meta
        $active_store = get_user_meta($user_id, 'multivendorx_active_store', true);
        // Get all users for that store
        $users = StoreUtil::get_store_users($active_store);
        if (is_array($users) && in_array($user_id, $users['users'])) {
            return true;
        }
    
        return $permission; // fallback to default
    }
    
    
    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->container = array(
            'settings'  => new MultiVendorX_REST_Settings_Controller(),
            'dashboard' => new MultiVendorX_REST_Dashboard_Controller(),
            'store'     => new MultiVendorX_REST_Store_Controller(),
            'commission'=> new MultiVendorX_REST_Commission_Controller(),
            'status'    => new MultiVendorX_REST_Status_Controller(),
            'announcement' => new MultiVendorX_REST_Announcement_Controller(),
            'knowledge' => new MultiVendorX_REST_Knowledge_Controller(),
            'payouts'   => new MultiVendorX_REST_Payouts_Controller(),
            'transaction'=> new MultiVendorX_REST_Transaction_Controller(),
            'report'=> new MultiVendorX_REST_Reports_Controller(),
            'refund'=> new MultiVendorX_REST_Refund_Controller(),
        );
    }

    /**
     * Register REST API routes.
     */
    public function register_rest_routes() {
        
        register_meta('comment', 'store_rating', [
            'type' => 'number',
            'single' => true,
            'show_in_rest' => true, // important to show in REST API
            'description' => 'Customer rating for the store',
        ]);
    
        // Register store_rating_id meta
        register_meta('comment', 'store_rating_id', [
            'type' => 'number',
            'single' => true,
            'show_in_rest' => true,
            'description' => 'Store ID associated with the rating',
        ]);

        register_meta('user', 'multivendorx_dashboard_tasks', [
            'type' => 'array',
            'single' => true,
            'show_in_rest' => [
                'schema' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'auth_callback' => function() {
                    return current_user_can('edit_users');
                }
            ]
        ]);

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