<?php
/**
 * TriggerInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\Automation;

/**
 * A trigger decides *when* AutomationEngine re-checks automations bound to
 * it — a cron tick (hourly/daily/weekly/monthly), a WordPress/WooCommerce
 * event (product created, order completed, …), or nothing at all for
 * triggers invoked directly (manual "Run now", REST/webhook call).
 * Implemented by AutomationEngine\Triggers\* (free) and any premium
 * trigger Pro registers via `vulopilot_trigger_sources`.
 *
 * @class       TriggerInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface TriggerInterface {

    /**
     * @return string Unique, stable trigger id (also the `trigger_type` value
     *                stored on an automation row).
     */
    public function get_id(): string;

    /**
     * @return string Human-readable label.
     */
    public function get_label(): string;

    /**
     * Hooks whatever WordPress/cron mechanism this trigger needs, calling
     * $on_fire whenever it fires. Triggers with no ambient firing mechanism
     * (manual, REST/webhook — invoked directly instead) may leave this a
     * no-op.
     *
     * @param callable $on_fire function( string $trigger_id, string $object_type, ?string $object_ref ): void.
     *                          $trigger_id is always $this->get_id() — passed back explicitly (rather than
     *                          relying on the closure's own scope) so AutomationEngine can filter automations
     *                          by `trigger_type` without needing a reference back to the trigger instance.
     * @return void
     */
    public function register( callable $on_fire ): void;
}
