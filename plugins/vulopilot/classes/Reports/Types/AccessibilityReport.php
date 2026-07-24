<?php
/**
 * AccessibilityReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

defined( 'ABSPATH' ) || exit;

/**
 * Category `accessibility` findings for one period (SCANNERS.md).
 *
 * @class       AccessibilityReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AccessibilityReport extends AbstractCategoryReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'accessibility';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Accessibility Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_category(): string {
        return 'accessibility';
    }
}
