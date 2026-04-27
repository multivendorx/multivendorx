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
 * Class Logs
 *
 * @package MooWoodle\RestAPI\Controllers
 */
class Logs extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'logs';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            MooWoodle()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
			)
        );
    }

    /**
     * Get_items_permissions_check checks the get items permissions.
     *
     * @param mixed $request all requests params from api.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Save the setting set in react's admin setting page.
     *
     * @param mixed $request all requests params from api.
     * @return \WP_Error|\WP_REST_Response
     */
    public function get_items( $request ) {
        global $wp_filesystem;
        $nonce     = $request->get_header( 'X-WP-Nonce' );
        $log_count = $request->get_param( 'logcount' );
        $log_count = $log_count ? $log_count : 100;
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }
        if ( ! $wp_filesystem ) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            WP_Filesystem();
        }
        $action = $request->get_param( 'action' );
        switch ( $action ) {
            case 'download':
                return $this->download_log( $request );
            case 'clear':
                $wp_filesystem->delete( MooWoodle()->log_file );
                delete_option( Util::MOOWOODLE_OTHER_SETTINGS['log_file'] ); // Remove log file reference from options table.
                return rest_ensure_response( true );
            default:
                $logs = array();
                if ( file_exists( MooWoodle()->log_file ) ) {
                    $log_content = $wp_filesystem->get_contents( MooWoodle()->log_file );
                    if ( ! empty( $log_content ) ) {
                        $logs = explode( "\n", $log_content );
                    }
                }

                return rest_ensure_response( array_reverse( array_slice( $logs, - $log_count ) ) );
        }
    }

    /**
     * Download the log.
     *
     * @param mixed $request all requests params from api.
     * @return \WP_Error|\WP_REST_Response
     */
    public function download_log( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }
        // Get the file parameter from the request.
        $file      = get_option( Util::MOOWOODLE_OTHER_SETTINGS['log_file'] );
        $file      = basename( $file );
        $file_path = MooWoodle()->moowoodle_logs_dir . '/' . $file;

        // Check if the file exists and has the right extension.
        if ( file_exists( $file_path ) && preg_match( '/\.(txt|log)$/', $file ) ) {
            // Set headers to force download.
            header( 'Content-Description: File Transfer' );
            header( 'Content-Type: application/octet-stream' );
            header( 'Content-Disposition: attachment; filename="' . $file . '"' );
            header( 'Expires: 0' );
            header( 'Cache-Control: must-revalidate' );
            header( 'Pragma: public' );
            header( 'Content-Length: ' . filesize( $file_path ) );

            // Clear output buffer and read the file.
            ob_clean();
            flush();
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
            readfile( $file_path );
            exit;
        } else {
            return new \WP_Error( 'file_not_found', 'File not found', array( 'status' => 404 ) );
        }
    }
}
