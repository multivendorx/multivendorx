<?php
/**
 * AbstractCronTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

use VuloPilotCore\Contracts\Automation\TriggerInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Base for every schedule-based trigger (Hourly/Daily/Weekly/Monthly) —
 * schedules its own recurring tick via Scheduler\Scheduler (custom
 * 'weekly'/'monthly' intervals registered there) and, on each tick, calls
 * $on_fire with object_type '*' — AutomationEngine's convention for "check
 * every currently-open finding against automations bound to this trigger",
 * as opposed to an event-trigger's single-object check.
 *
 * @class       AbstractCronTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractCronTrigger implements TriggerInterface {

    /**
     * @return string A registered wp-cron recurrence name (e.g. 'hourly', 'daily', 'weekly', 'monthly').
     */
    abstract protected function get_interval(): string;

    /**
     * @inheritDoc
     */
    public function register( callable $on_fire ): void {
        $hook = 'vulopilot_automation_tick_' . $this->get_id();

        VuloPilot()->scheduler->schedule_recurring( $hook, $this->get_interval() );

        add_action(
            $hook,
            function () use ( $on_fire ) {
                $on_fire( $this->get_id(), '*', null );
            }
        );
    }
}
