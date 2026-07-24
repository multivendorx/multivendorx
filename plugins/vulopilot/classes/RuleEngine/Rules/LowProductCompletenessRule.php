<?php
/**
 * LowProductCompletenessRule class file.
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
 * The one recommendation with requires_ai() true but is_fixable() false —
 * Scanners\Basic\ProductCompletenessScanner's score is a composite across
 * 7 fields, so there is no single AIAction that resolves it directly the
 * way MissingProductDescriptionRule pairs with one action. AI can still
 * help (e.g. the AI Assistant page reasoning about which specific field to
 * tackle first), just not through the propose/approve one-click flow.
 *
 * @class       LowProductCompletenessRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class LowProductCompletenessRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'low-product-completeness';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product listing needs more detail', 'vulopilot' );
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
        return 45;
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
    public function requires_ai(): bool {
        return true;
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
        return 15;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        return 'woocommerce' === $finding->get_category() && 'low_completeness' === ( $finding->get_meta()['check'] ?? null );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Fill in the missing product details', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title, which already includes the completeness percentage. */
                __( 'This listing is missing several of image, categories, tags, descriptions, SKU, or price: %s', 'vulopilot' ),
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
