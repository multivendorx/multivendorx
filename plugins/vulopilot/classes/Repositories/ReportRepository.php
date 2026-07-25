<?php
/**
 * ReportRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_reports (DATABASE.md).
 *
 * @class       ReportRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ReportRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'status', 'report_type' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'report';
    }

    /**
     * Generating/ready/failed counts, zero-filled — backs the Reports
     * table's status-count pill bar (same reasoning as
     * AutomationRepository::get_status_counts()).
     *
     * @return array{generating: int, ready: int, failed: int}
     */
    public function get_status_counts(): array {
        return array_merge(
            array(
                'generating' => 0,
                'ready'      => 0,
                'failed'     => 0,
            ),
            $this->count_by_column( 'status' )
        );
    }
}
