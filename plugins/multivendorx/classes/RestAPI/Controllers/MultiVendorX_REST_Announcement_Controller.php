<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Announcement_Controller extends \WP_REST_Controller {
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
	protected $rest_base = 'announcement';

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

        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;

        $type   = $request->get_param( 'type' ) ?: 'multivendorx_an';
        $status = $request->get_param( 'status' );

        // Build base query
        $query_args = [
            'post_type'      => $type,
            'posts_per_page' => $limit,
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
            'post_status'    => $status ? [$status] : ['publish', 'draft', 'pending', 'private'],
        ];

        $query = new \WP_Query( $query_args );

        $items = [];
        foreach ( $query->posts as $post ) {
            $id      = (int) $post->ID;
            $title   = $post->post_title;
            $content = $post->post_content;
            $status  = $post->post_status;
            $stores  = get_post_meta( $id, '_mvx_announcement_stores', true );

            $store_names = [];
            if ( is_array( $stores ) ) {
                foreach ( $stores as $store_id ) {
                    $store_obj = MultivendorX()->store->get_store_by_id( $store_id );
                    if ( $store_obj && ! empty( $store_obj->data['name'] ) ) {
                        $store_names[] = $store_obj->data['name'];
                    }
                }
            }

            $items[] = [
                'id'      => $id,
                'title'   => $title,
                'content' => $content,
                'status'  => $status,
                'stores'  => $store_names,
                'date'    => get_the_date( 'c', $post ),
            ];
        }

        // Counts
        $counts = wp_count_posts( $type );
        $response = [
            'items' => $items,
            'counts' => [
                'all'     => array_sum( (array) $counts ),
                'publish' => (int) $counts->publish,
                'pending' => (int) $counts->pending,
            ],
        ];

        return rest_ensure_response( $response );
    }
    
    
    
    
    public function create_item( $request ) {
        $data = $request->get_json_params();
    
        // Unwrap formData if present
        $formData = isset($data['formData']) ? $data['formData'] : $data;
    
        $title   = isset($formData['title']) ? sanitize_text_field($formData['title']) : '';
        $content = isset($formData['content']) ? sanitize_textarea_field($formData['content']) : '';
        $stores  = isset($formData['stores']) ? $formData['stores'] : [];
        if ( is_string( $stores ) ) {
            $stores = array_filter( array_map( 'trim', explode( ',', $stores ) ) );
        } elseif ( ! is_array( $stores ) ) {
            $stores = [];
        }
    
        // Insert post
        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_content' => $content,
            'post_type'    => 'multivendorx_an',
            'post_status'  => 'publish',
        ], true);
    
        if ( is_wp_error( $post_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $post_id->get_error_message(),
            ]);
        }
    
        // Save stores if provided
        if ( ! empty($stores) ) {
            update_post_meta( $post_id, '_mvx_announcement_stores', $stores );
        }
    
        // Optionally save URL as post meta
        if ( ! empty($url) ) {
            update_post_meta( $post_id, '_mvx_announcement_url', $url );
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $post_id,
            'title'   => $title,
            'url'     => $url,
            'content' => $content,
            'stores'  => $stores, // always array now
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
                __( 'Invalid announcement ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    
        $post = get_post( $id );
        if ( ! $post || $post->post_type !== 'multivendorx_an' ) {
            return new \WP_Error(
                'not_found',
                __( 'Announcement not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }
    
        $data = $request->get_json_params();
        $title   = isset( $data['title'] ) ? sanitize_text_field( $data['title'] ) : $post->post_title;
        $content = isset( $data['content'] ) ? sanitize_textarea_field( $data['content'] ) : $post->post_content;
        $url     = isset( $data['url'] ) ? esc_url_raw( $data['url'] ) : get_post_meta( $id, '_mvx_announcement_url', true );
        $stores  = isset( $data['stores'] ) ? $data['stores'] : get_post_meta( $id, '_mvx_announcement_stores', true );
    
        // Convert CSV to array if needed
        if ( is_string( $stores ) ) {
            $stores = array_filter( array_map( 'trim', explode( ',', $stores ) ) );
        } elseif ( ! is_array( $stores ) ) {
            $stores = [];
        }
    
        // Update the post
        $updated_post_id = wp_update_post([
            'ID'           => $id,
            'post_title'   => $title,
            'post_content' => $content,
        ], true);
    
        if ( is_wp_error( $updated_post_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $updated_post_id->get_error_message(),
            ]);
        }
    
        // Update URL meta
        update_post_meta( $id, '_mvx_announcement_url', $url );
    
        // Update stores meta
        update_post_meta( $id, '_mvx_announcement_stores', $stores );
    
        // Prepare response
        $store_data = [];
        foreach ( $stores as $store_id ) {
            $store_obj = MultivendorX()->store->get_store_by_id( $store_id );
            if ( $store_obj && ! empty( $store_obj->data['name'] ) ) {
                $store_data[] = [
                    'id'   => $store_id,
                    'name' => $store_obj->data['name'],
                ];
            }
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $id,
            'title'   => $title,
            'content' => $content,
            'url'     => $url,
            'stores'  => $store_data,
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
                __( 'Invalid announcement ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    
        $post = get_post( $id );
        if ( ! $post || $post->post_type !== 'multivendorx_an' ) {
            return new \WP_Error(
                'not_found',
                __( 'Announcement not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }
    
        $title   = $post->post_title;
        $content = $post->post_content;
        $url     = get_post_meta( $id, '_mvx_announcement_url', true );
        $stores  = get_post_meta( $id, '_mvx_announcement_stores', true );
    
        $store_data = array();
        if ( ! empty( $stores ) && is_array( $stores ) ) {
            foreach ( $stores as $store_id ) {
                $store_obj = MultivendorX()->store->get_store_by_id( $store_id );
                if ( $store_obj && ! empty( $store_obj->data['name'] ) ) {
                    $store_data[] = array(
                        'id'   => $store_id,
                        'name' => $store_obj->data['name'],
                    );
                }
            }
        }

        $response = array(
            'id'      => $id,
            'title'   => $title,
            'content' => $content,
            'url'     => $url,
            'stores'  => $store_data,
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