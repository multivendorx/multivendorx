<?php
/**
 * AutomationRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_automations (DATABASE.md).
 *
 * @class       AutomationRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AutomationRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'status' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'automation';
    }

    /**
     * @return int Count of currently enabled automations — what the
     *             dashboard's "active automations" stat card reads.
     */
    public function count_enabled(): int {
        global $wpdb;

        return (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->get_table()} WHERE status = 'enabled'" // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        );
    }

    /**
     * Enabled/disabled counts in one grouped query — what the "Automation
     * Status" dashboard widget reads, without a second round trip beyond
     * count_enabled() (kept as-is since the existing dashboard stat card
     * already reads it).
     *
     * @return array{enabled: int, disabled: int}
     */
    public function get_status_counts(): array {
        global $wpdb;

        $counts = array(
            'enabled'  => 0,
            'disabled' => 0,
        );

        $rows = $wpdb->get_results(
            "SELECT status, COUNT(*) AS total FROM {$this->get_table()} GROUP BY status", // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
            ARRAY_A
        );

        foreach ( (array) $rows as $row ) {
            if ( array_key_exists( $row['status'], $counts ) ) {
                $counts[ $row['status'] ] = (int) $row['total'];
            }
        }

        return $counts;
    }
}
