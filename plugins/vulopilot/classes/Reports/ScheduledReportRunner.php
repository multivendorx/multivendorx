<?php
/**
 * ScheduledReportRunner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports;

use VuloPilot\Repositories\ReportRepository;
use VuloPilot\Repositories\ScheduledJobRepository;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Hourly cron tick that runs every due `job_type = 'report'` row in
 * `vulopilot_scheduled_jobs` (Repositories\ScheduledJobRepository) — the
 * "scheduled reports" + "email reports" pieces of Prompt 13. Ticks hourly
 * rather than matching each job's own schedule 1:1 so a newly-created
 * daily/weekly/monthly report schedule is picked up within the hour instead
 * of needing its own dedicated wp-cron event per job (one hook shared by
 * every scheduled report, same reasoning Scheduler's own recurring-tick
 * pattern already uses).
 *
 * @class       ScheduledReportRunner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ScheduledReportRunner {

    private const CRON_HOOK = 'vulopilot_run_scheduled_reports';

    /**
     * @var ReportGenerator
     */
    private ReportGenerator $generator;

    /**
     * @var ScheduledJobRepository
     */
    private ScheduledJobRepository $jobs;

    /**
     * @param ReportGenerator             $generator Generates each due job's report.
     * @param ScheduledJobRepository|null $jobs      Defaults to a new instance — injectable for tests.
     */
    public function __construct( ReportGenerator $generator, ?ScheduledJobRepository $jobs = null ) {
        $this->generator = $generator;
        $this->jobs      = $jobs ?? new ScheduledJobRepository();

        add_action( 'init', array( $this, 'ensure_scheduled' ), 30 );
        add_action( self::CRON_HOOK, array( $this, 'run_due_jobs' ) );
    }

    /**
     * @return void
     */
    public function ensure_scheduled(): void {
        if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
            wp_schedule_event( time(), 'hourly', self::CRON_HOOK );
        }
    }

    /**
     * @return void
     */
    public function run_due_jobs(): void {
        foreach ( $this->jobs->get_due( 'report' ) as $job ) {
            $this->run_job( $job );
        }
    }

    /**
     * @param array<string, mixed> $job One `vulopilot_scheduled_jobs` row (job_type = 'report').
     * @return void
     */
    private function run_job( array $job ): void {
        $config = json_decode( (string) $job['config'], true );
        $config = is_array( $config ) ? $config : array();

        $report_type_id = sanitize_key( (string) ( $config['report_type'] ?? '' ) );
        $format         = sanitize_key( (string) ( $config['format'] ?? 'pdf' ) );
        $recipients     = array_filter( array_map( 'sanitize_email', (array) ( $config['recipients'] ?? array() ) ) );
        $included_types = array_map( 'sanitize_key', (array) ( $config['included_types'] ?? array() ) );

        [ $period_start, $period_end ] = $this->period_for_schedule( (string) $job['schedule'] );

        $status = 'success';

        try {
            $report_id = $this->generator->generate(
                $report_type_id,
                $format,
                $period_start,
                $period_end,
                array( 'included_types' => $included_types )
            );

            $this->maybe_email_report( $report_id, $recipients );
        } catch ( \Throwable $exception ) {
            $status = 'failure';
        }

        $this->jobs->record_run( (int) $job['id'], $status, $this->next_run_at( (string) $job['schedule'] ) );
    }

    /**
     * @param string $schedule 'daily'|'weekly'|'monthly'.
     * @return array{0: string, 1: string} [period_start, period_end], both Y-m-d.
     */
    private function period_for_schedule( string $schedule ): array {
        $end = current_time( 'Y-m-d' );

        switch ( $schedule ) {
            case 'weekly':
                $start = gmdate( 'Y-m-d', strtotime( '-6 days', strtotime( $end ) ) );
                break;
            case 'monthly':
                $start = gmdate( 'Y-m-d', strtotime( '-29 days', strtotime( $end ) ) );
                break;
            case 'daily':
            default:
                $start = $end;
        }

        return array( $start, $end );
    }

    /**
     * @param string $schedule 'daily'|'weekly'|'monthly'.
     * @return string MySQL datetime this schedule is next due at.
     */
    private function next_run_at( string $schedule ): string {
        $seconds_by_schedule = array(
            'daily'   => DAY_IN_SECONDS,
            'weekly'  => WEEK_IN_SECONDS,
            'monthly' => 30 * DAY_IN_SECONDS,
        );

        return gmdate( 'Y-m-d H:i:s', time() + ( $seconds_by_schedule[ $schedule ] ?? DAY_IN_SECONDS ) );
    }

    /**
     * @param int      $report_id  The just-generated report's row id.
     * @param string[] $recipients Sanitized email addresses — a no-op if empty.
     * @return void
     */
    private function maybe_email_report( int $report_id, array $recipients ): void {
        if ( empty( $recipients ) ) {
            return;
        }

        $report = ( new ReportRepository() )->find( $report_id );

        if ( ! $report || 'ready' !== $report['status'] ) {
            return;
        }

        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );
        $headers  = array();

        if ( ! empty( $settings['email_from_address'] ) && is_email( $settings['email_from_address'] ) ) {
            $from_name = $settings['email_from_name'] ?: get_bloginfo( 'name' );
            $headers[] = sprintf( 'From: %s <%s>', $from_name, $settings['email_from_address'] );
        }

        wp_mail(
            $recipients,
            sprintf(
                /* translators: 1: site name, 2: report type id. */
                __( '[%1$s] Your %2$s report is ready', 'vulopilot' ),
                get_bloginfo( 'name' ),
                $report['report_type']
            ),
            __( 'Your scheduled VuloPilot report has been generated. Sign in to your dashboard\'s Reports page to view and download it.', 'vulopilot' ),
            $headers
        );
    }
}
