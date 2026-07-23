<?php
/**
 * SiteHealthSnapshotRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_site_health_snapshots (DATABASE.md) — a
 * once-per-day rollup, not a per-scan row, so this repository's shape is
 * narrower than the others: no generic filterable list, just "recent
 * days" (what the dashboard trend chart reads) and "upsert today's score"
 * (what ScanPersistenceListener calls after every completed scan).
 *
 * @class       SiteHealthSnapshotRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SiteHealthSnapshotRepository extends AbstractRepository {

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'site_health_snapshot';
    }

    /**
     * @param int $days How many days back to fetch.
     * @return array<int, array<string, mixed>> Ordered oldest first, for a left-to-right trend chart.
     */
    public function get_recent( int $days = 30 ): array {
        global $wpdb;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_table()} WHERE snapshot_date >= DATE_SUB(CURDATE(), INTERVAL %d DAY) ORDER BY snapshot_date ASC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $days
            ),
            ARRAY_A
        );

        return $rows ?: array();
    }

    /**
     * Most recent single snapshot row, or null if no scan has completed
     * yet. Deliberately its own method rather than `get_recent(1)` —
     * get_recent() is a range query ordered ASC for a left-to-right trend
     * chart, while this needs the newest row specifically (DESC LIMIT 1),
     * which is a different query shape, not just a smaller range
     * (naming-quality.md: a method name should say what it actually does).
     *
     * @return array<string, mixed>|null
     */
    public function get_latest(): ?array {
        global $wpdb;

        $row = $wpdb->get_row(
            "SELECT * FROM {$this->get_table()} ORDER BY snapshot_date DESC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
            ARRAY_A
        );

        return $row ?: null;
    }

    /**
     * Recalculates and upserts today's snapshot from current finding
     * counts. Idempotent — safe to call after every scan; the last call
     * on a given day simply overwrites that day's row (uniq_snapshot_date
     * in DATABASE.md's schema is what makes this a real upsert, not a
     * growing history of same-day duplicates).
     *
     * @param int $overall_score     0-100.
     * @param int $critical_count
     * @param int $high_count
     * @param int $medium_count
     * @param int $low_count
     * @return void
     */
    public function upsert_today( int $overall_score, int $critical_count, int $high_count, int $medium_count, int $low_count ): void {
        global $wpdb;

        $wpdb->query(
            $wpdb->prepare(
                "INSERT INTO {$this->get_table()} (snapshot_date, overall_score, critical_count, high_count, medium_count, low_count)
                VALUES (CURDATE(), %d, %d, %d, %d, %d)
                ON DUPLICATE KEY UPDATE overall_score = VALUES(overall_score), critical_count = VALUES(critical_count),
                    high_count = VALUES(high_count), medium_count = VALUES(medium_count), low_count = VALUES(low_count)", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $overall_score,
                $critical_count,
                $high_count,
                $medium_count,
                $low_count
            )
        );
    }
}
