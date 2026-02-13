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
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' ); // phpcs:ignore WordPress.WP.Capabilities.Unknown
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
            $limit          = max( 10, (int) $request->get_param( 'row' ) );
            $page           = max( 1, (int) $request->get_param( 'page' ) );
            $offset         = ( $page - 1 ) * $limit;
            $status_param   = sanitize_key( $request->get_param( 'status' ) );
            $search_value   = sanitize_text_field( $request->get_param( 'searchValue' ) );
            $store_id       = (int) $request->get_param( 'store_id' );
            $sec_fetch_site = $request->get_header( 'sec_fetch_site' );
            $referer        = $request->get_header( 'referer' );

            $dates = Utill::normalize_date_range(
                $request->get_param( 'startDate' ),
                $request->get_param( 'endDate' )
            );

            $args = array(
                'post_type'      => Utill::POST_TYPES['announcement'],
                'posts_per_page' => 1,
                'fields'         => 'ids',
                'no_found_rows'  => false,
            );

            if ( $store_id > 0 ) {
                $args['meta_query'] = array(
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

            $response = rest_ensure_response( array() );

            if ( $sec_fetch_site === 'same-origin' && preg_match( '#/dashboard/?$#', $referer ) && get_transient( 'multivendorx_announcement_data_' . $store_id ) ) {
                return get_transient( Utill::MULTIVENDORX_TRANSIENT_KEYS['announcement_transient'] . $store_id );
            }

            foreach ( array( 'any', 'publish', 'pending', 'draft' ) as $status ) {
                $args['post_status'] = $status;

                $query = new \WP_Query( $args );
                $count = (int) $query->found_posts;

                if ( $status === 'any' ) {
                    $response->header( 'X-WP-Total', $count );
                    $response->header(
                        'X-WP-TotalPages',
                        (int) ceil( $count / $limit )
                    );
                } else {
                    $response->header(
                        'X-WP-Status-' . ucfirst( $status ),
                        $count
                    );
                }
            }

            unset( $args['posts_per_page'], $args['fields'] );

            $args['post_status']    = $status_param ? $status_param : 'any';
            $args['orderby']        = 'date';
            $args['order']          = 'DESC';
            $args['posts_per_page'] = $limit;
            $args['offset']         = $offset;

            if ( ! empty( $dates['start_date'] ) && ! empty( $dates['end_date'] ) ) {
                $date_query           = array( 'inclusive' => true );
                $date_query['after']  = $dates['start_date'];
                $date_query['before'] = $dates['end_date'];
                $args['date_query']   = array( $date_query );
            }

            if ( $search_value ) {
                $args['s'] = $search_value;
            }

            $posts = get_posts( $args );
            $items = array();

            foreach ( $posts as $post ) {
                $store_ids = (array) get_post_meta(
                    $post->ID,
                    Utill::POST_META_SETTINGS['announcement_stores'],
                    true
                );

                $store_names = array();
                foreach ( $store_ids as $sid ) {
                    $store = MultivendorX()->store->get_store( $sid );
                    if ( $store ) {
                        $store_names[] = $store->get( 'name' );
                    }
                }

                $items[] = array(
                    'id'         => $post->ID,
                    'title'      => $post->post_title,
                    'content'    => $post->post_content,
                    'store_name' => implode( ', ', $store_names ),
                    'date'       => Utill::format_date_time(get_the_date( 'Y-m-d H:i:s', $post->ID ) ),
                    'status'     => $post->post_status === 'publish'
                        ? 'published'
                        : $post->post_status,
                );
            }

            $response->set_data( $items );
            if ( $sec_fetch_site === 'same-origin' && preg_match( '#/dashboard/?$#', $referer ) ) {
                set_transient(
                    Utill::MULTIVENDORX_TRANSIENT_KEYS['announcement_transient'] . $store_id,
                    $response,
                    DAY_IN_SECONDS
                );
            }

            return $response;
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

            foreach ( $stores as $store_id ) {
                $store = new Store( $store_id );

                do_action(
                    'multivendorx_notify_system_announcement',
                    'system_announcement',
                    array(
                        'store_phn'            => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                        'store_email'          => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                        'admin_email'          => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                        'admin_phn'            => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                        'announcement_message' => $content,
                        'category'             => 'activity',
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
                    'post_status'  => ( isset( $data['status'] ) &&
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
                'date'    => Utill::format_date_time(get_post_time( 'Y-m-d H:i:s', true, $post ) ),
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
