<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Transaction_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'transaction';

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
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $limit    = max( intval( $request->get_param( 'row' ) ), 10 );
        $page     = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset   = ( $page - 1 ) * $limit;
        $count    = $request->get_param( 'count' );
        $store_id = intval( $request->get_param( 'store_id' ) ); 
    
        global $wpdb;
        $table_name = "{$wpdb->prefix}" . Utill::TABLES['transaction'];
    
        // Return total count for store
        if ( $count && $store_id ) {
            $total_count = $wpdb->get_var(
                "SELECT COUNT(*) FROM $table_name WHERE store_id = {$store_id}"
            );
            return rest_ensure_response( (int) $total_count );
        }
    
        // Fetch store-specific transaction data
        if ( $store_id ) {
            $results = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id, created_at, narration, transaction_type, entry_type, amount, balance, status
                     FROM $table_name 
                     WHERE store_id = %d 
                     ORDER BY created_at DESC 
                     LIMIT %d OFFSET %d",
                    $store_id,
                    $limit,
                    $offset
                ),
                ARRAY_A
            );
    
            // Map results to frontend-friendly keys
            $formatted = array_map(function($row) {
                return [
                    'date'             => $row['created_at'],
                    'order_details'    => $row['narration'],
                    'transaction_type' => $row['transaction_type'],
                    'payment_mode'     => $row['entry_type'],
                    'credit'           => $row['entry_type'] === 'Cr' ? $row['amount'] : 0,
                    'debit'            => $row['entry_type'] === 'Dr' ? $row['amount'] : 0,
                    'balance'          => $row['balance'],
                    'status'           => $row['status'],
                ];
            }, $results);
    
            return rest_ensure_response( $formatted );
        }
    
        return rest_ensure_response([]);
    }
    
    
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }
       
    }

    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $store_id = absint( $request->get_param( 'id' ) );
    
        if ( ! $store_id ) {
            return rest_ensure_response( [
                'balance' => 0,
                'locking_balance' => 0
            ] );
        }
    
        global $wpdb;
        $table_name = "{$wpdb->prefix}" . Utill::TABLES['transaction'];
    
        // Fetch last transaction row for the store
        $last_transaction = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT balance, locking_balance 
                 FROM $table_name 
                 WHERE store_id = %d 
                 ORDER BY created_at DESC 
                 LIMIT 1",
                $store_id
            ),
            ARRAY_A
        );
    
        return rest_ensure_response([
            'balance'      => isset($last_transaction['balance']) ? $last_transaction['balance'] : 0,
            'locking_balance' => isset($last_transaction['locking_balance']) ? $last_transaction['locking_balance'] : 0,
        ]);
    }
    

    public function update_item( $request ) {
        
    }

}