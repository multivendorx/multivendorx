<?php
/**
 * DuplicateProductSkuRule class file.
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
 * Not fixable/AI-assisted — which product's SKU is the "correct" one and
 * what the duplicate should be renamed to is a store-owner decision this
 * codebase has no basis to guess at. Surfaced anyway because a duplicate
 * SKU silently breaks inventory tracking and any integration keyed off it.
 *
 * @class       DuplicateProductSkuRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class DuplicateProductSkuRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'duplicate-product-sku';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Duplicate SKU breaks inventory tracking', 'vulopilot' );
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
        return 75;
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
        return 'woocommerce' === $finding->get_category() && 'duplicate_sku' === ( $finding->get_meta()['check'] ?? null );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Assign a unique SKU', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'This SKU is shared with another product, which breaks inventory and integration lookups that assume it is unique: %s', 'vulopilot' ),
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
