<?php
/**
 * Reports controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\ReportRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /reports backs src/pages/Reports/Reports.tsx's table; POST /reports
 * backs its "Generate report" action.
 *
 * POST only ever inserts a `generating`-status row today — there is no
 * actual PDF/report-generation engine yet (that's the Pro
 * `ComplianceReports` module, per ARCHITECTURE.md, not built). This is
 * deliberately honest about that: it does not fake a `ready` status or a
 * file_path that doesn't exist.
 *
 * @class       Reports controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Reports extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'reports';

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
        $repository = new ReportRepository();

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
        $repository  = new ReportRepository();
        $report_type = sanitize_key( (string) $request->get_param( 'report_type' ) ) ?: 'scan_summary';
        $format      = sanitize_key( (string) $request->get_param( 'format' ) ) ?: 'pdf';

        $id = $repository->insert(
            array(
                'report_type'  => $report_type,
                'format'       => $format,
                'status'       => 'generating',
                'generated_by' => get_current_user_id(),
            )
        );

        return rest_ensure_response( array( 'success' => true, 'id' => $id ) );
    }
}
