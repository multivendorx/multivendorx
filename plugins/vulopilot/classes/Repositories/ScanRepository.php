<?php
/**
 * ScanRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_scans (DATABASE.md).
 *
 * @class       ScanRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ScanRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'status', 'scanner_id' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'scan';
    }
}
