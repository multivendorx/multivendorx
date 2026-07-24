<?php
/**
 * DailyTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

defined( 'ABSPATH' ) || exit;

/**
 * @class       DailyTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class DailyTrigger extends AbstractCronTrigger {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'daily';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Daily', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_interval(): string {
        return 'daily';
    }
}
