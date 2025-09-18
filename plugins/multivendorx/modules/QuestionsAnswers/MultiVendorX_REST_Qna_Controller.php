<?php

namespace MultiVendorX\QuestionsAnswers;
use MultiVendorX\QuestionsAnswers\Util;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Qna_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'qna';

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

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
        return current_user_can( 'read' );
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'create_stores' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('edit_stores');
    }


    // GET 
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
    
        // Count only
        if ( $request->get_param( 'count' ) ) {
            $total_count = Util::get_question_information( [
                'count' => true,
            ] );
            return rest_ensure_response( (int) $total_count );
        }
    
        $questions = Util::get_question_information( [
            'limit'  => $limit,
            'offset' => $offset,
        ] );
    
        // Format response with product details
        $formatted = array_map( function( $q ) {
            $product = wc_get_product( $q['product_id'] );
    
            return [
                'id'              => (int) $q['id'],
                'product_id'      => (int) $q['product_id'],
                'product_name'    => $product ? $product->get_name() : '',
                'product_link'    => $product ? get_permalink( $product->get_id() ) : '',
                'question_text'   => $q['question_text'],
                'answer_text'     => $q['answer_text'],
                'question_by'     => (int) $q['question_by'],
                'author_name'     => get_the_author_meta( 'display_name', $q['question_by'] ),
                'question_date'   => $q['question_date'],
                'time_ago'        => human_time_diff( strtotime( $q['question_date'] ), current_time( 'timestamp' ) ) . ' ago',
                'total_votes'     => (int) $q['total_votes'],
                'question_visibility' => $q['question_visibility'],
            ];
        }, $questions );
    
        return rest_ensure_response( $formatted );
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
                [ 'status' => 403 ]
            );
        }
    
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error( 'invalid_id', __( 'Invalid ID', 'multivendorx' ), [ 'status' => 400 ] );
        }
    
        $q = reset(Util::get_question_information( [ 'id' => $id ] ));
        if ( ! $q ) {
            return new \WP_Error( 'not_found', __( 'Question not found', 'multivendorx' ), [ 'status' => 404 ] );
        }
    
        $product = wc_get_product( $q['product_id'] );
    
        $data = [
            'id'              => (int) $q['id'],
            'product_id'      => (int) $q['product_id'],
            'product_name'    => $product ? $product->get_name() : '',
            'product_link'    => $product ? get_permalink( $product->get_id() ) : '',
            'question_text'   => $q['question_text'],
            'answer_text'     => $q['answer_text'],
            'question_by'     => (int) $q['question_by'],
            'author_name'     => get_the_author_meta( 'display_name', $q['question_by'] ),
            'question_date'   => $q['question_date'],
            'time_ago'        => human_time_diff( strtotime( $q['question_date'] ), current_time( 'timestamp' ) ) . ' ago',
            'total_votes'     => (int) $q['total_votes'],
            'question_visibility' => $q['question_visibility'],
        ];
    
        return rest_ensure_response( $data );
    }
    
    public function update_item( $request ) {
        $id   = absint( $request->get_param( 'id' ) );

    }
}