<?php
/**
 * Reports controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\ReportRepository;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * GET /reports backs src/pages/Reports/Reports.tsx's table; POST /reports
 * backs its "Generate report" action; GET /reports/types lists every
 * registered Reports\ReportTypeRegistry entry (what a "report builder" UI
 * would read to offer choices — see ReportTypeRegistry's own docblock for
 * why 'custom' isn't in that list itself); GET /reports/{id}/download
 * streams the generated file through this permission-checked handler
 * rather than ever exposing `file_path` to the client (DATABASE.md).
 *
 * POST now runs Reports\ReportGenerator::generate() synchronously — every
 * report type reads bounded, already-aggregated SQL (Reports\ReportGenerator's
 * own docblock), so this is a real generation, not the earlier `generating`-
 * status stub with no engine behind it.
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

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/types',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_report_types' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)/download',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'download_item' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
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

        $result = $repository->find_all(
            array(
                'page'     => absint( $request->get_param( 'page' ) ) ?: 1,
                'per_page' => absint( $request->get_param( 'per_page' ) ) ?: 20,
                'status'   => sanitize_key( (string) $request->get_param( 'status' ) ),
            )
        );

        // file_path is deliberately never exposed to the client (DATABASE.md) —
        // has_file tells the frontend whether the "Download" action is valid.
        $result['data'] = array_map(
            static function ( array $row ): array {
                $row['has_file'] = ! empty( $row['file_path'] );
                unset( $row['file_path'] );
                return $row;
            },
            $result['data']
        );

        return rest_ensure_response( $result );
    }

    /**
     * Lists every registered report type — what a report-builder UI reads
     * to offer choices instead of the hardcoded 'scan_summary' the Reports
     * page used before this pass.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response
     */
    public function get_report_types( $request ) {
        $types = array();

        foreach ( VuloPilot()->report_type_registry->get_all() as $report_type ) {
            $types[] = array(
                'id'    => $report_type->get_id(),
                'label' => $report_type->get_label(),
            );
        }

        return rest_ensure_response( $types );
    }

    /**
     * @inheritDoc
     */
    public function create_item( $request ) {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        $report_type = sanitize_key( (string) $request->get_param( 'report_type' ) ) ?: 'scan_summary';
        $format      = sanitize_key( (string) $request->get_param( 'format' ) ) ?: (string) $settings['default_report_format'];

        if ( ! VuloPilot()->report_exporter_registry->get_exporter( $format ) ) {
            return new \WP_Error( 'vulopilot_invalid_format', __( 'Unknown report format.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( 'custom' !== $report_type && ! VuloPilot()->report_type_registry->get_report_type( $report_type ) ) {
            return new \WP_Error( 'vulopilot_invalid_report_type', __( 'Unknown report type.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $period_days  = max( 1, absint( $settings['default_report_period_days'] ) ?: 30 );
        $period_end   = sanitize_text_field( (string) $request->get_param( 'period_end' ) ) ?: current_time( 'Y-m-d' );
        $period_start = sanitize_text_field( (string) $request->get_param( 'period_start' ) ) ?: gmdate( 'Y-m-d', strtotime( '-' . ( $period_days - 1 ) . ' days', strtotime( $period_end ) ) );
        $included     = array_map( 'sanitize_key', (array) $request->get_param( 'included_types' ) );

        $id = VuloPilot()->report_generator->generate(
            $report_type,
            $format,
            $period_start,
            $period_end,
            array( 'included_types' => $included ),
            get_current_user_id()
        );

        $repository = new ReportRepository();
        $report     = $repository->find( $id );

        return rest_ensure_response(
            array(
                'success' => 'failed' !== ( $report['status'] ?? 'failed' ),
                'id'      => $id,
                'status'  => $report['status'] ?? 'failed',
            )
        );
    }

    /**
     * Streams a generated report file rather than ever returning its
     * filesystem path to the client — same "don't trust the client with a
     * raw path" posture security.md's escaping/sanitizing baseline uses
     * elsewhere.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|void
     */
    public function download_item( $request ) {
        $id         = absint( $request->get_param( 'id' ) );
        $repository = new ReportRepository();
        $report     = $repository->find( $id );

        if ( ! $report ) {
            return new \WP_Error( 'vulopilot_report_not_found', __( 'Report not found.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        if ( 'ready' !== $report['status'] || empty( $report['file_path'] ) ) {
            return new \WP_Error( 'vulopilot_report_not_ready', __( 'This report is not ready to download yet.', 'vulopilot' ), array( 'status' => 409 ) );
        }

        $file_path = VuloPilot()->report_generator->resolve_file_path( basename( (string) $report['file_path'] ) );

        if ( ! file_exists( $file_path ) ) {
            return new \WP_Error( 'vulopilot_report_file_missing', __( 'This report\'s file could not be found on disk.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        $content_types = array(
            'csv'  => 'text/csv',
            'json' => 'application/json',
            'pdf'  => 'application/pdf',
        );

        nocache_headers();
        header( 'Content-Type: ' . ( $content_types[ $report['format'] ] ?? 'application/octet-stream' ) );
        header( 'Content-Disposition: attachment; filename="' . basename( $file_path ) . '"' );
        header( 'Content-Length: ' . filesize( $file_path ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_filesize -- reading the size of VuloPilot's own controlled reports file, not an arbitrary path.

        readfile( $file_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_read_readfile -- streaming VuloPilot's own controlled reports file to an already permission-checked, already-authenticated request; not arbitrary user input.
        exit;
    }
}
