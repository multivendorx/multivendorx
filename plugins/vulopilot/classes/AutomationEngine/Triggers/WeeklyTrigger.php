<?php
/**
 * WeeklyTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

defined( 'ABSPATH' ) || exit;

/**
 * @class       WeeklyTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WeeklyTrigger extends AbstractCronTrigger {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'weekly';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Weekly', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_interval(): string {
        return 'weekly';
    }
}
