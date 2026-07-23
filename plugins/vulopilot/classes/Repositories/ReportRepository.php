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
}
