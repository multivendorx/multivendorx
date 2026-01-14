<?php
/**
 * MultiVendorX Rest API
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI;

use MultiVendorX\RestAPI\Controllers\ImportDummyData;
use MultiVendorX\RestAPI\Controllers\Settings;
use MultiVendorX\RestAPI\Controllers\Dashboard;
use MultiVendorX\RestAPI\Controllers\Stores;
use MultiVendorX\RestAPI\Controllers\Commissions;
use MultiVendorX\RestAPI\Controllers\Status;
use MultiVendorX\RestAPI\Controllers\Notifications;
use MultiVendorX\RestAPI\Controllers\Transactions;
use MultiVendorX\RestAPI\Controllers\Tour;
use MultiVendorX\RestAPI\Controllers\Logs;
use MultiVendorX\RestAPI\Controllers\AI;

use MultiVendorX\Store\Store;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Rest class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
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
     * Constructor
     */
    public function __construct() {
        $this->init_classes();
        add_action( 'rest_api_init', array( $this, 'register_rest_api_routes' ), 10 );
        add_filter( 'woocommerce_rest_check_permissions', array( $this, 'grant_woocommerce_rest_permission' ), 10, 4 );
        add_filter( 'woocommerce_rest_shop_order_object_query', array( $this, 'query_shop_order_modify' ), 10, 2 );
        add_filter( 'woocommerce_rest_product_object_query', array( $this, 'query_product_modify' ), 10, 2 );
        add_filter( 'woocommerce_rest_shop_coupon_object_query', array( $this, 'query_shop_coupon_filter_meta' ), 10, 2 );
        add_filter( 'woocommerce_rest_prepare_product_object', array( $this, 'prepare_product_add_store_data' ), 10, 2 );
        add_filter( 'woocommerce_rest_prepare_shop_order_object', array( $this, 'prepare_shop_order_filter_meta' ), 10, 3 );
        add_filter( 'woocommerce_rest_prepare_shop_coupon_object', array( $this, 'prepare_shop_coupon_filter_meta' ), 10, 3 );
        add_filter( 'woocommerce_rest_pre_insert_shop_coupon_object', array( $this, 'pre_insert_shop_coupon_fix_status' ), 10, 3 );
        add_filter( 'woocommerce_analytics_products_query_args', array( $this, 'analytics_products_filter_low_stock_meta' ), 10, 1 );
        add_action( 'woocommerce_rest_insert_product_object', array( $this, 'generate_sku_data_in_product' ), 10, 3 );
    }


    /**
     * Add store data to WooCommerce product API response
     *
     * @param object $response API response.
     * @param object $product  Product object.
     */
    public function prepare_product_add_store_data( $response, $product ) {
        $product_id = $product->get_id();
        $store_id   = (int) get_post_meta(
            $product_id,
            Utill::POST_META_SETTINGS['store_id'],
            true
        );

        // Default response values
        $response->data['store_id']   = '';
        $response->data['store_name'] = '';
        $response->data['store_slug'] = '';

        if ( $store_id > 0 ) {
            $store = new Store( $store_id );

            $response->data['store_id']   = $store_id;
            $response->data['store_name'] = (string) $store->get( Utill::STORE_SETTINGS_KEYS['name'] );
            $response->data['store_slug'] = (string) $store->get( Utill::STORE_SETTINGS_KEYS['slug'] );
        }

        return $response;
    }

    /**
     * Filter low stock reports by meta key existence.
     *
     * @param array $args WP_Query arguments.
     */
    public function analytics_products_filter_low_stock_meta( $args ) {
        $meta_key = $args['meta_key'] ?? '';

        if ( Utill::POST_META_SETTINGS['store_id'] === $meta_key ) {
            $meta_query = array(
                'key'     => Utill::POST_META_SETTINGS['store_id'],
                'compare' => 'EXISTS',
            );

            $args['meta_query']   = $args['meta_query'] ?? array();
            $args['meta_query'][] = $meta_query;
        }

        return $args;
    }

    /**
     * Filter WooCommerce orders by meta key existence.
     *
     * @param array  $args    WP_Query arguments.
     * @param object $request REST API request object.
     */
    public function query_shop_order_modify( $args, $request ) {
        $meta_key      = $request->get_param( 'meta_key' ) ?? '';
        $meta_value    = $request->get_param( 'value' ) ?? '';
        $refund_status = $request->get_param( 'refund_status' ) ?? '';

        if ( empty( $meta_key ) && empty( $refund_status ) ) {
            return $args;
        }

        $args['meta_query'] = $args['meta_query'] ?? array();

        // Store meta filter
        if ( ! empty( $meta_key ) ) {
            $condition = array(
                'key'     => sanitize_key( $meta_key ),
                'compare' => ! empty( $meta_value ) ? '=' : 'EXISTS',
            );

            if ( ! empty( $meta_value ) ) {
                $condition['value'] = sanitize_text_field( $meta_value );
            }

            $args['meta_query'][] = $condition;
        }

        // Refund status filter
        if ( ! empty( $refund_status ) ) {
            $args['meta_query'][] = array(
                'key'     => '_customer_refund_order',
                'value'   => sanitize_text_field( $refund_status ),
                'compare' => '=',
            );
        }

        // Ensure relation when multiple meta queries exist
        if ( count( $args['meta_query'] ) > 1 && empty( $args['meta_query']['relation'] ) ) {
            $args['meta_query']['relation'] = 'AND';
        }

        return $args;
    }

    /**
     * Filter WooCommerce products by meta key existence.
     *
     * @param array $args    WP_Query arguments.
     * @param array $request REST API request object.
     * @return array Modified WP_Query arguments.
     */
    public function query_product_modify( $args, $request ) {
        $meta_key = $request['meta_key'] ?? '';

        if ( Utill::POST_META_SETTINGS['store_id'] !== $meta_key ) {
            return $args;
        }

        $value = $request['value'] ?? '';

        $meta_condition = array(
            'key' => Utill::POST_META_SETTINGS['store_id'],
        );

        if ( ! empty( $value ) ) {
            $meta_condition['value']   = sanitize_text_field( $value );
            $meta_condition['compare'] = '=';
        } else {
            $meta_condition['compare'] = 'EXISTS';
        }

        $args['meta_query']   = $args['meta_query'] ?? array();
        $args['meta_query'][] = $meta_condition;

        // Ensure relation is set when multiple meta queries exist
        if ( count( $args['meta_query'] ) > 1 && empty( $args['meta_query']['relation'] ) ) {
            $args['meta_query']['relation'] = 'AND';
        }

        $category = $request->get_param( 'cat' );
        $operator = strtoupper( $request->get_param( 'operator' ) ?: 'IN' );

        if ( ! empty( $category ) ) {
            $slugs = array_map( 'sanitize_title', explode( ',', $category ) );

            $args['tax_query'][] = array(
                'taxonomy' => 'product_cat',
                'field'    => 'slug',
                'terms'    => $slugs,
                'operator' => in_array( $operator, array( 'IN', 'NOT IN' ), true )
                    ? $operator
                    : 'IN',
            );
        }

        $store_slug = $request->get_param( 'store_slug' );

        if ( ! empty( $store_slug ) ) {
            $store = StoreUtil::get_store_information(
                array(
					'slug' => sanitize_text_field( $store_slug ),
                )
            );

            // Safely get first store row
            $store_row = is_array( $store ) ? reset( $store ) : null;

            if ( ! empty( $store_row ) && ! empty( $store_row['ID'] ) ) {
                $args['meta_query'][] = array(
                    'key'     => Utill::POST_META_SETTINGS['store_id'],
                    'value'   => (string) $store_row['ID'],
                    'compare' => '=',
                );
            }
        }

        return $args;
    }


    /**
     * Filter WooCommerce coupons by meta key existence.
     *
     * @param array $args    WP_Query arguments.
     * @param array $request REST API request object.
     */
    public function query_shop_coupon_filter_meta( $args, $request ) {
        $meta_query = array();
        $meta_key   = $request['meta_key'] ?? '';
        $value      = $request['value'] ?? '';

        // Filter by store ID
        if ( Utill::POST_META_SETTINGS['store_id'] === $meta_key ) {
            $condition = array(
                'key' => Utill::POST_META_SETTINGS['store_id'],
            );

            if ( ! empty( $value ) ) {
                $condition['value']   = sanitize_text_field( $value );
                $condition['compare'] = '=';
            } else {
                $condition['compare'] = 'EXISTS';
            }

            $meta_query[] = $condition;
        }

        // Filter by discount type
        $discount_type = $request['discount_type'] ?? '';

        if ( ! empty( $discount_type ) ) {
            $meta_query[] = array(
                'key'     => 'discount_type',
                'value'   => sanitize_text_field( $discount_type ),
                'compare' => '=',
            );
        }

        // Merge with existing meta_query
        if ( ! empty( $meta_query ) ) {
            $args['meta_query'] = $args['meta_query'] ?? array();

            foreach ( $meta_query as $condition ) {
                $args['meta_query'][] = $condition;
            }

            if ( count( $args['meta_query'] ) > 1 && empty( $args['meta_query']['relation'] ) ) {
                $args['meta_query']['relation'] = 'AND';
            }
        }

        $store_slug = $request->get_param( 'store_slug' );

        if ( ! empty( $store_slug ) ) {
            $store = StoreUtil::get_store_information(
                array(
					'slug' => sanitize_text_field( $store_slug ),
                )
            );

            // Safely get first store row
            $store_row = is_array( $store ) ? reset( $store ) : null;

            if ( ! empty( $store_row ) && ! empty( $store_row['ID'] ) ) {
                $args['meta_query'][] = array(
                    'key'     => Utill::POST_META_SETTINGS['store_id'],
                    'value'   => (string) $store_row['ID'],
                    'compare' => '=',
                );
            }
        }

        return $args;
    }

    /**
     * Give permission based on active store and user role.
     *
     * @param bool   $permission Current permission status.
     * @param string $context Request context.
     * @param int    $object_id Object ID.
     * @param string $post_type Post type.
     */
    public function grant_woocommerce_rest_permission( $permission, $context, $object_id, $post_type ) {
        $user_id = get_current_user_id();

        // Fetch custom user meta.
        $active_store = get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

        // Get all users for that store.
        $users = StoreUtil::get_store_users( $active_store );

        if ( is_array( $users ) && in_array( $user_id, $users['users'], true ) ) {
            return true;
        }

        return $permission; // Fallback to default.
    }

    /**
     * Filter WooCommerce orders by meta key existence.
     *
     * @param array  $response WP_REST_Response object.
     * @param object $object   Order object.
     * @param object $request  REST API request object.
     */
    public function prepare_shop_order_filter_meta( $response, $object, $request ) {

        $store_id = (int) $object->get_meta( Utill::POST_META_SETTINGS['store_id'] );

        if ( $store_id > 0 ) {
            $store = new Store( $store_id );

            $response->data['store_id']   = $store_id;
            $response->data['store_name'] = (string) $store->get( Utill::STORE_SETTINGS_KEYS['name'] );
            $response->data['store_slug'] = (string) $store->get( Utill::STORE_SETTINGS_KEYS['slug'] );
        }

        $commission_id = (int) $object->get_meta( Utill::ORDER_META_SETTINGS['commission_id'] );

        if ( $commission_id > 0 ) {
            $commission = CommissionUtil::get_commission_db( $commission_id );

            if ( ! empty( $commission->ID ) ) {
                $response->data['commission_amount'] = (float) $commission->store_earning;
                $response->data['commission_total']  = (float) $commission->store_payable;
            }
        }

        $refunds      = $object->get_refunds();
        $refund_items = array();

        // Product refunds
        foreach ( $object->get_items() as $item_id => $item ) {
            $refunded_tax = 0.0;

            foreach ( $refunds as $refund ) {
                foreach ( $refund->get_items() as $refund_item ) {
                    if ( (int) $refund_item->get_meta( '_refunded_item_id' ) === $item_id ) {
                        $refunded_tax += array_sum( $refund_item->get_taxes()['total'] ?? array() );
                    }
                }
            }

            $refund_items[] = array(
                'item_id'             => $item_id,
                'type'                => 'product',
                'name'                => $item->get_name(),
                'refunded_line_total' => (float) -1 * $object->get_total_refunded_for_item( $item_id ),
                'refunded_tax'        => (float) $refunded_tax,
            );
        }

        // Shipping refunds
        foreach ( $object->get_items( 'shipping' ) as $item_id => $item ) {
            $refunded_tax = 0.0;

            foreach ( $refunds as $refund ) {
                foreach ( $refund->get_items( 'shipping' ) as $refund_item ) {
                    if ( (int) $refund_item->get_meta( '_refunded_item_id' ) === $item_id ) {
                        $refunded_tax += array_sum( $refund_item->get_taxes()['total'] ?? array() );
                    }
                }
            }

            $refund_items[] = array(
                'item_id'               => $item_id,
                'type'                  => 'shipping',
                'name'                  => $item->get_name(),
                'refunded_shipping'     => (float) -1 * $object->get_total_refunded_for_item( $item_id, 'shipping' ),
                'refunded_shipping_tax' => (float) $refunded_tax,
            );
        }

        $response->data['refund_items'] = $refund_items;

        // Order notes
        $response->data['order_notes'] = wc_get_order_notes(
            array( 'order_id' => $object->get_id() )
        );

        return $response;
    }

    /**
     * Filter WooCommerce coupons by meta key existence.
     *
     * @param array  $response REST API response.
     * @param object $object   Coupon object.
     * @param array  $request  Request object.
     * @return array
     */
    public function prepare_shop_coupon_filter_meta( $response, $object, $request ) {
        $store_id = $object->get_meta( Utill::POST_META_SETTINGS['store_id'] );
        if ( $store_id ) {
            // Get store information.
            $store      = new Store( $store_id );
            $store_name = $store->get( Utill::STORE_SETTINGS_KEYS['name'] );
            $store_slug = $store->get( Utill::STORE_SETTINGS_KEYS['slug'] );

            // Add store data to API response.
            $response->data['store_name'] = $store_name ? $store_name : '';
            $response->data['store_slug'] = $store_slug ? $store_slug : '';
            $response->data['store_id']   = $store_id;
        }

        return $response;
    }

    /**
     * Fix coupon status when creating or updating via REST API.
     *
     * @param object $coupon   Coupon object.
     * @param array  $request  Request object.
     * @param bool   $creating  True when creating, false when updating.
     */
    public function pre_insert_shop_coupon_fix_status( $coupon, $request, $creating ) {

        $status = sanitize_text_field( $request['status'] ) ?? '';

	    if ( ! empty( $status ) ) {
            $allowed = array( 'publish', 'draft', 'pending', 'private' );

            if ( in_array( $status, $allowed, true ) ) {
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
     * Generate a product SKU based on its title
     *
     * @param object $product Product data.
     */
    protected function generate_product_sku( $product ) {
        if ( $product ) {
            switch ( MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
                case 'slugs':
                    $product_sku = $product->get_slug();
                    break;

                case 'ids':
                    $product_sku = $product->get_id();
                    break;

                default:
                    $product_sku = $product->get_sku();
            }
        }
        return $product_sku;
    }

    /**
     * Generate a variation SKU based on its attributes
     *
     * @param array $variation Variation data.
     */
    protected function generate_variation_sku( $variation = array() ) {
        if ( $variation ) {
            $variation_sku = '';
            if ( 'slugs' === MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
                switch ( MultiVendorX()->setting->get_setting( 'sku_generator_attribute_spaces', '' ) ) {
                    case 'underscore':
                        $variation['attributes'] = str_replace( ' ', '_', $variation['attributes'] );
                        break;

                    case 'dash':
                        $variation['attributes'] = str_replace( ' ', '-', $variation['attributes'] );
                        break;

                    case 'none':
                        $variation['attributes'] = str_replace( ' ', '', $variation['attributes'] );
                        break;
                }
                $separator     = apply_filters( 'multivendorx_sku_generator_attribute_separator', $this->get_sku_separator() );
                $variation_sku = implode( $separator, $variation['attributes'] );
                $variation_sku = str_replace( 'attribute_', '', $variation_sku );
            }
            if ( 'ids' === MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
                $variation_sku = $variation['variation_id'] ? $variation['variation_id'] : '';
            }
        }
        return $variation_sku;
    }

    /**
     * Get the separator used between parent / variation SKUs
     *
     * @return string
     */
    private function get_sku_separator() {
        return apply_filters( 'multivendorx_sku_separator', '-' );
    }

    /**
     * Save Variation SKU.
     *
     * @param int         $variation_id    Variation ID.
     * @param WC_Product  $parent_product  Parent product.
     * @param string|null $parent_sku      Optional parent SKU to use instead of the product's SKU.
     */
    protected function multivendorx_save_variation_sku( $variation_id, $parent_product, $parent_sku = null ) {
        $variation = wc_get_product( $variation_id );

        if ( ! $variation || ! $variation->is_type( 'variation' ) ) {
            return;
        }

        $parent_sku = $parent_sku ?? $parent_product->get_sku();

        if ( ! empty( $parent_sku ) ) {
            $variation_data = $parent_product->get_available_variation( $variation );
            if ( ! empty( $variation_data ) ) {
                $variation_sku = $this->generate_variation_sku( $variation_data );
                $sku           = $parent_sku . $this->get_sku_separator() . $variation_sku;

                try {
                    $sku = wc_product_generate_unique_sku( $variation_id, $sku );
                    $variation->set_sku( $sku );
                    $variation->save();
                } catch ( WC_Data_Exception $exception ) {
                    wc_add_notice( __( 'Variation SKU is not generated!', 'multivendorx' ), 'error' );
                }
            }
        }
    }

    /**
     * Save generated SKU
     *
     * @param object $product WC_Product object.
     */
    public function multivendorx_save_generated_sku( $product ) {
        if ( is_numeric( $product ) ) {
            $product = wc_get_product( absint( $product ) );
        }

        if ( ! $product ) {
            return;
        }

        if ( 'never' === MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
            return;
        }

        $product_sku = $this->generate_product_sku( $product );
        if ( $product->is_type( 'variable' ) ) {
            foreach ( $product->get_children() as $variation_id ) {
                $this->multivendorx_save_variation_sku(
                    $variation_id,
                    $product,
                    $product_sku
                );
            }
        }

        try {
            $product_sku = wc_product_generate_unique_sku( $product->get_id(), $product_sku );
            $product->set_sku( $product_sku );
            $product->save();
        } catch ( \WC_Data_Exception $exception ) {
            wc_add_notice( __( 'SKU is not generated!', 'multivendorx' ), 'error' );
        }
    }

    public function generate_sku_data_in_product( $product, $request, $creating ) {
        if ( $creating ) {
			return;
        }
        $this->multivendorx_save_generated_sku( $product );
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->container = array(
            'settings'      => new Settings(),
            'dashboard'     => new Dashboard(),
            'store'         => new Stores(),
            'commission'    => new Commissions(),
            'status'        => new Status(),
            'transaction'   => new Transactions(),
            'notifications' => new Notifications(),
            'tour'          => new Tour(),
            'logs'          => new Logs(),
            'ai_assistant'  => new AI(),
            'import_dummy_data' => new ImportDummyData(),
        );
    }

    /**
     * Register REST API routes.
     */
    public function register_rest_api_routes() {

        register_meta(
            'comment',
            'store_rating',
            array(
				'type'         => 'number',
				'single'       => true,
				'show_in_rest' => true, // Important to show in REST API.
				'description'  => 'Customer rating for the store',
			)
        );

        // Register store_rating_id meta.
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

    /**
     * Get REST API controller class.
     *
     * @param  string $class Class name to retrieve.
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }
}
