<?php
/**
 * ProductInventoryIssueRule class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RuleEngine\Rules;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Impact;
use VuloPilotCore\ValueObjects\Recommendation;
use VuloPilotCore\ValueObjects\RuleType;

defined( 'ABSPATH' ) || exit;

/**
 * Covers both of Scanners\Basic\ProductInventoryHealthScanner's checks
 * ('invalid_stock_quantity' and 'instock_zero_quantity') under one rule —
 * both are the same underlying problem (the tracked quantity doesn't
 * reflect reality) and warrant the identical recommendation: go verify and
 * correct the real stock count. Not AI-fixable — the actual quantity is
 * physical-world information this codebase has no way to know.
 *
 * @class       ProductInventoryIssueRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductInventoryIssueRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-inventory-issue';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Inventory quantity looks incorrect', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_type(): string {
        return RuleType::ERROR;
    }

    /**
     * @inheritDoc
     */
    public function get_priority(): int {
        return 70;
    }

    /**
     * @inheritDoc
     */
    public function get_categories(): array {
        return array( 'woocommerce' );
    }

    /**
     * @inheritDoc
     */
    public function get_tags(): array {
        return array( 'woocommerce', 'inventory' );
    }

    /**
     * @inheritDoc
     */
    public function get_estimated_impact(): string {
        return Impact::HIGH;
    }

    /**
     * @inheritDoc
     */
    public function get_estimated_time_minutes(): int {
        return 5;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        return 'woocommerce' === $finding->get_category()
            && in_array( $finding->get_meta()['check'] ?? null, array( 'invalid_stock_quantity', 'instock_zero_quantity' ), true );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Verify and correct the stock quantity', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'This product\'s tracked inventory does not match a state WooCommerce can sell against safely: %s', 'vulopilot' ),
                $finding->get_title()
            ),
            $this->get_type(),
            $this->get_priority(),
            $this->get_categories(),
            $this->get_tags(),
            $this->is_fixable(),
            $this->requires_ai(),
            $this->get_estimated_impact(),
            $this->get_estimated_time_minutes(),
            $finding->get_object_type(),
            $finding->get_object_ref()
        );
    }
}
