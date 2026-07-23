<?php
/**
 * CoreUpdateAvailableRule class file.
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
 * Turns Scanners\Basic\UpdatesScanner's WordPress-core-update Finding
 * (object_type 'core') into a recommendation to update now. Marked
 * fixable — a future automation action can trigger core's own update
 * routine directly — and doesn't require AI, since applying a WordPress
 * update is a deterministic operation with no content to generate.
 *
 * @class       CoreUpdateAvailableRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CoreUpdateAvailableRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'core-update-available';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'WordPress core update available', 'vulopilot' );
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
        return 90;
    }

    /**
     * @inheritDoc
     */
    public function get_categories(): array {
        return array( 'updates' );
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
        return 'updates' === $finding->get_category() && 'core' === $finding->get_object_type();
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Update WordPress core now', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title, e.g. "WordPress core update available (6.9)". */
                __( 'Running an outdated core version increases security risk: %s', 'vulopilot' ),
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
