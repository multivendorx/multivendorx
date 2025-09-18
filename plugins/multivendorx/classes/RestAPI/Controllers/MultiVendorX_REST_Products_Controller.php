<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Products_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'products';

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

        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
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
            $pending_products_count = count( wc_get_products( array(
                'status'   => 'pending',
                'limit'    => -1,
                'return'   => 'ids',
                'meta_key' => 'multivendorx_store_id',
            ) ) );
    
            return rest_ensure_response( (int) $pending_products_count );
        }
    
        // Fetch pending products with pagination
        $pending_products = wc_get_products( array(
            'status'   => 'pending',
            'limit'    => $limit,
            'offset'   => $offset,
            'return'   => 'objects',
            'meta_key' => 'multivendorx_store_id',
        ) );
    
        $formatted_products = array();
        foreach ( $pending_products as $product ) {
            $formatted_products[] = apply_filters(
                'multivendorx_product',
                array(
                    'id'     => $product->get_id(),
                    'name'   => $product->get_name(),
                    'sku'    => $product->get_sku(),
                    'price'  => $product->get_price(),
                    'status' => $product->get_status(),
                )
            );
        }
    
        return rest_ensure_response( $formatted_products );
    }
    
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }

    }

    public function get_item( $request ) {
        $store_id = absint( $request->get_param( 'id' ) ); // store ID
    
        if ( ! $store_id ) {
            return rest_ensure_response([
                'pending' => 0,
                'draft'   => 0,
                'publish' => 0,
            ]);
        }
    
        // Define statuses
        $statuses = ['pending', 'draft', 'publish'];
        $counts = [];
    
        foreach ( $statuses as $status ) {
            $products = wc_get_products([
                'status'    => $status,
                'limit'     => -1,         
                'return'    => 'ids',      
                'meta_key'  => 'multivendorx_store_id',
                'meta_value'=> $store_id,
            ]);
    
            $counts[$status] = count($products);
        }
    
        return rest_ensure_response($counts);
    }
    

    public function update_item( $request ) {
        $id   = absint( $request->get_param( 'id' ) );

    }
}