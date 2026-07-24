<?php
/**
 * MissingProductCategoryRule class file.
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
 * Not fixable/AI-assisted — which category (or categories) a product
 * belongs to is a store-taxonomy decision, not something to guess and
 * apply automatically. Still worth its own recommendation: an
 * uncategorized product is effectively unreachable through normal shop
 * browsing.
 *
 * @class       MissingProductCategoryRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MissingProductCategoryRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'missing-product-category';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product is not reachable by category browse', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_type(): string {
        return RuleType::SUGGESTION;
    }

    /**
     * @inheritDoc
     */
    public function get_priority(): int {
        return 50;
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
        return array( 'woocommerce', 'catalog-quality' );
    }

    /**
     * @inheritDoc
     */
    public function get_estimated_impact(): string {
        return Impact::MEDIUM;
    }

    /**
     * @inheritDoc
     */
    public function get_estimated_time_minutes(): int {
        return 2;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        return 'woocommerce' === $finding->get_category() && 'missing_category' === ( $finding->get_meta()['check'] ?? null );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Assign this product to a category', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'Without a category, this product does not appear in any shop category browse: %s', 'vulopilot' ),
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
