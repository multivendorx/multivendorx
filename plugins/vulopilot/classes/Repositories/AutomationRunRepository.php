<?php
/**
 * AutomationRunRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_automation_runs (DATABASE.md) — one row per
 * time AutomationEngine ran (or attempted to run) an automation's actions.
 * `result_log` stores the JSON-encoded array of
 * VuloPilotCore\ValueObjects\AutomationRunResult::to_array() entries, one
 * per action executed.
 *
 * @class       AutomationRunRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AutomationRunRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'automation_id', 'status', 'triggered_by' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'automation_run';
    }

    /**
     * Run/success/failure counts for one date range — what
     * Reports\Types\AutomationReport's headline summary reads.
     *
     * @param string $period_start Y-m-d, inclusive.
     * @param string $period_end   Y-m-d, inclusive.
     * @return array{total: int, by_status: array<string, int>}
     */
    public function get_stats_for_period( string $period_start, string $period_end ): array {
        global $wpdb;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT status, COUNT(*) AS total FROM {$this->get_table()} WHERE DATE(created_at) BETWEEN %s AND %s GROUP BY status", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $period_start,
                $period_end
            ),
            ARRAY_A
        );

        $by_status = array();

        foreach ( (array) $rows as $row ) {
            $by_status[ $row['status'] ] = (int) $row['total'];
        }

        return array(
            'total'     => array_sum( $by_status ),
            'by_status' => $by_status,
        );
    }

    /**
     * Per-automation run counts for one date range, joined against
     * `vulopilot_automations` for the display name — what the report's
     * "automations" section table reads, one query instead of an N+1 name
     * lookup per row (performance.md).
     *
     * @param string $period_start Y-m-d, inclusive.
     * @param string $period_end   Y-m-d, inclusive.
     * @return array<int, array{automation_id: int, name: string, runs: int, succeeded: int, failed: int}>
     */
    public function get_breakdown_by_automation_for_period( string $period_start, string $period_end ): array {
        global $wpdb;

        $automations_table = $wpdb->prefix . Utill::TABLES['automation'];

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT r.automation_id AS automation_id, a.name AS name,
                        COUNT(*) AS runs,
                        SUM(CASE WHEN r.status = 'success' THEN 1 ELSE 0 END) AS succeeded,
                        SUM(CASE WHEN r.status = 'failure' THEN 1 ELSE 0 END) AS failed
                 FROM {$this->get_table()} r
                 LEFT JOIN {$automations_table} a ON a.id = r.automation_id
                 WHERE DATE(r.created_at) BETWEEN %s AND %s
                 GROUP BY r.automation_id, a.name
                 ORDER BY runs DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $period_start,
                $period_end
            ),
            ARRAY_A
        );

        return array_map(
            static fn( array $row ): array => array(
                'automation_id' => (int) $row['automation_id'],
                'name'          => $row['name'] ?? __( 'Deleted automation', 'vulopilot' ),
                'runs'          => (int) $row['runs'],
                'succeeded'     => (int) $row['succeeded'],
                'failed'        => (int) $row['failed'],
            ),
            $rows ?: array()
        );
    }
}
