<?php

/**
 * MultiVendorX REST API Controller for Questions and Answers
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\FollowStore;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Controller for Questions and Answers.
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
    protected $rest_base = 'followers';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    /**
     * Register the routes for questions and answers.
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
                    'args'                => array(
                        'id' => array( 'required' => true ),
                    ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Get items permissions check.
     *
     * @param  object $request Full data about the request.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' );
    }

    /**
     * Update permissions check.
     *
     * @param  object $request Full data about the request.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'read' );
    }

        /**
         * Get all knowledge base articles.
         *
         * @param object $request WP_REST_Request object.
         */
    public function get_items( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            MultiVendorX()->util->log( $error );
            return $error;
        }

        try {
            $store_id = intval( $request->get_param( 'store_id' ) );
            if ( ! $store_id ) {
                return rest_ensure_response( array( 'error' => 'Invalid store ID' ) );
            }

            // Get store object.
            $store = new Store( $store_id );

            // Fetch followers from meta_data.
            $followers_raw = $store->meta_data[ Utill::STORE_SETTINGS_KEYS['followers'] ] ?? '[]';
            $followers     = json_decode( $followers_raw, true );
            if ( ! is_array( $followers ) ) {
                $followers = array();
            }

            // Handle old format (plain array of user IDs).
            // Convert to new format with id + empty date.
            if ( ! empty( $followers[0] ) && is_int( $followers[0] ) ) {
                $followers = array_map(
                    fn( $uid ) => array(
                        'id'   => $uid,
                        'date' => '',
                    ),
                    $followers
                );
            }

            $response = rest_ensure_response( array() );
            $response->header( 'X-WP-Total', count( $followers ) );

            usort(
                $followers,
                function ( $a, $b ) {
                    $date_a = ! empty( $a['date'] ) ? strtotime( $a['date'] ) : 0;
                    $date_b = ! empty( $b['date'] ) ? strtotime( $b['date'] ) : 0;
                    return $date_b <=> $date_a;
                }
            );

            // Pagination.
            $page   = max( intval( $request->get_param( 'page' ) ), 1 );
            $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
            $offset = ( $page - 1 ) * $limit;

            // Paginate followers.
            $followers_page = array_slice( $followers, $offset, $limit );

            $formatted_followers = array();
            foreach ( $followers_page as $follower ) {
                $user_id     = $follower['id'] ?? 0;
                $follow_date = $follower['date'] ?? '';

                $user = get_userdata( $user_id );
                if ( $user ) {
                    // Get first + last name.
                    $first_name = get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['first_name'], true );
                    $last_name  = get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['last_name'], true );

                    // Combine names, fallback to display_name if empty.
                    $full_name = trim( "$first_name $last_name" );
                    if ( empty( $full_name ) ) {
                        $full_name = $user->display_name;
                    }

                    $formatted_followers[] = array(
                        'id'    => $user_id,
                        'name'  => $full_name,
                        'email' => $user->user_email,
                        'date_followed'  => Utill::multivendorx_rest_prepare_date_response( $follow_date ),
                    );
                }
            }
            $response->set_data( $formatted_followers );
            return $response;
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Retrieve a single question item.
     *
     * @param  object $request Full data about the request.
     */
    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            $store_id = $request->get_param( 'store_id' );
            $user_id  = $request->get_param( 'user_id' );

            if ( ! $store_id ) {
                return new \WP_Error(
                    'invalid_store',
                    __( 'Invalid store ID', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            $store = new \MultiVendorX\Store\Store( $store_id );

            $followers = maybe_unserialize(
                $store->meta_data[ Utill::STORE_SETTINGS_KEYS['followers'] ] ?? array()
            );

            if ( ! is_array( $followers ) ) {
                $followers = array();
            }

            if ( isset( $followers[0] ) && is_int( $followers[0] ) ) {
                $followers = array_map(
                    fn( $uid ) => array(
                        'id'   => $uid,
                        'date' => '',
                    ),
                    $followers
                );
            }
            // Extract user IDs for comparison and count.
            $follower_ids = array_column( $followers, 'id' );

            $following = $user_id
                ? get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['following_stores'], true )
                : array();

            if ( ! is_array( $following ) ) {
                $following = array();
            }

            $is_following = in_array( $store_id, $following, true );

            return rest_ensure_response(
                array(
					'follow'         => $is_following,
					'follower_count' => count( $follower_ids ),
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
     * Create a single question item.
     *
     * @param  object $request Full data about the request.
     */
    public function update_item( $request ) {
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
            $store_id = $request->get_param( 'store_id' );
            $user_id  = $request->get_param( 'user_id' );

            if ( ! $store_id || ! $user_id ) {
                return new \WP_Error(
                    'invalid_data',
                    __( 'Invalid data.', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            $following = get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['following_stores'], true );
            if ( ! is_array( $following ) ) {
                $following = array();
            }

            $store = new \MultiVendorX\Store\Store( $store_id );

            // Fetch followers (serialized-safe)
            $followers = maybe_unserialize(
                $store->meta_data[ Utill::STORE_SETTINGS_KEYS['followers'] ] ?? array()
            );

            if ( ! is_array( $followers ) ) {
                $followers = array();
            }

            // Normalize old format: [1,2,3] → [['id'=>1,'date'=>'']]
            if ( isset( $followers[0] ) && is_int( $followers[0] ) ) {
                $followers = array_map(
                    fn( $uid ) => array(
                        'id'   => $uid,
                        'date' => '',
                    ),
                    $followers
                );
            }

            // Normalize following IDs for strict compare
            $following_ids = array_map( 'strval', $following );

            if ( in_array( (string) $store_id, $following_ids, true ) ) {
                // Unfollow
                $following = array_diff( $following, array( $store_id ) );
                $followers = array_filter(
                    $followers,
                    fn( $f ) => isset( $f['id'] ) && $f['id'] !== $user_id
                );
                $follow    = false;
            } else {
                // Follow
                $following[] = $store_id;

                if ( ! in_array( $user_id, array_column( $followers, 'id' ), true ) ) {
                    $followers[] = array(
                        'id'   => $user_id,
                        'date' => wp_date( 'c', time(), wp_timezone() ),
                    );
                }

                $follow = true;
            }

            // Save updates
            update_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['following_stores'], array_values( $following ) );
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['followers'], array_values( $followers ) );

            return rest_ensure_response(
                array(
					'follow'         => $follow,
					'follower_count' => count( $followers ),
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
