<?php
/**
 * ActionRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine;

use VuloPilotCore\Contracts\Automation\ActionInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Same filter-based discovery shape as Scanners\ScannerRegistry,
 * RuleEngine\RuleRegistry, and AIActions\ActionRegistry. Deliberately a
 * separate registry/filter (`vulopilot_automation_action_sources`) from
 * AIActions\ActionRegistry's `vulopilot_ai_action_sources` — the two
 * interfaces (Contracts\Automation\ActionInterface vs Contracts\AI\AIActionInterface)
 * are not interchangeable, so mixing their discovery would only invite a
 * class implementing the wrong one being silently skipped.
 *
 * @class       ActionRegistry class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ActionRegistry {

    /**
     * @var array<string, ActionInterface>
     */
    private array $actions = array();

    /**
     * ActionRegistry constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_actions' ), 20 );
    }

    /**
     * @return void
     */
    public function register_actions(): void {
        $action_classes = apply_filters( 'vulopilot_automation_action_sources', $this->get_default_action_classes() );

        foreach ( $action_classes as $action_class ) {
            if ( ! is_string( $action_class ) || ! class_exists( $action_class ) ) {
                continue;
            }

            $action = new $action_class();

            if ( ! $action instanceof ActionInterface ) {
                continue;
            }

            $this->actions[ $action->get_id() ] = $action;
        }
    }

    /**
     * @return string[]
     */
    private function get_default_action_classes(): array {
        return array(
            Actions\SendEmailAction::class,
            Actions\CreateNotificationAction::class,
            Actions\ResolveFindingAction::class,
            Actions\RunAiActionAction::class,
        );
    }

    /**
     * @param string $action_id An action's get_id().
     * @return ActionInterface|null
     */
    public function get_action( string $action_id ): ?ActionInterface {
        return $this->actions[ $action_id ] ?? null;
    }

    /**
     * @return array<string, ActionInterface>
     */
    public function get_all_actions(): array {
        return $this->actions;
    }
}
