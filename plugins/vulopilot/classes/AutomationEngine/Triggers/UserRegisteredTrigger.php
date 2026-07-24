<?php
/**
 * UserRegisteredTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

defined( 'ABSPATH' ) || exit;

/**
 * @class       UserRegisteredTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class UserRegisteredTrigger extends AbstractObjectEventTrigger {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'user_registered';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'User registered', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_wp_hook(): string {
        return 'user_register';
    }

    /**
     * @inheritDoc
     */
    protected function get_accepted_args(): int {
        return 1;
    }

    /**
     * @inheritDoc
     */
    protected function get_object_type(): string {
        return 'user';
    }

    /**
     * @inheritDoc
     */
    protected function extract_object_id( array $hook_args ): ?int {
        return isset( $hook_args[0] ) ? absint( $hook_args[0] ) : null;
    }
}
