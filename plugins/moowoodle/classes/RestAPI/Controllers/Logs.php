<?php
/**
 * MooWoodle REST API Logs Controller class.
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI\Controllers;

use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * Logs REST controller class.
 */
class Logs extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'logs';

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			MooWoodle()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			MooWoodle()->rest_namespace,
			'/' . $this->rest_base . '/download',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'download_log' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check API request permissions.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Retrieve log entries.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_items( $request ) {
		$nonce_check = Util::validate_nonce( $request );

		if ( is_wp_error( $nonce_check ) ) {
			return $nonce_check;
		}

		global $wp_filesystem;

		$log_limit = absint( $request->get_param( 'logcount' ) ?: 100 );

		if ( ! $wp_filesystem ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		$log_entries = array();

		if ( file_exists( MooWoodle()->log_file ) ) {
			$log_file_content = $wp_filesystem->get_contents( MooWoodle()->log_file );

			if ( ! empty( $log_file_content ) ) {
				$log_entries = explode( "\n", $log_file_content );
			}
		}

		return rest_ensure_response(
			array_reverse(
				array_slice( $log_entries, -$log_limit )
			)
		);
	}

	/**
	 * Delete log file.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_items( $request ) {
		$nonce_check = Util::validate_nonce( $request );

		if ( is_wp_error( $nonce_check ) ) {
			return $nonce_check;
		}

		global $wp_filesystem;

		if ( ! $wp_filesystem ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		if ( file_exists( MooWoodle()->log_file ) ) {
			$wp_filesystem->delete( MooWoodle()->log_file );
		}

		delete_option( Util::MOOWOODLE_OTHER_SETTINGS['log_file'] );

		return rest_ensure_response(
			array(
				'success' => true,
				'message' => __( 'Logs cleared successfully.', 'moowoodle' ),
			)
		);
	}

	/**
	 * Download log file.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return void|\WP_Error
	 */
	public function download_log( $request ) {
		$nonce_check = Util::validate_nonce( $request );

		if ( is_wp_error( $nonce_check ) ) {
			return $nonce_check;
		}

		$log_filename = get_option( Util::MOOWOODLE_OTHER_SETTINGS['log_file'] );

		if ( empty( $log_filename ) ) {
			return new \WP_Error(
				'log_file_missing',
				__( 'Log file not found.', 'moowoodle' ),
				array( 'status' => 404 )
			);
		}

		$log_filename  = basename( $log_filename );
		$log_file_path = MooWoodle()->moowoodle_logs_dir . '/' . $log_filename;

		if (
			! file_exists( $log_file_path ) ||
			! preg_match( '/\.(txt|log)$/i', $log_filename )
		) {
			return new \WP_Error(
				'invalid_log_file',
				__( 'Invalid log file.', 'moowoodle' ),
				array( 'status' => 404 )
			);
		}

		header( 'Content-Description: File Transfer' );
		header( 'Content-Type: application/octet-stream' );
		header( 'Content-Disposition: attachment; filename="' . $log_filename . '"' );
		header( 'Expires: 0' );
		header( 'Cache-Control: must-revalidate' );
		header( 'Pragma: public' );
		header( 'Content-Length: ' . filesize( $log_file_path ) );

		if ( ob_get_length() ) {
			ob_end_clean();
		}

		flush();

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
		readfile( $log_file_path );

		exit;
	}
}
