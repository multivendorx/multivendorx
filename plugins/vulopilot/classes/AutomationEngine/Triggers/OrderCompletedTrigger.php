<?php
/**
 * OrderCompletedTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

defined( 'ABSPATH' ) || exit;

/**
 * @class       OrderCompletedTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OrderCompletedTrigger extends AbstractObjectEventTrigger {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'order_completed';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Order completed', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_wp_hook(): string {
        return 'woocommerce_order_status_completed';
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
        return 'order';
    }

    /**
     * @inheritDoc
     */
    protected function extract_object_id( array $hook_args ): ?int {
        return isset( $hook_args[0] ) ? absint( $hook_args[0] ) : null;
    }
}
