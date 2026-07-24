<?php
/**
 * RestTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

use VuloPilotCore\Contracts\Automation\TriggerInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Marker trigger for an automation meant to be run by an external system
 * calling `POST /automations/{id}/run` (the same endpoint ManualTrigger's
 * "Run now" button calls) rather than by a site owner clicking a button —
 * same no-op register() as ManualTrigger, since nothing here fires it
 * ambiently either. A dedicated, unauthenticated webhook URL with its own
 * per-automation secret is real, additional surface area (a new kind of
 * credential to generate/rotate/revoke) deliberately not built in this
 * pass — see this plugin's ARCHITECTURE.md-style "not here yet" notes.
 * Today, an external caller must authenticate the same way any other
 * VuloPilot REST call does (a logged-in `manage_options` user's nonce).
 *
 * @class       RestTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RestTrigger implements TriggerInterface {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'rest';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'REST/Webhook call', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function register( callable $on_fire ): void {
        // Intentionally empty — see class docblock.
    }
}
