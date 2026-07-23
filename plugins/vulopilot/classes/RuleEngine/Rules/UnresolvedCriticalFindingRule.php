<?php
/**
 * UnresolvedCriticalFindingRule class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RuleEngine\Rules;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Impact;
use VuloPilotCore\ValueObjects\Recommendation;
use VuloPilotCore\ValueObjects\Severity;
use VuloPilotCore\ValueObjects\RuleType;

defined( 'ABSPATH' ) || exit;

/**
 * The one cross-cutting rule in this set: applies to any Finding with
 * Severity::CRITICAL regardless of category (get_categories() returns an
 * empty array — see RuleInterface's docblock for what that means), and
 * always produces the engine's highest-priority recommendation. Not
 * marked fixable — a critical finding could come from any scanner
 * (WooCommerceScanner's missing checkout page, RestApiScanner's exposed
 * user data, …) and there's no single generic fix to offer; a
 * category-specific rule with a real fix (like CoreUpdateAvailableRule)
 * can still also match the same Finding and offer one.
 *
 * @class       UnresolvedCriticalFindingRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class UnresolvedCriticalFindingRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'unresolved-critical-finding';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Critical issue needs attention', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_type(): string {
        return RuleType::CRITICAL;
    }

    /**
     * @inheritDoc
     */
    public function get_priority(): int {
        return 100;
    }

    /**
     * @inheritDoc
     */
    public function get_categories(): array {
        return array();
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
        return 15;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        return Severity::CRITICAL === $finding->get_severity();
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'Critical: %s', 'vulopilot' ),
                $finding->get_title()
            ),
            $finding->get_description() ?? __( 'This was flagged as critical and should be addressed as soon as possible.', 'vulopilot' ),
            $this->get_type(),
            $this->get_priority(),
            array( $finding->get_category() ),
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
