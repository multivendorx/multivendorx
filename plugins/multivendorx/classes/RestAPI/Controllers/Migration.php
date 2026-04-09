<?php
/**
 * Migration REST API Controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;
/**
 * MultiVendorX REST API Migration Controller.
 *
 * @class       Migration class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Migration extends \WP_REST_Controller {

    /**
     * Route Base.
     *
     * @var string
     */
    protected $rest_base = 'migration';

    /**
     * Register AI Assistant API routes.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'process_action' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
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
        return current_user_can( 'manage_woocommerce' );
    }

    /**
     * Process a specific REST API action request.
     *
     * Verifies the nonce, checks the requested action, and delegates to the
     * corresponding method if it exists.
     *
     * @param \WP_REST_Request $request The REST request object containing the action and any parameters.
     *
     * @return array|\WP_Error The result of the action method, or an error array if invalid or unknown action.
     */
    public function process_action( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        $action = $request->get_param( 'action' );
        if ( is_array( $action ) ) {
            foreach ( $action as $act ) {
                if ( method_exists( $this, $act ) ) {
                    return $this->$act( $request );
                }
            }
        } elseif ( method_exists( $this, $action ) ) {
                return $this->$action( $request );
        }

        return array(
            'success' => false,
            'message' => 'Unknown action',
        );
    }

    public function import_stores( $request ) {
        $active_plugin = Utill::get_active_multivendor();
        if ( empty( $active_plugin ) ) {
            return rest_ensure_response(
                array(
					'success' => false,
					'message' => __( 'No active plugin found.', 'multivendorx' ),
                )
            );
        }

        $class    = "\\MultiVendorX\\Migration\\{$active_plugin}";
        $migrator = new $class();

        $created_store_ids = method_exists( $migrator, 'migrate_vendors' )
            ? $migrator->migrate_vendors()
            : array();

        $response_data = array(
            'success' => true,
            'data'    => $created_store_ids,
            'message' => __( 'Stores imported successfully.', 'multivendorx' ),
        );

        $response = rest_ensure_response( $response_data );
        return $response;
    }

    public function import_products( $request ) {
        $active_plugin = Utill::get_active_multivendor();
        if ( empty( $active_plugin ) ) {
            return rest_ensure_response(
                array(
					'success' => false,
					'message' => __( 'No active plugin found.', 'multivendorx' ),
                )
            );
        }

        $class    = "\\MultiVendorX\\Migration\\{$active_plugin}";
        $migrator = new $class();

        $created_products = method_exists( $migrator, 'migrate_products' )
            ? $migrator->migrate_products()
            : array();

        $response_data = array(
            'success' => true,
            'data'    => $created_products,
            'message' => __( 'Products imported successfully.', 'multivendorx' ),
        );

        $response = rest_ensure_response( $response_data );
        $response->header( 'X-WP-Total', count( $created_products ) );

        return $response;
    }
}
