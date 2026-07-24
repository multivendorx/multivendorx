<?php
/**
 * ManualTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

use VuloPilotCore\Contracts\Automation\TriggerInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Marker trigger for an automation only ever run via its "Run now" REST
 * action (AutomationEngine::run_now()) — nothing fires it ambiently, so
 * register() is a no-op. Exists so 'manual' is still a real, enumerable
 * `trigger_type` value the admin UI's trigger picker can list, rather than
 * a magic string with no corresponding TriggerRegistry entry.
 *
 * @class       ManualTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ManualTrigger implements TriggerInterface {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'manual';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Manual (Run now)', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function register( callable $on_fire ): void {
        // Intentionally empty — see class docblock.
    }
}
