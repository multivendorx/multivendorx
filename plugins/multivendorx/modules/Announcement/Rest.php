<?php
/**
 * Modules REST API Announcement controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Announcement;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Announcement controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Rest extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'announcement';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

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
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ), // Only admins can delete.
				),
			)
        );
    }

    /**
     * Get items permissions check.
     *
     * @param object $request The request object.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' );// phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * Create item permissions check.
     *
     * @param object $request The request object.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Update item permissions check.
     *
     * @param object $request The request object.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Get all announcements.
     *
     * @param object $request The request object.
     */
    public function get_items( $request ) {
        // ----- Nonce Check -----
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            MultiVendorX()->util->log( $error );

            return $error;
        }

        try {
            // ----- Input Handling -----
            $limit        = max( 10, intval( $request->get_param( 'row' ) ) );
            $page         = max( 1, intval( $request->get_param( 'page' ) ) );
            $offset       = ( $page - 1 ) * $limit;
            $count_param  = $request->get_param( 'count' );
            $status_param = sanitize_key( $request->get_param( 'status' ) );
            $search_field = sanitize_text_field( $request->get_param( 'searchField' ) );

            $dates = Utill::normalize_date_range(
                $request->get_param( 'startDate' ),
                $request->get_param( 'endDate' )
            );

            $start_date = $dates['start_date'];
            $end_date   = $dates['end_date'];

            $dashboard      = $request->get_param( 'dashboard' );

            // ----- Count Only (FAST) -----
            if ( $count_param ) {
                $query = new \WP_Query(
                    array(
                        'post_type'      => Utill::POST_TYPES['announcement'],
                        'posts_per_page' => 1,
                        'fields'         => 'ids',
                        'post_status'    => 'any',
                        'no_found_rows'  => false,
                    )
                );
                return rest_ensure_response( intval( $query->found_posts ) );
            }

            // ----- Build Query -----
            $query_args = array(
                'post_type'      => Utill::POST_TYPES['announcement'],
                'posts_per_page' => $limit,
                'offset'         => $offset,
                'post_status'    => $status_param ? $status_param : 'any',
                'orderby'        => 'date',
                'order'          => 'DESC',
                'no_found_rows'  => false,
            );

            // ----- Store Filtering -----
            $store_id = intval( $request->get_param( 'store_id' ) );
            if ( $store_id > 0 ) {
                $query_args['meta_query'] = array(
                    'relation' => 'OR',
                    array(
                        'key'     => Utill::POST_META_SETTINGS['announcement_stores'],
                        'value'   => ';i:' . $store_id . ';',
                        'compare' => 'LIKE',
                    ),
                    array(
                        'key'     => Utill::POST_META_SETTINGS['announcement_stores'],
                        'value'   => ';i:0;',
                        'compare' => 'LIKE',
                    ),
                );
            }

            // ----- Date Filter -----
            if ( $start_date && $end_date ) {
                $query_args['date_query'] = array(
                    array(
                        'after'     => $start_date,
                        'before'    => $end_date,
                        'inclusive' => true,
                    ),
                );
            }

            // ----- Search Filter -----
            if ( ! empty( $search_field ) ) {
                $query_args['s'] = $search_field;
            }

            if ($dashboard) {
                if (get_transient('multivendorx_announcement_data_' . $store_id)) {
                    return get_transient('multivendorx_announcement_data_' . $store_id);
                }
            }

            // ----- Fetch Posts -----
            $posts = get_posts( $query_args );
            $items = array();

            foreach ( $posts as $post ) {
                $store_ids   = (array) get_post_meta( $post->ID, Utill::POST_META_SETTINGS['announcement_stores'], true );
                $store_names = array();

                foreach ( $store_ids as $sid ) {
                    $store_obj = MultivendorX()->store->get_store( $sid );
                    if ( $store_obj ) {
                        $store_names[] = $store_obj->get( 'name' );
                    }
                }

                $items[] = array(
                    'id'         => $post->ID,
                    'title'      => $post->post_title,
                    'content'    => $post->post_content,
                    'store_name' => implode( ', ', $store_names ),
                    'date'       => get_the_date( 'Y-m-d H:i:s', $post->ID ),
                    'status'     => $post->post_status === 'publish' ? 'published' : $post->post_status,
                );
            }

            // ----- Status Counts -----
            $counter = function ( $status ) {
                $query = new \WP_Query(
                    array(
                        'post_type'      => Utill::POST_TYPES['announcement'],
                        'post_status'    => $status,
                        'posts_per_page' => 1,
                        'fields'         => 'ids',
                        'no_found_rows'  => false,
                    )
                );
                return intval( $query->found_posts );
            };

            if ($dashboard) {
                set_transient('multivendorx_announcement_data_' . $store_id, array( 'items' => $items ), DAY_IN_SECONDS);
            }

            return rest_ensure_response(
                array(
                    'items'   => $items,
                    'all'     => $counter( 'any' ),
                    'publish' => $counter( 'publish' ),
                    'pending' => $counter( 'pending' ),
                    'draft'   => $counter( 'draft' ),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }



    /**
     * Create a single item.
     *
     * @param object $request Full data about the request.
     */
    public function create_item( $request ) {
        // Validate nonce.
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            $title   = sanitize_text_field( $request->get_param( 'title' ) );
            $content = sanitize_textarea_field( $request->get_param( 'content' ) );
            $status  = $request->get_param( 'status' );
            $stores  = $request->get_param( 'stores' );
            $stores  = is_array( $stores ) ? $stores : array();

            // Accept only whitelisted statuses.
            $allowed_statuses = array( 'publish', 'pending', 'draft' );
            $post_status      = in_array( $status, $allowed_statuses, true ) ? $status : 'draft';

            // Insert post.
            $post_id = wp_insert_post(
                array(
                    'post_title'   => $title,
                    'post_content' => $content,
                    'post_type'    => Utill::POST_TYPES['announcement'],
                    'post_status'  => $post_status,
                ),
                true
            );

            if ( is_wp_error( $post_id ) ) {
                return rest_ensure_response(
                    array(
                        'success' => false,
                        'message' => $post_id->get_error_message(),
                    )
                );
            }

            // Stores meta.
            update_post_meta(
                $post_id,
                Utill::POST_META_SETTINGS['announcement_stores'],
                $stores
            );

            // URL meta (your code had a bug using $formData, fixed to request param).
            $url = sanitize_text_field( $request->get_param( 'url' ) );
            if ( ! empty( $url ) ) {
                update_post_meta(
                    $post_id,
                    Utill::POST_META_SETTINGS['announcement_url'],
                    esc_url_raw( $url )
                );
            }

            foreach ($stores as $store_id) {
                $store = new Store($store_id);

                do_action(
                    'multivendorx_notify_system_announcement',
                        'system_announcement',
                        array(
                            'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                            'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                            'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                            'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                            'announcement_message'    => $content,
                            'category'    => 'activity',
                        )
                    );
            }

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $post_id,
                    'title'   => $title,
                    'content' => $content,
                    'url'     => $url,
                    'status'  => $post_status,
                    'stores'  => $stores,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Update an announcement.
     *
     * @param object $request The request object.
     */
    public function update_item( $request ) {

        // Validate nonce.
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            $data   = $request->get_params();
            $stores = $request->get_param( 'stores' );
            $stores = is_array( $stores ) ? $stores : array();

            /**
             * ----------------------------------------------------------
             *  BULK UPDATE
             * ----------------------------------------------------------
             */
            if ( isset( $data['bulk'] ) && ! empty( $data['ids'] ) && ! empty( $data['action'] ) ) {
                $action = sanitize_key( $data['action'] );
                $ids    = array_map( 'absint', $data['ids'] );

                foreach ( $ids as $id ) {
                    switch ( $action ) {
                        case 'publish':
                        case 'pending':
                            wp_update_post(
                                array(
                                    'ID'          => $id,
                                    'post_status' => $action,
                                )
                            );
                            break;

                        case 'delete':
                            wp_delete_post( $id, true );
                            break;
                    }
                }

                return rest_ensure_response(
                    array(
                        'success' => true,
                        'bulk'    => true,
                    )
                );
            }

            /**
             * ----------------------------------------------------------
             *  SINGLE UPDATE
             * ----------------------------------------------------------
             */
            $post_id = absint( $request->get_param( 'id' ) );
            $post    = get_post( $post_id );

            // Yoda condition + correct check.
            if ( ! $post || Utill::POST_TYPES['announcement'] !== $post->post_type ) {
                return new \WP_Error(
                    'not_found',
                    __( 'Announcement not found', 'multivendorx' ),
                    array( 'status' => 404 )
                );
            }

            // Update post.
            $updated_id = wp_update_post(
                array(
                    'ID'           => $post_id,
                    'post_title'   => sanitize_text_field( $data['title'] ?? '' ),
                    'post_content' => sanitize_textarea_field( $data['content'] ?? '' ),
                    'post_status'  =>
                        ( isset( $data['status'] ) &&
                            in_array( $data['status'], array( 'publish', 'pending', 'draft' ), true )
                        )
                            ? $data['status']
                            : 'draft',
                ),
                true
            );

            if ( is_wp_error( $updated_id ) ) {
                return rest_ensure_response(
                    array(
                        'success' => false,
                        'message' => $updated_id->get_error_message(),
                    )
                );
            }

            // Update stores meta.
            update_post_meta(
                $post_id,
                Utill::POST_META_SETTINGS['announcement_stores'],
                $stores
            );

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $post_id,
                    'title'   => $data['title'] ?? '',
                    'content' => $data['content'] ?? '',
                    'status'  => get_post_status( $post_id ),
                    'stores'  => $stores,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }
    /**
     * Get a single announcement.
     *
     * @param object $request The request object.
     */
    public function get_item( $request ) {

        // Validate nonce.
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            // Log error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            // Validate ID.
            $id = absint( $request->get_param( 'id' ) );
            if ( 0 === $id ) {
                return new \WP_Error(
                    'invalid_id',
                    __( 'Invalid announcement ID', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            // Fetch post.
            $post = get_post( $id );

            // Yoda condition + correct logic.
            if ( ! $post || Utill::POST_TYPES['announcement'] !== $post->post_type ) {
                return new \WP_Error(
                    'not_found',
                    __( 'Announcement not found', 'multivendorx' ),
                    array( 'status' => 404 )
                );
            }

            // Fetch stores.
            $stores = get_post_meta( $id, Utill::POST_META_SETTINGS['announcement_stores'], true );
            $stores = is_array( $stores ) ? $stores : array();

            // Prepare response.
            $response = array(
                'id'      => $id,
                'title'   => $post->post_title,
                'content' => $post->post_content,
                'status'  => $post->post_status,
                'url'     => get_post_meta( $id, Utill::POST_META_SETTINGS['announcement_url'], true ),
                'stores'  => $stores,
                'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
            );

            return rest_ensure_response( $response );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Delete an announcement.
     *
     * @param object $request The request object.
     */
    public function delete_item( $request ) {

        /** -------------------------
         *  Nonce Validation
         * ------------------------- */
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            MultiVendorX()->util->log( $error );

            return $error;
        }

        try {

            /** -------------------------
             *  Validate ID
             * ------------------------- */
            $post_id = absint( $request->get_param( 'id' ) );

            if ( 0 === $post_id ) {
                return new \WP_Error(
                    'invalid_id',
                    __( 'Invalid announcement ID', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            /** -------------------------
             *  Load Post
             * ------------------------- */
            $post = get_post( $post_id );

            if ( null === $post || Utill::POST_TYPES['announcement'] !== $post->post_type ) {
                return new \WP_Error(
                    'not_found',
                    __( 'Announcement not found', 'multivendorx' ),
                    array( 'status' => 404 )
                );
            }

            /** -------------------------
             *  Delete Post
             * ------------------------- */
            $deleted = wp_delete_post( $post_id, true );

            if ( false === $deleted ) {
                return new \WP_Error(
                    'delete_failed',
                    __( 'Failed to delete announcement', 'multivendorx' ),
                    array( 'status' => 500 )
                );
            }

            /** -------------------------
             *  Success Response
             * ------------------------- */
            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $post_id,
                    'message' => __( 'Announcement deleted successfully', 'multivendorx' ),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }
}
