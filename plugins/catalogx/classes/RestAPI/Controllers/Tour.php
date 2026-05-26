<?php
/**
 * CatalogX REST API Tour controller
 *
 * @package CatalogX
 */

namespace CatalogX\RestAPI\Controllers;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX REST API Tour controller.
 *
 * @class       Tour
 * @version     1.0.0
 * @author      CatalogX
 */
class Tour extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'tour';

	/**
	 * Register routes.
	 */
	public function register_routes() {
		register_rest_route(
			CatalogX()->rest_namespace,
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
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Permissions check for GET request.
	 *
	 * @param mixed $request Request object.
	 *
	 * @return bool
	 */
	public function get_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get tour status.
	 *
	 * @param mixed $request Request object.
	 *
	 * @return array|\WP_Error
	 */
	public function get_items( $request ) {
		$nonce = $request->get_header( 'X-WP-Nonce' );

		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			$error = new \WP_Error(
				'invalid_nonce',
				esc_html__( 'Invalid nonce.', 'catalogx' ),
                array( 'status' => 403 )
			);

			if ( is_wp_error( $error ) ) {
				CatalogX()->util->log( $error );
			}

			return $error;
		}

		try {
			$status = get_option(
				Utill::CATALOGX_OTHER_SETTINGS['tour_completed'],
				false
			);

			return array(
				'completed' => filter_var( $status, FILTER_VALIDATE_BOOLEAN ),
			);

		} catch ( \Exception $e ) {
			CatalogX()->util->log( $e );

			return new \WP_Error(
				'server_error',
				__( 'Unexpected server error', 'catalogx' ),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Set tour status.
	 *
	 * @param mixed $request Request object.
	 *
	 * @return array|\WP_Error
	 */
	public function create_item( $request ) {
		$nonce = $request->get_header( 'X-WP-Nonce' );

		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			$error = new \WP_Error(
				'invalid_nonce',
				esc_html__( 'Invalid nonce.', 'catalogx' ),
				array( 'status' => 403 )
			);

			if ( is_wp_error( $error ) ) {
				CatalogX()->util->log( $error );
			}

			return $error;
		}

		try {
			$completed = $request->get_param( 'completed' );

			update_option(
				Utill::CATALOGX_OTHER_SETTINGS['tour_completed'],
				$completed
			);

			return array(
				'success' => true,
			);

		} catch ( \Exception $e ) {
			CatalogX()->util->log( $e );

			return new \WP_Error(
				'server_error',
				__( 'Unexpected server error', 'catalogx' ),
				array( 'status' => 500 )
			);
		}
	}
}