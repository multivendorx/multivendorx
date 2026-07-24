<?php
/**
 * TriggerRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine;

use VuloPilotCore\Contracts\Automation\TriggerInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Same filter-based discovery shape as Scanners\ScannerRegistry,
 * RuleEngine\RuleRegistry, and AIActions\ActionRegistry — see any of
 * their docblocks for why this codebase doesn't use Modules.php's
 * folder-scan mechanism for a single-class extension point. Free's own 11
 * triggers always run; a Pro module or third party adds more via
 * `vulopilot_trigger_sources`.
 *
 * @class       TriggerRegistry class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class TriggerRegistry {

    /**
     * @var array<string, TriggerInterface>
     */
    private array $triggers = array();

    /**
     * @var callable|null function( string $trigger_id, string $object_type, ?string $object_ref ): void.
     */
    private $on_fire = null;

    /**
     * TriggerRegistry constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_triggers' ), 20 );
    }

    /**
     * Binds the callback every trigger's own register() should call once
     * it fires. Must be called before the 'init' priority-20 hook above
     * runs — AutomationEngine does so immediately after constructing this
     * registry, both during init_classes()'s own 'init' priority-0 hook.
     *
     * @param callable $on_fire function( string $trigger_id, string $object_type, ?string $object_ref ): void.
     * @return void
     */
    public function set_on_fire_callback( callable $on_fire ): void {
        $this->on_fire = $on_fire;
    }

    /**
     * Instantiates every registered trigger class, indexes it by id, and
     * calls its own register() so it can hook whatever it needs. A trigger
     * class that doesn't exist, or doesn't implement TriggerInterface, is
     * silently skipped rather than fataling the whole registry.
     *
     * @return void
     */
    public function register_triggers(): void {
        $trigger_classes = apply_filters( 'vulopilot_trigger_sources', $this->get_default_trigger_classes() );

        foreach ( $trigger_classes as $trigger_class ) {
            if ( ! is_string( $trigger_class ) || ! class_exists( $trigger_class ) ) {
                continue;
            }

            $trigger = new $trigger_class();

            if ( ! $trigger instanceof TriggerInterface ) {
                continue;
            }

            $this->triggers[ $trigger->get_id() ] = $trigger;

            if ( null !== $this->on_fire ) {
                $trigger->register( $this->on_fire );
            }
        }
    }

    /**
     * Free's own always-available triggers.
     *
     * @return string[] Fully-qualified class names implementing TriggerInterface.
     */
    private function get_default_trigger_classes(): array {
        return array(
            Triggers\HourlyTrigger::class,
            Triggers\DailyTrigger::class,
            Triggers\WeeklyTrigger::class,
            Triggers\MonthlyTrigger::class,
            Triggers\ProductCreatedTrigger::class,
            Triggers\ProductUpdatedTrigger::class,
            Triggers\PostPublishedTrigger::class,
            Triggers\OrderCompletedTrigger::class,
            Triggers\UserRegisteredTrigger::class,
            Triggers\ManualTrigger::class,
            Triggers\RestTrigger::class,
        );
    }

    /**
     * @param string $trigger_id A trigger's get_id().
     * @return TriggerInterface|null
     */
    public function get_trigger( string $trigger_id ): ?TriggerInterface {
        return $this->triggers[ $trigger_id ] ?? null;
    }

    /**
     * @return array<string, TriggerInterface>
     */
    public function get_all_triggers(): array {
        return $this->triggers;
    }
}
