<?php
/**
 * MissingProductAttributesRule class file.
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
 * Not fixable/AI-assisted — deciding what attributes a variable product
 * should have (size, color, material, …) and what variations to generate
 * from them is a business decision, not something an AI action can safely
 * apply automatically. Still worth surfacing as a recommendation: this
 * scanner catches a product that looks published but cannot actually be
 * bought, which is high-impact even without an automated fix.
 *
 * @class       MissingProductAttributesRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MissingProductAttributesRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'missing-product-attributes';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Variable product cannot be purchased', 'vulopilot' );
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
        return 80;
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
    public function get_estimated_impact(): string {
        return Impact::HIGH;
    }

    /**
     * @inheritDoc
     */
    public function get_estimated_time_minutes(): int {
        return 10;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        return 'woocommerce' === $finding->get_category() && 'missing_attributes' === ( $finding->get_meta()['check'] ?? null );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Add attributes so this product can be purchased', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'This variable product has no attributes, so WooCommerce cannot generate any purchasable variation: %s', 'vulopilot' ),
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
