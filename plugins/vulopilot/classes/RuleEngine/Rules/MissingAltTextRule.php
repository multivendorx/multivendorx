<?php
/**
 * MissingAltTextRule class file.
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
 * The flagship example from RULE-ENGINE.md: turns
 * Scanners\Basic\ImagesScanner's "image missing alt text" Finding into a
 * concrete "generate an ALT text suggestion" recommendation. Writing good
 * alt text requires actually understanding what the image shows, which is
 * why this is the one rule where requires_ai() is true and is_fixable()
 * is also true — an AI provider call generates the suggestion, an
 * automation action (once built) could apply it.
 *
 * @class       MissingAltTextRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MissingAltTextRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'missing-alt-text';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Missing image alt text', 'vulopilot' );
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
        return array( 'images' );
    }

    /**
     * @inheritDoc
     */
    public function get_tags(): array {
        return array( 'accessibility', 'seo', 'quick-win' );
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
        return 'images' === $finding->get_category() && 'attachment' === $finding->get_object_type();
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Generate an ALT text suggestion', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title, e.g. "Image missing alt text: photo.jpg". */
                __( 'AI can draft alt text for this image based on what it shows: %s', 'vulopilot' ),
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
