<?php
/**
 * SeoTitleRewriteRule class file.
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
 * Turns Scanners\Basic\SeoScanner's title-length Finding into a
 * recommendation to rewrite the title. Like MissingAltTextRule, this
 * needs AI: a good title has to actually summarize the page's content
 * within a length constraint, which isn't something a fixed template can
 * produce well.
 *
 * @class       SeoTitleRewriteRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SeoTitleRewriteRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'seo-title-rewrite';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Improve page title for search results', 'vulopilot' );
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
        return array( 'seo' );
    }

    /**
     * @inheritDoc
     */
    public function get_tags(): array {
        return array( 'seo', 'quick-win' );
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
    public function applies_to( Finding $finding ): bool {
        // SEO-MODULE.md added 13 more scanners sharing the 'seo' category
        // alongside the original SeoScanner this rule was written for —
        // category alone is no longer specific enough to mean "a title
        // length problem." SeoScanner is the only scanner that attaches a
        // `title_length` meta key, so checking for it is what keeps this
        // rule from firing on, say, a thin-content or duplicate-title
        // finding that also happens to be category 'seo'.
        return 'seo' === $finding->get_category() && array_key_exists( 'title_length', $finding->get_meta() );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Ask AI to rewrite this title', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'A search-optimized title improves click-through from search results: %s', 'vulopilot' ),
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
