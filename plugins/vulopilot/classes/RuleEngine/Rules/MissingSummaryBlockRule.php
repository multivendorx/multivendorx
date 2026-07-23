<?php
/**
 * MissingSummaryBlockRule class file.
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
 * Turns Scanners\Basic\GeoSummaryBlockScanner's "no upfront summary"
 * Finding into a recommendation to draft one with AI — a good summary
 * has to actually distill this specific content's key points, which
 * needs the content itself. Pairs with
 * AIActions\Actions\GenerateSummaryBlockAction (GEO-MODULE.md).
 *
 * @class       MissingSummaryBlockRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MissingSummaryBlockRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'missing-summary-block';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Add a summary block', 'vulopilot' );
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
        return 30;
    }

    /**
     * @inheritDoc
     */
    public function get_categories(): array {
        return array( 'geo' );
    }

    /**
     * @inheritDoc
     */
    public function get_tags(): array {
        return array( 'geo', 'ai-search' );
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
        return 3;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        // Matched on the `missing_summary_block` meta key
        // GeoSummaryBlockScanner attaches specifically for this — see
        // FaqOpportunityRule's docblock for why category/word_count alone
        // aren't specific enough among 9 scanners sharing category 'geo'.
        return 'geo' === $finding->get_category() && array_key_exists( 'missing_summary_block', $finding->get_meta() );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Ask AI to write a summary block', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'A short upfront summary makes this content easier for AI answer engines to extract a direct answer from: %s', 'vulopilot' ),
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
