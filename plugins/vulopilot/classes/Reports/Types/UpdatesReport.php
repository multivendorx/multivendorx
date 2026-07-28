<?php
/**
 * UpdatesReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

defined( 'ABSPATH' ) || exit;

/**
 * Readme.txt's "Reports" → "Updates" pillar. Category `updates` findings
 * for one period — the same category Scanners\Basic\UpdatesScanner raises
 * into for pending WordPress core/plugin/theme updates (via
 * get_core_updates()/get_plugin_updates()/get_theme_updates()).
 *
 * @class       UpdatesReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class UpdatesReport extends AbstractCategoryReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'updates';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Updates Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_category(): string {
        return 'updates';
    }
}
