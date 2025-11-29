<?php
/**
 * Multivendorx REST API Logs Controller class.
 */
namespace MultiVendorX\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

/**
 * Class MultiVendorX_REST_Logs_Controller
 *
 * @package MultiVendorX\RestAPI\Controllers
 */
class MultiVendorX_REST_Logs_Controller extends \WP_REST_Controller {

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
     * Get_items_permissions_check checks the get items permissions.
     *
     * @param mixed $request all requests params from api.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' );
    }

    /**
     * Create_item_permissions_check creates the item permissions check.
     *
     * @param mixed $request all requests params from api.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Update_item_permissions_check updates the item permissions check.
     *
     * @param mixed $request all requests params from api.
     */
    public function update_item_permissions_check( $request ) {
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
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
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
                $wp_filesystem->delete( MultiVendorX()->log_file );
                delete_option( 'multivendorx_log_file' ); // Remove log file reference from options table.
                return rest_ensure_response( true );
            default:
                $logs = array();
                if ( file_exists( MultiVendorX()->log_file ) ) {
                    $log_content = $wp_filesystem->get_contents( MultiVendorX()->log_file );
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
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }
        // Get the file parameter from the request.
        $file      = get_option( 'multivendorx_log_file' );
        $file      = basename( $file );
        $file_path = MultiVendorX()->multivendorx_logs_dir . '/' . $file;

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
