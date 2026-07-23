<?php
/**
 * MissingFeaturedImageRule class file.
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
 * Turns Scanners\Basic\SeoImagesScanner's "no featured image" Finding
 * into a recommendation. Deliberately fixable() = true but
 * requires_ai() = false — unlike MissingAltTextRule/SeoTitleRewriteRule/
 * MissingMetaDescriptionRule, there's nothing for AI to generate here:
 * "pick a featured image" is a mechanical editorial task (open the post,
 * choose or upload an image), the same shape DormantPluginRule's
 * fixable-but-manual recommendation already established.
 *
 * @class       MissingFeaturedImageRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MissingFeaturedImageRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'missing-featured-image';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Missing featured image', 'vulopilot' );
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
        return 15;
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
        return array( 'seo', 'social-sharing' );
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
    public function get_estimated_impact(): string {
        return Impact::LOW;
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
        // Matched on the `missing_featured_image` meta key SeoImagesScanner
        // attaches — category alone ('seo') is shared by 14 different
        // scanners now (SEO-MODULE.md), so it can't distinguish this
        // finding from any other SEO finding on its own.
        return 'seo' === $finding->get_category() && array_key_exists( 'missing_featured_image', $finding->get_meta() );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Set a featured image', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title. */
                __( 'A featured image improves how this page previews when shared or displayed in some search formats: %s', 'vulopilot' ),
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
