<?php
/**
 * PerformanceReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

defined( 'ABSPATH' ) || exit;

/**
 * Readme.txt's "Reports" → "Performance" pillar. Category `performance`
 * findings for one period — the same category Scanners\Basic\PerformanceScanner
 * raises into (e.g. an oversized autoloaded `wp_options` table).
 *
 * @class       PerformanceReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PerformanceReport extends AbstractCategoryReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'performance';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Performance Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_category(): string {
        return 'performance';
    }
}
