<?php
/**
 * AbstractObjectEventTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

use VuloPilotCore\Contracts\Automation\TriggerInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Base for every single-WordPress/WooCommerce-hook trigger (product
 * created/updated, post published, order completed, user registered) —
 * hooks the concrete class's own action, and, once it fires, calls
 * $on_fire scoped to the specific object involved rather than AutomationEngine
 * re-checking every open finding the way a cron trigger's '*' does.
 *
 * @class       AbstractObjectEventTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractObjectEventTrigger implements TriggerInterface {

    /**
     * @return string The WordPress/WooCommerce action hook to bind to.
     */
    abstract protected function get_wp_hook(): string;

    /**
     * @return int How many of the hook's own callback arguments to accept.
     */
    abstract protected function get_accepted_args(): int;

    /**
     * @return string object_type value to scope the resulting check to (matches Finding::get_object_type()).
     */
    abstract protected function get_object_type(): string;

    /**
     * @param array $hook_args Raw args WordPress passed the hook callback.
     * @return int|null The object id to scope the check to, or null to skip firing.
     */
    abstract protected function extract_object_id( array $hook_args ): ?int;

    /**
     * Extra condition beyond "the hook fired" — e.g. PostPublishedTrigger
     * only wants a genuine draft-to-publish transition. Defaults to always
     * firing, for hooks (like a WooCommerce status-change action) that are
     * already specific enough on their own.
     *
     * @param array $hook_args Raw args WordPress passed the hook callback.
     * @return bool
     */
    protected function should_fire( array $hook_args ): bool {
        return true;
    }

    /**
     * @inheritDoc
     */
    public function register( callable $on_fire ): void {
        add_action(
            $this->get_wp_hook(),
            function ( ...$hook_args ) use ( $on_fire ) {
                if ( ! $this->should_fire( $hook_args ) ) {
                    return;
                }

                $object_id = $this->extract_object_id( $hook_args );

                if ( $object_id ) {
                    $on_fire( $this->get_id(), $this->get_object_type(), (string) $object_id );
                }
            },
            10,
            $this->get_accepted_args()
        );
    }
}
