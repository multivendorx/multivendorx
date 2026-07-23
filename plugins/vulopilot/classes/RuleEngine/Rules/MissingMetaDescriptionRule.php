<?php
/**
 * MissingMetaDescriptionRule class file.
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
 * Turns Scanners\Basic\MetaDescriptionScanner's "no excerpt set" Finding
 * into a recommendation to draft one with AI — same reasoning as
 * SeoTitleRewriteRule: a good description has to actually summarize the
 * page's content, which needs the content itself, not a fixed template.
 * Pairs with AIActions\Actions\Seo\WriteMetaDescriptionAction
 * (SEO-MODULE.md) by the same by-convention id match AI-ACTIONS.md
 * documents for MissingAltTextRule ↔ GenerateAltAction.
 *
 * @class       MissingMetaDescriptionRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MissingMetaDescriptionRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'missing-meta-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Missing meta description', 'vulopilot' );
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
        return 35;
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
    public function get_estimated_time_minutes(): int {
        return 2;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        // Matched on the `missing_description` meta key MetaDescriptionScanner
        // attaches — not the Finding's title text, which is already
        // translated by the time a rule sees it and so isn't a reliable
        // matcher under any locale but English (the same reason
        // SeoTitleRewriteRule matches on a meta key, not title text).
        return 'seo' === $finding->get_category() && array_key_exists( 'missing_description', $finding->get_meta() );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Ask AI to write a meta description', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'A good description improves click-through from search results: %s', 'vulopilot' ),
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
