<?php
/**
 * Modules REST API tour controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;
defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API tour controller.
 *
 * @class       Tour class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Tour extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'tour';

    /**
     * Register the routes for tour.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
        );
    }

    /**
     * Check permission for tour status REST API requests.
     *
     * @param mixed $request Request data.
     * @return true|\WP_Error
     */
    public function permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'manage_options', 'edit_stores' ) );
    }


    /**
     * Get tour status
     *
     * @param mixed $request Request data.
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $store_id = $request->get_param( 'store_id' );

            // ✅ STORE CONTEXT
            if ( $store_id ) {
                if ( ! StoreUtil::current_user_can_manage_store( $store_id ) ) {
                    return new \WP_Error(
                        'rest_forbidden',
                        __( 'You are not allowed to view this store\'s tour status.', 'multivendorx' ),
                        array( 'status' => 403 )
                    );
                }

                $store  = new \MultiVendorX\Store\Store( $store_id );
                $status = $store->get_meta( Utill::STORE_SETTINGS_KEYS['store_tour_completed'] );

                return array(
                    'completed' => filter_var( $status, FILTER_VALIDATE_BOOLEAN ),
                );
            }

            // ✅ ADMIN CONTEXT
            if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
                return new \WP_Error(
                    'rest_forbidden',
                    __( 'You are not allowed to view the admin tour status.', 'multivendorx' ),
                    array( 'status' => 403 )
                );
            }

            $status = get_option(
                Utill::MULTIVENDORX_OTHER_SETTINGS['tour_completed'],
                false
            );

            return array(
                'completed' => filter_var( $status, FILTER_VALIDATE_BOOLEAN ),
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Set tour status
     *
     * @param mixed $request Request data.
     */
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $store_id  = $request->get_param( 'store_id' );
            $completed = $request->get_param( 'completed' );

            // ✅ STORE CONTEXT
            if ( $store_id ) {
                if ( ! StoreUtil::current_user_can_manage_store( $store_id ) ) {
                    return new \WP_Error(
                        'rest_forbidden',
                        __( 'You are not allowed to update this store\'s tour status.', 'multivendorx' ),
                        array( 'status' => 403 )
                    );
                }

                $store = new \MultiVendorX\Store\Store( $store_id );
                $store->update_meta(
                    Utill::STORE_SETTINGS_KEYS['store_tour_completed'],
                    $completed
                );
                return array( 'success' => true );
            }

            // ✅ ADMIN CONTEXT
            if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
                return new \WP_Error(
                    'rest_forbidden',
                    __( 'You are not allowed to update the admin tour status.', 'multivendorx' ),
                    array( 'status' => 403 )
                );
            }

            update_option(
                Utill::MULTIVENDORX_OTHER_SETTINGS['tour_completed'],
                $completed
            );

            return array( 'success' => true );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
}
