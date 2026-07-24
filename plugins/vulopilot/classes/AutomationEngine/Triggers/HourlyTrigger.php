<?php
/**
 * HourlyTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

defined( 'ABSPATH' ) || exit;

/**
 * @class       HourlyTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class HourlyTrigger extends AbstractCronTrigger {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'hourly';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Hourly', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_interval(): string {
        return 'hourly';
    }
}
