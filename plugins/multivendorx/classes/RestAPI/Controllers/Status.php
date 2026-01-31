<?php
/**
 * MultiVendorX REST API Status Controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Install;
use MultiVendorX\Utill;
use MultiVendorX\Store\StoreUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Status Controller.
 *
 * @class       Status class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Status extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'status';

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
                    'methods'             => 'POST',
                    'callback'            => array( $this, 'update_tools_action' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
			)
        );
    }

    /**
     * Get a single item from the collection
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' );
    }

    /**
     * Check if a given request has access to update settings.
     *
     * @param object $request The REST request object.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Get all system info data.
     *
     * @param  object $request Request data.
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
            $key = $request->get_param( 'key' );
            if ( 'default_pages' === $key ) {
                $install = new Install();
                $install->plugin_create_pages();
                return rest_ensure_response( true );
            }
            $system_info = MultiVendorX()->status->get_system_info();
            return rest_ensure_response( $system_info );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    public function update_tools_action( $request ) {
        global $wpdb;
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
            $key = $request->get_param( 'key' );
            if ( 'transients' === $key ) {
                $deleted = false;
                $stores  = StoreUtil::get_stores();

                foreach ( $stores as $store ) {
                    $store_id = $store['ID'] ?? 0;

                    $transients_to_clear = array();

                    // Transient prefixes that include vendor ID
                    $store_transient_names = apply_filters(
                        'mvx_clear_all_transients_included_vendor_id',
                        array(
                            'multivendorx_visitor_stats_data_',
                            'multivendorx_report_data_',
                            'multivendorx_withdrawal_data_',
                            'multivendorx_review_data_',
                            'multivendorx_announcement_data_',
                            'multivendorx_dashboard_data_',
                        )
                    );

                    foreach ( $store_transient_names as $transient ) {
                        $transients_to_clear[] = $transient . $store_id;
                    }

                    $transients_to_clear = apply_filters(
                        'mvx_vendor_before_transients_to_clear',
                        $transients_to_clear,
                        $store_id
                    );

                    // Delete transients
                    foreach ( $transients_to_clear as $transient ) {
                        if ( delete_transient( $transient ) ) {
                            $deleted = true;
                        }
                    }

                    do_action( 'mvx_vendor_clear_all_transients', $store_id );
                }
                return rest_ensure_response( $deleted );
            }

            if ( 'visitor' === $key ) {
                $table  = $wpdb->prefix . Utill::TABLES['visitors_stats'];
                $result = $wpdb->query( "TRUNCATE TABLE `$table`" );

                if ( $result ) {
                    $message = __( 'MultiVendorX visitors stats successfully deleted', 'multivendorx' );
                    return rest_ensure_response( $message );
                }
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
}
