<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Coupons_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'coupons';

    public function register_routes() {
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'create_item' ],
                'permission_callback' => [ $this, 'create_item_permissions_check' ],
            ],
        ] );

        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'get_items_permissions_check'],
                'args'                => [
                    'id' => ['required' => true],
                ],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
            ],
        ]);
    }

    public function get_items_permissions_check($request) {
        // return current_user_can( 'read' );
        return true;
    }

     // POST permission
    public function create_item_permissions_check($request) {
        // return current_user_can( 'manage_options' );
        return true;
    }

    public function update_item_permissions_check($request) {
        // return current_user_can('manage_options');
        return true;
    }


    // GET 
    public function get_items( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        // Pagination
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $count  = $request->get_param( 'count' );
    
        // Count only
        if ( $count ) {
            $pending_coupons_count = count( get_posts( array(
                'post_type'   => 'shop_coupon',
                'post_status' => 'pending',
                'numberposts' => -1,
                'fields'      => 'ids', // only IDs
                'meta_key'    => 'multivendorx_store_id', // optional, if you want to filter by store
            ) ) );
    
            return rest_ensure_response( (int) $pending_coupons_count );
        }
    
        // Fetch pending coupons with pagination
        $pending_coupons = get_posts( array(
            'post_type'   => 'shop_coupon',
            'post_status' => 'pending',
            'posts_per_page' => $limit,
            'offset'      => $offset,
            'orderby'     => 'ID',
            'order'       => 'DESC',
            'meta_key'    => 'multivendorx_store_id', // optional
        ) );
    
        $formatted_coupons = array();
        foreach ( $pending_coupons as $coupon ) {
            $formatted_coupons[] = apply_filters(
                'multivendorx_coupon',
                array(
                    'id'     => (int) $coupon->ID,
                    'title'  => $coupon->post_title,
                    'code'   => get_post_meta( $coupon->ID, 'coupon_code', true ),
                    'amount' => get_post_meta( $coupon->ID, 'discount_amount', true ),
                    'status' => $coupon->post_status,
                )
            );
        }
    
        return rest_ensure_response( $formatted_coupons );
    }
    
    
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), [ 'status' => 403 ] );
        }
    
        $p = $request->get_json_params();
    
        // Insert coupon post directly
        $post_id = wp_insert_post([
            'post_title'   => sanitize_text_field($p['title'] ?? ''),
            'post_content' => sanitize_textarea_field($p['content'] ?? ''),
            'post_type'    => 'shop_coupon',
            'post_status'  => $p['status'] ?? 'publish',
        ], true);
    
        if ( is_wp_error($post_id) ) {
            return $post_id;
        }
    
        // Save meta directly (WooCommerce reads from postmeta)
        update_post_meta($post_id, 'discount_type', sanitize_text_field($p['discount_type'] ?? 'percent'));
        update_post_meta($post_id, 'coupon_amount', $p['coupon_amount'] ?? '');
        update_post_meta($post_id, 'date_expires', !empty($p['expiry_date']) ? strtotime($p['expiry_date']) : '');
        update_post_meta($post_id, 'free_shipping', ($p['free_shipping'] ?? '') === 'yes' ? 'yes' : 'no');
        update_post_meta($post_id, 'usage_limit', $p['usage_limit'] ?? '');
        update_post_meta($post_id, 'limit_usage_to_x_items', $p['limit_usage_to_x_items'] ?? '');
        update_post_meta($post_id, 'usage_limit_per_user', $p['usage_limit_per_user'] ?? '');
        update_post_meta($post_id, 'minimum_amount', $p['minimum_amount'] ?? '');
        update_post_meta($post_id, 'maximum_amount', $p['maximum_amount'] ?? '');
        update_post_meta($post_id, 'individual_use', ($p['individual_use'] ?? '') === 'yes' ? 'yes' : 'no');
        update_post_meta($post_id, 'exclude_sale_items', ($p['exclude_sale_items'] ?? '') === 'yes' ? 'yes' : 'no');
    
        // Arrays
        update_post_meta($post_id, 'product_ids', !empty($p['product_ids']) ? implode(',', array_map('intval',$p['product_ids'])) : '');
        update_post_meta($post_id, 'exclude_product_ids', !empty($p['exclude_product_ids']) ? implode(',', array_map('intval',$p['exclude_product_ids'])) : '');
        update_post_meta($post_id, 'product_categories', !empty($p['product_categories']) ? array_map('intval',$p['product_categories']) : []);
        update_post_meta($post_id, 'exclude_product_categories', !empty($p['exclude_product_categories']) ? array_map('intval',$p['exclude_product_categories']) : []);
        update_post_meta($post_id, 'customer_email', !empty($p['customer_email']) ? (is_array($p['customer_email']) ? $p['customer_email'] : explode(',', $p['customer_email'])) : []);
    
        // Store meta
        isset($p['store_id']) && update_post_meta($post_id, 'multivendorx_store_id', (int)$p['store_id']);
    
        return [
            'success'   => true,
            'coupon_id' => $post_id,
            'code'      => get_the_title($post_id),
        ];
    }
    
    

    public function get_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );

    }

    public function update_item( $request ) {
        $id   = absint( $request->get_param( 'id' ) );
        $data = $request->get_json_params();

 
    }
}