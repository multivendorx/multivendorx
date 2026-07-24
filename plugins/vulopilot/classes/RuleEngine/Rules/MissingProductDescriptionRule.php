<?php
/**
 * MissingProductDescriptionRule class file.
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
 * WooCommerce AI's "AI Improvements" fix loop (ARCHITECTURE.md's Prompt 11):
 * turns Scanners\Basic\ProductMissingDescriptionScanner's Finding into a
 * recommendation to generate a long description, closed by
 * AIActions\Actions\WriteProductLongDescriptionAction — the same
 * Finding-to-Recommendation-to-Action shape as MissingAltTextRule's.
 *
 * @class       MissingProductDescriptionRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MissingProductDescriptionRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'missing-product-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product needs a description', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_type(): string {
        return RuleType::WARNING;
    }

    /**
     * @inheritDoc
     */
    public function get_priority(): int {
        return 60;
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
        return array( 'woocommerce', 'seo', 'conversion' );
    }

    /**
     * @inheritDoc
     */
    public function is_fixable(): bool {
        return true;
    }

    /**
     * @inheritDoc
     */
    public function requires_ai(): bool {
        return true;
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
        return 3;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        return 'woocommerce' === $finding->get_category() && 'missing_description' === ( $finding->get_meta()['check'] ?? null );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Write a product description', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'AI can draft a long description from this product\'s title, price, and category: %s', 'vulopilot' ),
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
