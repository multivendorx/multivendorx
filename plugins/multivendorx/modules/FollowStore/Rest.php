<?php

/**
 * MultiVendorX REST API Controller for Questions and Answers
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\FollowStore;

use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX REST API Controller for Questions and Answers.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Rest extends \WP_REST_Controller
{

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'follow-store';

    /**
     * Constructor.
     */
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_routes'), 10);
    }

    /**
     * Register the routes for questions and answers.
     */
    public function register_routes()
    {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_item'),
                    'permission_callback' => array($this, 'get_items_permissions_check'),
                    'args'                => array(
                        'id' => array('required' => true),
                    ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_item'),
                    'permission_callback' => array($this, 'update_item_permissions_check'),
                ),
            )
        );
    }

    /**
     * Get items permissions check.
     *
     * @param  object $request Full data about the request.
     */
    public function get_items_permissions_check($request)
    {
        return current_user_can('read');
    }

    /**
     * Update permissions check.
     *
     * @param  object $request Full data about the request.
     */
    public function update_item_permissions_check($request)
    {
        return current_user_can('read');
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
            $store_id = $request->get_param( 'storeId' );
            $user_id  = $request->get_param( 'userId' );
    
            if ( ! $store_id ) {
                return new \WP_Error(
                    'invalid_store',
                    __( 'Invalid store ID', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }
    
            $store     = new \MultiVendorX\Store\Store( $store_id );

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
    
            return rest_ensure_response( array(
                'follow'         => $is_following,
                'follower_count' => count( $follower_ids ),
            ) );
    
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
    public function update_item($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            $error = new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );
    
            if (is_wp_error($error)) {
                MultiVendorX()->util->log($error);
            }
    
            return $error;
        }
    
        try {
            $store_id = $request->get_param('storeId');
            $user_id  = $request->get_param('userId');
    
            if (! $store_id || ! $user_id) {
                return new \WP_Error(
                    'invalid_data',
                    __('Invalid data.', 'multivendorx'),
                    array('status' => 400)
                );
            }
    
            $following = get_user_meta($user_id, Utill::USER_SETTINGS_KEYS['following_stores'], true);
            if (! is_array($following)) {
                $following = array();
            }
    
            $store = new \MultiVendorX\Store\Store($store_id);
    
            // Fetch followers (serialized-safe)
            $followers = maybe_unserialize(
                $store->meta_data[Utill::STORE_SETTINGS_KEYS['followers']] ?? array()
            );
    
            if (! is_array($followers)) {
                $followers = array();
            }
    
            // Normalize old format: [1,2,3] → [['id'=>1,'date'=>'']]
            if (isset($followers[0]) && is_int($followers[0])) {
                $followers = array_map(
                    fn($uid) => array(
                        'id'   => $uid,
                        'date' => '',
                    ),
                    $followers
                );
            }
    
            // Normalize following IDs for strict compare
            $following_ids = array_map('strval', $following);
    
            if (in_array((string) $store_id, $following_ids, true)) {
                // Unfollow
                $following = array_diff($following, array($store_id));
                $followers = array_filter(
                    $followers,
                    fn($f) => isset($f['id']) && $f['id'] !== $user_id
                );
                $follow = false;
            } else {
                // Follow
                $following[] = $store_id;
    
                if (! in_array($user_id, array_column($followers, 'id'), true)) {
                    $followers[] = array(
                        'id'   => $user_id,
                        'date' => wp_date('c', time(), wp_timezone()),
                    );
                }
    
                $follow = true;
            }
    
            // Save updates
            update_user_meta($user_id, Utill::USER_SETTINGS_KEYS['following_stores'], array_values($following));
            $store->update_meta(Utill::STORE_SETTINGS_KEYS['followers'], array_values($followers));
    
            return rest_ensure_response(array(
                'follow'         => $follow,
                'follower_count' => count($followers),
            ));
    
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);
    
            return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'multivendorx'),
                array('status' => 500)
            );
        }
    }
    
}
