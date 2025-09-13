<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Knowledge_Controller extends \WP_REST_Controller {
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
	protected $rest_base = 'knowledge';

    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, [
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

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
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

        register_rest_route($this->namespace, '/' . $this->rest_base . '/bulk', [
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'bulk_update_items'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
            ],
        ]);
    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' );
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'manage_options' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('manage_options');
    }

    /**
     * Get knowledge base items based on filter options.
     *
     * Filters supported in $args:
     * - id, type, status, search
     * - condition (AND/OR), limit, offset
     *
     * @param array $args Filter options.
     * @return array|int List of matching items or count.
     */
    public static function get_knowledge_items( $args ) {
        global $wpdb;

        $type   = isset( $args['type'] ) ? sanitize_key( $args['type'] ) : 'multivendorx_kb';
        $status = isset( $args['status'] ) ? sanitize_key( $args['status'] ) : 'all';
        $limit  = isset( $args['limit'] ) ? intval( $args['limit'] ) : 10;
        $offset = isset( $args['offset'] ) ? intval( $args['offset'] ) : 0;
        $search = isset( $args['search'] ) ? sanitize_text_field( $args['search'] ) : '';

        $where = [ $wpdb->prepare( "post_type = %s", $type ) ];

        if ( $status !== 'all' ) {
            $where[] = $wpdb->prepare( "post_status = %s", $status );
        } else {
            $where[] = "post_status IN ('publish', 'pending')";
        }

        if ( ! empty( $search ) ) {
            $like = '%' . $wpdb->esc_like( $search ) . '%';
            $where[] = $wpdb->prepare( "(post_title LIKE %s OR post_content LIKE %s)", $like, $like );
        }

        $table = $wpdb->posts;
        $where_sql = ! empty( $where ) ? 'WHERE ' . implode( ' AND ', $where ) : '';

        // If only counting
        if ( isset( $args['count'] ) && $args['count'] ) {
            $query = "SELECT COUNT(*) FROM $table $where_sql";
            $results = $wpdb->get_var( $query ); // phpcs:ignore
            return intval( $results );
        }

        // Full data query
        $query = "
            SELECT ID, post_title, post_content, post_status, post_date
            FROM $table
            $where_sql
            ORDER BY post_date DESC
        ";

        $query = $wpdb->prepare($query);

        $results = $wpdb->get_results($query, ARRAY_A); // phpcs:ignore

        // Format
        $items = [];
        foreach ( $results as $row ) {
            $items[] = [
                'id'      => (int) $row['ID'],
                'title'   => $row['post_title'],
                'content' => $row['post_content'],
                'status'  => $row['post_status'],
                'date'    => $row['post_date'],
            ];
        }

        return $items;
    }

    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), [ 'status' => 403 ] );
        }

        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;

        $args = [
            'type'   => $request->get_param( 'type' ) ?: 'multivendorx_kb',
            'status' => $request->get_param( 'status' ) ?: 'all',
            'search' => $request->get_param( 'search' ),
            'limit'  => $limit,
            'offset' => $offset,
        ];

        // Data
        $items = self::get_knowledge_items( $args );

        // Counts
        $args_count = $args;
        unset( $args_count['limit'], $args_count['offset'] );
        $args_count['count'] = true;

        $total   = self::get_knowledge_items( $args_count );
        $publish = self::get_knowledge_items( array_merge( $args_count, [ 'status' => 'publish' ] ) );
        $pending = self::get_knowledge_items( array_merge( $args_count, [ 'status' => 'pending' ] ) );

        return rest_ensure_response( [
            'items'   => $items,
            'total'   => $total,
            'page'    => $page,
            'limit'   => $limit,
            'all'     => $total,
            'publish' => $publish,
            'pending' => $pending,
        ] );
    }
    
    public function create_item( $request ) {
        $data = $request->get_json_params();
    
        // Unwrap formData if present
        $formData = isset($data['formData']) ? $data['formData'] : $data;

        // Sanitize inputs
        $title   = isset($formData['title']) ? sanitize_text_field($formData['title']) : '';
        $content = isset($formData['content']) ? sanitize_textarea_field($formData['content']) : '';
        $status  = isset($formData['status']) && $formData['status'] === 'publish' ? 'publish' : 'pending';
    
        // Insert post
        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_content' => $content,
            'post_type'    => 'multivendorx_kb',
            'post_status'  => $status,
        ], true);
    
        if ( is_wp_error( $post_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $post_id->get_error_message(),
            ]);
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $post_id,
            'title'   => $title,
            'content' => $content,
            'status'  => $status,
        ]);
    }
    
    
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid KB ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    
        $post = get_post( $id );
        if ( ! $post || $post->post_type !== 'multivendorx_kb' ) {
            return new \WP_Error(
                'not_found',
                __( 'Knowledge Base article not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }
    
        $data    = $request->get_json_params();
        $title   = isset( $data['title'] ) ? sanitize_text_field( $data['title'] ) : $post->post_title;
        $content = isset( $data['content'] ) ? sanitize_textarea_field( $data['content'] ) : $post->post_content;
        $status  = isset( $data['status'] ) && $data['status'] === 'publish' ? 'publish' : 'pending';
    
        // Update the post
        $updated_post_id = wp_update_post([
            'ID'           => $id,
            'post_title'   => $title,
            'post_content' => $content,
            'post_status'  => $status,
        ], true);
    
        if ( is_wp_error( $updated_post_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $updated_post_id->get_error_message(),
            ]);
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $id,
            'title'   => $title,
            'content' => $content,
            'status'  => $status,
        ]);
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
    
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid KB ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    
        $post = get_post( $id );
        if ( ! $post || $post->post_type !== 'multivendorx_kb' ) {
            return new \WP_Error(
                'not_found',
                __( 'Knowledge Base article not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }
    
        $response = array(
            'id'      => $id,
            'title'   => $post->post_title,
            'content' => $post->post_content,
            'status'  => $post->post_status,
            'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
        );
    
        return rest_ensure_response( $response );
    }

    public function bulk_update_items($request) {
        $nonce = $request->get_header('X-WP-Nonce');
        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );
        }

        $params = $request->get_json_params();
        $action = isset($params['action']) ? sanitize_key($params['action']) : '' ;
        $ids = isset($params['ids']) ? array_map('absint', $params['ids']) : [];

        if (empty($action) || empty($ids)) {
            return new \WP_Error(
                'invalid_params',
                __('Missing action or IDs', 'multivendorx'),
                array('status' => 400)
            );
        }

        foreach ($ids as $id) {
            switch ($action) {
                case 'publish':
                case 'pending':
                    wp_update_post(['ID' => $id, 'post_status' => $action]);
                    break;
                case 'delete':
                    wp_delete_post($id, true);
                    break;
            }
        }

        return rest_ensure_response(['success' => true]);
    }
}