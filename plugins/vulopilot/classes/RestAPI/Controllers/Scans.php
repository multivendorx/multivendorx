<?php
/**
 * Scans controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\ScanRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /scans lists past scan runs; POST /scans triggers one synchronously
 * via VuloPilot()->scan_runner (Scanners\ScanRunner — already wired in
 * VuloPilot::init_classes()). Persistence of the result happens via
 * Services\ScanPersistenceListener's `vulopilot_scan_completed` hook, not
 * anything in this controller — it only asks the runner to run.
 *
 * @class       Scans controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Scans extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'scans';

    /**
     * @inheritDoc
     */
    public function register_routes() {
        register_rest_route(
            VuloPilot()->rest_namespace,
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
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function get_items( $request ) {
        $repository = new ScanRepository();

        return rest_ensure_response(
            $repository->find_all(
                array(
                    'page'     => absint( $request->get_param( 'page' ) ) ?: 1,
                    'per_page' => absint( $request->get_param( 'per_page' ) ) ?: 20,
                    'status'   => sanitize_key( (string) $request->get_param( 'status' ) ),
                )
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function create_item( $request ) {
        $scanner_id = sanitize_key( (string) $request->get_param( 'scanner_id' ) );

        if ( '' === $scanner_id || 'all' === $scanner_id ) {
            $results = VuloPilot()->scan_runner->run_all();
        } else {
            $results = array( $scanner_id => VuloPilot()->scan_runner->run( $scanner_id ) );
        }

        $failed = array_filter(
            $results,
            static fn( $result ) => null === $result || \VuloPilotCore\ValueObjects\ScanResult::STATUS_FAILED === $result->get_status()
        );

        if ( count( $failed ) === count( $results ) && count( $results ) > 0 ) {
            return new \WP_Error(
                'vulopilot_scan_failed',
                __( 'The scan could not be completed.', 'vulopilot' ),
                array( 'status' => 500 )
            );
        }

        return rest_ensure_response(
            array(
                'success'      => true,
                'scanner_ids'  => array_keys( $results ),
            )
        );
    }
}
