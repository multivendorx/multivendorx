<?php
/**
 * MonthlyTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

defined( 'ABSPATH' ) || exit;

/**
 * @class       MonthlyTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MonthlyTrigger extends AbstractCronTrigger {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'monthly';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Monthly', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_interval(): string {
        return 'monthly';
    }
}
