<?php
/**
 * ReportSchedules controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\ScheduledJobRepository;

defined( 'ABSPATH' ) || exit;

/**
 * CRUD-lite for `vulopilot_scheduled_jobs` rows scoped to `job_type =
 * 'report'` — the "scheduled reports" half of Prompt 13's Reports Module
 * (Reports\ScheduledReportRunner's hourly cron tick is what actually
 * generates and emails them; this controller only manages the job
 * definitions). Deliberately its own controller rather than a generic
 * "scheduled jobs" one — every existing controller in this codebase is
 * resource-specific (rest-api.md), and report scheduling is the only
 * `vulopilot_scheduled_jobs` consumer that exists today.
 *
 * @class       ReportSchedules controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ReportSchedules extends \WP_REST_Controller {

    private const JOB_TYPE = 'report';

    /**
     * @var string
     */
    protected $rest_base = 'report-schedules';

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
            '/' . $this->rest_base . '/(?P<id>\d+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array( $this, 'delete_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
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
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function get_items( $request ) {
        $repository = new ScheduledJobRepository();

        return rest_ensure_response(
            $repository->find_all(
                array(
                    'page'     => absint( $request->get_param( 'page' ) ) ?: 1,
                    'per_page' => absint( $request->get_param( 'per_page' ) ) ?: 20,
                    'job_type' => self::JOB_TYPE,
                )
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function create_item( $request ) {
        $report_type = sanitize_key( (string) $request->get_param( 'report_type' ) );
        $format      = sanitize_key( (string) $request->get_param( 'format' ) ) ?: 'pdf';
        $schedule    = sanitize_key( (string) $request->get_param( 'schedule' ) );
        $recipients  = array_filter( array_map( 'sanitize_email', (array) $request->get_param( 'recipients' ) ) );
        $included    = array_map( 'sanitize_key', (array) $request->get_param( 'included_types' ) );

        if ( '' === $report_type || ( 'custom' !== $report_type && ! VuloPilot()->report_type_registry->get_report_type( $report_type ) ) ) {
            return new \WP_Error( 'vulopilot_invalid_report_type', __( 'Unknown report type.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( ! in_array( $schedule, array( 'daily', 'weekly', 'monthly' ), true ) ) {
            return new \WP_Error( 'vulopilot_invalid_schedule', __( 'Schedule must be daily, weekly, or monthly.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( ! VuloPilot()->report_exporter_registry->get_exporter( $format ) ) {
            return new \WP_Error( 'vulopilot_invalid_format', __( 'Unknown report format.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $repository = new ScheduledJobRepository();
        $job_key    = self::JOB_TYPE . '_' . $report_type . '_' . wp_generate_password( 8, false );

        $id = $repository->insert(
            array(
                'job_key'     => $job_key,
                'job_type'    => self::JOB_TYPE,
                'schedule'    => $schedule,
                'config'      => wp_json_encode(
                    array(
						'report_type'    => $report_type,
						'format'         => $format,
						'recipients'     => $recipients,
						'included_types' => $included,
                    )
                ),
                'is_enabled'  => 1,
                'next_run_at' => current_time( 'mysql' ),
            )
        );

        return rest_ensure_response(
            array(
                'success' => true,
                'id'      => $id,
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function update_item( $request ) {
        $id         = absint( $request->get_param( 'id' ) );
        $is_enabled = $request->get_param( 'is_enabled' );

        $repository = new ScheduledJobRepository();
        $job        = $repository->find( $id );

        if ( ! $job || self::JOB_TYPE !== $job['job_type'] ) {
            return new \WP_Error( 'vulopilot_schedule_not_found', __( 'Scheduled report not found.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        if ( ! $repository->update( $id, array( 'is_enabled' => $is_enabled ? 1 : 0 ) ) ) {
            return new \WP_Error( 'vulopilot_update_failed', __( 'Could not update this scheduled report.', 'vulopilot' ), array( 'status' => 500 ) );
        }

        return rest_ensure_response(
            array(
                'success' => true,
                'id'      => $id,
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function delete_item( $request ) {
        $id         = absint( $request->get_param( 'id' ) );
        $repository = new ScheduledJobRepository();
        $job        = $repository->find( $id );

        if ( ! $job || self::JOB_TYPE !== $job['job_type'] ) {
            return new \WP_Error( 'vulopilot_schedule_not_found', __( 'Scheduled report not found.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        if ( ! $repository->delete( $id ) ) {
            return new \WP_Error( 'vulopilot_delete_failed', __( 'Could not delete this scheduled report.', 'vulopilot' ), array( 'status' => 500 ) );
        }

        return rest_ensure_response( array( 'success' => true ) );
    }
}
