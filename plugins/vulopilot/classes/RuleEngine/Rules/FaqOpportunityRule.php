<?php
/**
 * FaqOpportunityRule class file.
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
 * Turns Scanners\Basic\GeoFaqOpportunityScanner's "no FAQ-style
 * questions" Finding into a recommendation to draft one with AI — good
 * FAQ questions have to actually anticipate what a reader would ask
 * about this specific content, which needs the content itself, the same
 * reasoning SeoTitleRewriteRule/MissingMetaDescriptionRule already
 * establish for AI-required rules. Pairs with
 * AIActions\Actions\GenerateFaqAction (GEO-MODULE.md).
 *
 * @class       FaqOpportunityRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class FaqOpportunityRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'faq-opportunity';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Add an FAQ section', 'vulopilot' );
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
        // Matched on the `faq_opportunity` meta key GeoFaqOpportunityScanner
        // attaches specifically for this — category 'geo' alone is shared
        // by 9 scanners now (GEO-MODULE.md), and `word_count` alone would
        // also match GeoSummaryBlockScanner/ThinContentScanner findings,
        // so a scanner-specific key (not the Finding's already-translated
        // title text) is what disambiguates, same discipline
        // MissingMetaDescriptionRule/MissingFeaturedImageRule established.
        return 'geo' === $finding->get_category() && array_key_exists( 'faq_opportunity', $finding->get_meta() );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Ask AI to draft an FAQ section', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'Question-phrased headings are more likely to be lifted directly into an AI answer engine\'s response: %s', 'vulopilot' ),
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
