<?php
/**
 * MissingProductShortDescriptionRule class file.
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
 * Closed by AIActions\Actions\WriteProductShortDescriptionAction. Lower
 * priority/impact than MissingProductDescriptionRule — the short
 * description is a conversion nicety next to the add-to-cart button, not
 * the primary body of on-page product content the long description is.
 *
 * @class       MissingProductShortDescriptionRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MissingProductShortDescriptionRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'missing-product-short-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product needs a short description', 'vulopilot' );
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
        return 40;
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
        return array( 'woocommerce', 'conversion' );
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
        return 'woocommerce' === $finding->get_category() && 'missing_short_description' === ( $finding->get_meta()['check'] ?? null );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Write a short description', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'AI can draft a short summary for the add-to-cart area: %s', 'vulopilot' ),
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
