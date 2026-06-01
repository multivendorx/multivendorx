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
	 * Validate REST nonce.
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return true|\WP_Error
	 */
	private function validate_rest_nonce( $request ) {

		$nonce = $request->get_header( 'X-WP-Nonce' );

		if ( wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return true;
		}

		$error = new \WP_Error(
			'invalid_nonce',
			esc_html__( 'Invalid nonce.', 'catalogx' ),
			array( 'status' => 403 )
		);

		CatalogX()->util->log( $error );

		return $error;
	}

	/**
	 * Get tour status.
	 *
	 * @param mixed $request Request object.
	 *
	 * @return array|\WP_Error
	 */
	public function get_items( $request ) {

		$nonce_validation = $this->validate_rest_nonce( $request );

		if ( is_wp_error( $nonce_validation ) ) {
			return $nonce_validation;
		}

		try {
			$tour_completed_status = get_option(
				Utill::CATALOGX_OTHER_SETTINGS['tour_completed'],
				false
			);

			return array(
				'completed' => filter_var( $tour_completed_status, FILTER_VALIDATE_BOOLEAN ),
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

		$nonce_validation = $this->validate_rest_nonce( $request );

		if ( is_wp_error( $nonce_validation ) ) {
			return $nonce_validation;
		}

		try {
			$is_tour_completed = $request->get_param( 'completed' );

			update_option(
				Utill::CATALOGX_OTHER_SETTINGS['tour_completed'],
				$is_tour_completed
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
