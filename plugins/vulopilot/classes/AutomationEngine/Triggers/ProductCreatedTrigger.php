<?php
/**
 * ProductCreatedTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

defined( 'ABSPATH' ) || exit;

/**
 * @class       ProductCreatedTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductCreatedTrigger extends AbstractObjectEventTrigger {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product_created';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product created', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_wp_hook(): string {
        return 'woocommerce_new_product';
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
        return 'product';
    }

    /**
     * @inheritDoc
     */
    protected function extract_object_id( array $hook_args ): ?int {
        return isset( $hook_args[0] ) ? absint( $hook_args[0] ) : null;
    }
}
