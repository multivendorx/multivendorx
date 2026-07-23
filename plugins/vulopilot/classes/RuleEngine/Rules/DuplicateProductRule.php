<?php
/**
 * DuplicateProductRule class file.
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
 * Not fixable/AI-assisted — whether two identically-titled products are a
 * genuine accidental duplicate (merge/delete one) or intentional (e.g. two
 * different variations sold as separate simple products) is a judgment
 * call for the store owner, not something to resolve automatically.
 *
 * @class       DuplicateProductRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class DuplicateProductRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'duplicate-product';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Review possible duplicate product', 'vulopilot' );
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
        return 55;
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
        return 10;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        return 'woocommerce' === $finding->get_category() && 'duplicate_title' === ( $finding->get_meta()['check'] ?? null );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Review this possible duplicate', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'Decide whether to merge, rename, or keep both listings: %s', 'vulopilot' ),
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
