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
     * @var string[]
     */
    protected array $searchable_columns = array( 'name' );

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
     * Enabled/disabled counts, zero-filled — backs both the "Automation
     * Status" dashboard widget and the Automation table's status-count
     * pill bar. Delegates the actual grouped query to
     * AbstractRepository::count_by_column() rather than running its own
     * SQL (database.md: prefer one query over several, and don't duplicate
     * query-building logic that already exists).
     *
     * @return array{enabled: int, disabled: int}
     */
    public function get_status_counts(): array {
        return array_merge(
            array(
                'enabled'  => 0,
                'disabled' => 0,
            ),
            $this->count_by_column( 'status' )
        );
    }
}
