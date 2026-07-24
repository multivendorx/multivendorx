<?php
/**
 * ScheduledJobRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_scheduled_jobs (DATABASE.md) — the queryable
 * companion registry to wp-cron's own opaque `cron` option, as documented
 * there ("wp-cron's own storage ... can't be efficiently listed, sorted, or
 * filtered by a REST endpoint"). This table existed in the schema since the
 * Scheduler/Automation Engine pass but had no repository or consumer yet
 * until Reports\ReportGenerator's scheduled-report feature needed exactly
 * this: a queryable "which recurring jobs exist, and did the last run
 * succeed" list.
 *
 * @class       ScheduledJobRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ScheduledJobRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'job_type', 'is_enabled' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'scheduled_job';
    }

    /**
     * @param string $job_key Unique job key (uniq_job_key).
     * @return array<string, mixed>|null
     */
    public function find_by_key( string $job_key ): ?array {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_table()} WHERE job_key = %s", $job_key ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $row ?: null;
    }

    /**
     * Every enabled job of one type due to run now or earlier — what
     * Scheduler's cron tick reads to decide what to actually execute this
     * pass, rather than firing every enabled job of that type unconditionally.
     *
     * @param string $job_type e.g. 'report'.
     * @return array<int, array<string, mixed>>
     */
    public function get_due( string $job_type ): array {
        global $wpdb;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_table()} WHERE job_type = %s AND is_enabled = 1 AND (next_run_at IS NULL OR next_run_at <= %s)", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $job_type,
                current_time( 'mysql' )
            ),
            ARRAY_A
        );

        return $rows ?: array();
    }

    /**
     * Records the outcome of a run and advances next_run_at, so the next
     * get_due() call doesn't fire the same job again until its schedule
     * says it should.
     *
     * @param int    $id           Row id.
     * @param string $status       'success'|'failure'.
     * @param string $next_run_at  MySQL datetime string for the next due run.
     * @return bool
     */
    public function record_run( int $id, string $status, string $next_run_at ): bool {
        return $this->update(
            $id,
            array(
                'last_run_at'     => current_time( 'mysql' ),
                'last_run_status' => $status,
                'next_run_at'     => $next_run_at,
            )
        );
    }
}
