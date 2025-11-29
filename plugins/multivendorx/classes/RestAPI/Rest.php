<?php

namespace MultiVendorX\RestAPI;

use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Orders_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Settings_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Dashboard_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Store_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Commission_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Status_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Products_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Notifications_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Payouts_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Transaction_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Reports_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Tour_Controller;
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Logs_Controller;

use MultiVendorX\Store\Store;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Store\StoreUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Rest class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Rest {

    private $container = array();
    public function __construct() {
        $this->init_classes();
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ), 10 );
        add_filter( 'woocommerce_rest_check_permissions', array( $this, 'give_permission' ), 10, 4 );
        add_filter( 'woocommerce_rest_shop_order_object_query', array( $this, 'filter_orders_by_store_id' ), 10, 2 );
        add_filter( 'woocommerce_rest_prepare_product_object', array( $this, 'add_store_data_to_product_response' ), 10, 3 );
        add_filter( 'woocommerce_rest_product_object_query', array( $this, 'filter_products_by_meta_exists' ), 10, 2 );
        add_filter( 'woocommerce_rest_shop_coupon_object_query', array( $this, 'filter_coupons_by_meta_exists' ), 10, 2 );
        add_filter( 'woocommerce_analytics_products_query_args', array( $this, 'filter_low_stock_by_meta_exists' ), 10, 1 );
        add_filter( 'woocommerce_rest_prepare_shop_order_object', array( $this, 'filter_orders_by_meta_exists' ), 10, 3 );
        add_filter( 'woocommerce_rest_prepare_shop_coupon_object', array( $this, 'filter_coupons_by_meta_exists_response' ), 10, 3 );
        add_filter( 'woocommerce_rest_pre_insert_shop_coupon_object', array( $this, 'fix_rest_coupon_status' ), 10, 3 );
    }

    /**
     * Add store data to WooCommerce product API response
     */
    public function add_store_data_to_product_response( $response, $product, $request ) {
        $product_id = $product->get_id();

        // Get store ID from product meta
        $store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );

        if ( $store_id ) {
            // Get store information
            $store      = new Store( $store_id );
            $store_name = $store->get( 'name' );
            $store_slug = $store->get( 'slug' );

            // Add store data to API response
            $response->data['store_name'] = $store_name ?: '';
            $response->data['store_slug'] = $store_slug ?: '';
            $response->data['store_id']   = $store_id;
        } else {
            $response->data['store_name'] = '';
            $response->data['store_slug'] = '';
            $response->data['store_id']   = '';
        }

        return $response;
    }

    /**
     * Ensure store meta is included in API queries
     */
    public function add_store_meta_to_api_query( $args, $request ) {
        // Make sure multivendorx_store_id meta is always included when needed
        if ( ! isset( $args['meta_query'] ) ) {
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

    public function filter_orders_by_store_id( $args, $request ) {
        $meta_key      = $request->get_param( 'meta_key' );
        $meta_value    = $request->get_param( 'value' );
        $refund_status = $request->get_param( 'refund_status' );

        if ( empty( $meta_key ) && empty( $refund_status ) ) {
            return $args;
        }

        $meta_query = array();

        // 🔹 Original store meta query (unchanged)
        if ( ! empty( $meta_key ) ) {
            $store_meta_query = array(
                'key'     => sanitize_key( $meta_key ),
                'compare' => $meta_value ? '=' : 'EXISTS',
            );

            if ( $meta_value ) {
                $store_meta_query['value'] = sanitize_text_field( $meta_value );
            }

            $meta_query[] = $store_meta_query;
        }

        // 🔹 New refund status meta query
        if ( ! empty( $refund_status ) ) {
            $meta_query[] = array(
                'key'     => '_customer_refund_order',
                'value'   => sanitize_text_field( $refund_status ),
                'compare' => '=',
            );
        }

        // 🔹 Merge all meta queries
        if ( isset( $args['meta_query'] ) ) {
            $args['meta_query']['relation'] = 'AND';
            $args['meta_query']             = array_merge( $args['meta_query'], $meta_query );
        } else {
            $args['meta_query'] = $meta_query;
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
            $meta_query = array();

            if ( isset( $request['value'] ) && ! empty( $request['value'] ) ) {
                // Filter for exact match
                $meta_query[] = array(
                    'key'     => 'multivendorx_store_id',
                    'value'   => sanitize_text_field( $request['value'] ),
                    'compare' => '=',
                );
            } else {
                // If no value, just check that the key exists
                $meta_query[] = array(
                    'key'     => 'multivendorx_store_id',
                    'compare' => 'EXISTS',
                );
            }

            // Merge with existing meta_query if present
            if ( isset( $args['meta_query'] ) ) {
                $args['meta_query']['relation'] = 'AND';
                $args['meta_query'][]           = $meta_query;
            } else {
                $args['meta_query'] = $meta_query;
            }
        }

        return $args;
    }


    public function filter_coupons_by_meta_exists( $args, $request ) {

        $meta_query = array();

        // Handle filtering by store ID (existing logic)
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

        // Handle filtering by discount_type (new addition)
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
                $args['meta_query']             = array_merge( $args['meta_query'], $meta_query );
            } else {
                $args['meta_query'] = $meta_query;
            }
        }

        return $args;
    }



    public function give_permission( $permission, $context, $object_id, $post_type ) {
        $current_user = wp_get_current_user();
        $user_id      = $current_user->ID;

        // Fetch custom user meta
        $active_store = get_user_meta( $user_id, 'multivendorx_active_store', true );

        // Get all users for that store
        $users = StoreUtil::get_store_users( $active_store );

        if ( is_array( $users ) && in_array( $user_id, $users['users'] ) ) {
            return true;
        }

        return $permission; // fallback to default
    }

    public function filter_orders_by_meta_exists( $response, $object, $request ) {
        $store_id = $object->get_meta( 'multivendorx_store_id' );

        if ( $store_id ) {
            // Get store information
            $store      = new Store( $store_id );
            $store_name = $store->get( 'name' );
            $store_slug = $store->get( 'slug' );

            // Add store data to API response
            $response->data['store_name'] = $store_name ?: '';
            $response->data['store_slug'] = $store_slug ?: '';
            $response->data['store_id']   = $store_id;
        }

        $commission_id = $object->get_meta( 'multivendorx_commission_id' );

        if ( $commission_id ) {
            $commission = CommissionUtil::get_commission_db( $commission_id );

            if ( $commission && ! empty( $commission->ID ) ) {
                // Add only commission amounts to API response
                $response->data['commission_amount'] = (float) $commission->store_earning;
                $response->data['commission_total']  = (float) $commission->store_payable;
            }
        }

        $refund_items = array();

        foreach ( $object->get_items() as $item_id => $item ) {
            $refunded_line_total = -1 * $object->get_total_refunded_for_item( $item_id );
            $refunded_tax        = 0;
            foreach ( $object->get_refunds() as $refund ) {
                foreach ( $refund->get_items() as $refund_item ) {
                    if ( $refund_item->get_meta( '_refunded_item_id' ) == $item_id ) {
                        $refunded_tax += array_sum( $refund_item->get_taxes()['total'] ?? array() );
                    }
                }
            }

            $refund_items[] = array(
                'item_id'             => $item_id,
                'type'                => 'product',
                'name'                => $item->get_name(),
                'refunded_line_total' => (float) $refunded_line_total,
                'refunded_tax'        => (float) $refunded_tax,
            );
        }

        foreach ( $object->get_items( 'shipping' ) as $item_id => $item ) {
            $refunded_shipping = -1 * $object->get_total_refunded_for_item( $item_id, 'shipping' );

            $refunded_shipping_tax = 0;
            foreach ( $object->get_refunds() as $refund ) {
                foreach ( $refund->get_items( 'shipping' ) as $refund_item ) {
                    if ( $refund_item->get_meta( '_refunded_item_id' ) == $item_id ) {
                        $refunded_shipping_tax += array_sum( $refund_item->get_taxes()['total'] ?? array() );
                    }
                }
            }

            $refund_items[] = array(
                'item_id'               => $item_id,
                'type'                  => 'shipping',
                'name'                  => $item->get_name(),
                'refunded_shipping'     => (float) $refunded_shipping,
                'refunded_shipping_tax' => (float) $refunded_shipping_tax,
            );
        }

        $response->data['refund_items'] = $refund_items;

        $order_notes                   = wc_get_order_notes( array( 'order_id' => $object->get_id() ) );
        $response->data['order_notes'] = $order_notes;

        return $response;
    }

    public function filter_coupons_by_meta_exists_response( $response, $object, $request ) {
        $store_id = $object->get_meta( 'multivendorx_store_id' );
        if ( $store_id ) {
            // Get store information
            $store      = new Store( $store_id );
            $store_name = $store->get( 'name' );
            $store_slug = $store->get( 'slug' );

            // Add store data to API response
            $response->data['store_name'] = $store_name ?: '';
            $response->data['store_slug'] = $store_slug ?: '';
            $response->data['store_id']   = $store_id;
        }

        return $response;
    }

    public function fix_rest_coupon_status( $coupon, $request, $creating ) {

        if ( isset( $request['status'] ) ) {
            $status = sanitize_text_field( $request['status'] );

            $allowed = array( 'publish', 'draft', 'pending', 'private' );

            if ( in_array( $status, $allowed, true ) ) {

                // Save to the post directly (WORKS 100%)
                wp_update_post(
                    array(
						'ID'          => $coupon->get_id(),
						'post_status' => $status,
                    )
                );
            }
        }

        return $coupon;
    }



    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->container = array(
            'settings'      => new MultiVendorX_REST_Settings_Controller(),
            'dashboard'     => new MultiVendorX_REST_Dashboard_Controller(),
            'store'         => new MultiVendorX_REST_Store_Controller(),
            'commission'    => new MultiVendorX_REST_Commission_Controller(),
            'status'        => new MultiVendorX_REST_Status_Controller(),
            'payouts'       => new MultiVendorX_REST_Payouts_Controller(),
            'transaction'   => new MultiVendorX_REST_Transaction_Controller(),
            'report'        => new MultiVendorX_REST_Reports_Controller(),
            'notifications' => new MultiVendorX_REST_Notifications_Controller(),
            'tour'          => new MultiVendorX_REST_Tour_Controller(),
            'logs'          => new MultiVendorX_REST_Logs_Controller(),
        );
    }

    /**
     * Register REST API routes.
     */
    public function register_rest_routes() {

        register_meta(
            'comment',
            'store_rating',
            array(
				'type'         => 'number',
				'single'       => true,
				'show_in_rest' => true, // important to show in REST API
				'description'  => 'Customer rating for the store',
			)
        );

        // Register store_rating_id meta
        register_meta(
            'comment',
            'store_rating_id',
            array(
				'type'         => 'number',
				'single'       => true,
				'show_in_rest' => true,
				'description'  => 'Store ID associated with the rating',
			)
        );

        register_meta(
            'user',
            'multivendorx_dashboard_tasks',
            array(
				'type'         => 'array',
				'single'       => true,
				'show_in_rest' => array(
					'schema'        => array(
						'type'  => 'array',
						'items' => array( 'type' => 'string' ),
					),
					'auth_callback' => function () {
						return current_user_can( 'edit_users' );
					},
				),
			)
        );

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
