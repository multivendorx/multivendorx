<?php
/**
 * MultiVendorX REST API Controller for Follow Store
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\FollowStore;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Controller for Follow Store.
 *
 * @class       Follow Store class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Rest extends \WP_REST_Controller {


    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'follow-stores';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    /**
     * Register the routes for Follow Store.
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
                    'permission_callback' => array( $this, 'permissions_check' ),
                    'args'                => array(
                        'id' => array( 'required' => true ),
                    ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'permissions_check' ),
                ),
            )
        );
    }

    /**
     * Check permission for REST API requests.
     *
     * @param object $request Full data about the request.
     * @return true|\WP_Error
     */
    public function get_items_permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'edit_stores' ) );
    }

    /**
     * Check permission for REST API requests.
     *
     * @param object $request Full data about the request.
     * @return true|\WP_Error
     */
    public function permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'read' ) );
    }

    /**
     * Get all knowledge base articles.
     *
     * @param \WP_REST_Request $request WP REST request object.
     *
     * @return mixed
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
            if ( ! $store->exists() ) {
                return rest_ensure_response( array( 'error' => 'Store does not exists' ) );
            }

            $followers = $store->get_meta( Utill::STORE_SETTINGS_KEYS['followers'] ) ?? array();

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
				if ( ! is_array( $follower ) || empty( $follower['id'] ) || empty( $follower['date'] ) ) {
					continue;
				}

				$user = get_userdata( (int) $follower['id'] );

				if ( ! $user ) {
					continue;
				}

				$full_name = trim( $user->first_name . ' ' . $user->last_name );

				if ( empty( $full_name ) ) {
					$full_name = $user->display_name;
				}

				$formatted_followers[] = array(
					'id'                => $user->ID,
					'name'              => $full_name,
					'email'             => $user->user_email,
					'date_followed'     => Utill::multivendorx_rest_prepare_date_response( $follower['date'] ),
					'date_followed_gmt' => Utill::multivendorx_rest_prepare_date_response( $follower['date'], true ),
				);
			}

            $response->set_data( $formatted_followers );

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
            $user_id  = MultiVendorX()->current_user_id;

            if ( ! $store_id ) {
                return new \WP_Error(
                    'invalid_store',
                    __( 'Invalid store ID', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            $store     = new \MultiVendorX\Store\Store( $store_id );
            $followers = $store->get_meta( Utill::STORE_SETTINGS_KEYS['followers'] ) ?? array();

            $follower_ids = array_column( $followers, 'id' );

            $following = $user_id ? get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['following_stores'], true ) : array();

            return rest_ensure_response(
                array(
					'follow'         => in_array( (int) $store_id, $following, true ),
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
            $user_id  = MultiVendorX()->current_user_id;

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

			$followers = $store->meta_data[ Utill::STORE_SETTINGS_KEYS['followers'] ] ?? array();

			if ( ! is_array( $followers ) ) {
				$followers = array();
			}

			$first = reset( $followers );

			if ( false !== $first && is_int( $first ) ) {
				$followers = array_map(
					function ( $uid ) {
						return array(
							'id'   => $uid,
							'date' => '',
						);
					},
                    $followers
				);
			}

            $following_ids = array_map( 'strval', $following );

            if ( in_array( (string) $store_id, $following_ids, true ) ) {
                $following = array_diff( $following, array( $store_id ) );
                $followers = array_filter(
                    $followers,
                    fn( $f ) => isset( $f['id'] ) && $f['id'] !== $user_id
                );
                $follow    = false;
            } else {
                $following[] = $store_id;

                if ( ! in_array( $user_id, array_column( $followers, 'id' ), true ) ) {
                    $followers[] = array(
                        'id'   => $user_id,
                        'date' => wp_date( 'c', time(), wp_timezone() ),
                    );
                }

                $follow = true;
            }

            update_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['following_stores'], array_values( $following ) );
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['followers'], array_values( $followers ) );

            MultiVendorX()->notifications->send_notification_helper(
                'store_followed',
                $store,
                null,
                array(
					'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
					'category'   => 'activity',
				)
            );

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
