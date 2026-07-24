<?php
/**
 * SecurityReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

defined( 'ABSPATH' ) || exit;

/**
 * Category `security` findings for one period (SCANNERS.md).
 *
 * @class       SecurityReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SecurityReport extends AbstractCategoryReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'security';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Security Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_category(): string {
        return 'security';
    }
}
