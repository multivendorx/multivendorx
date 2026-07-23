<?php
/**
 * DormantPluginRule class file.
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
 * Turns Scanners\Basic\PluginsScanner's "inactive plugin installed"
 * Finding into a recommendation to remove or reactivate it. A warning
 * rather than an error or critical — a dormant plugin is a smaller,
 * lower-urgency risk than an active vulnerability or a broken checkout —
 * and low-impact/quick to resolve, since deleting an unused plugin from
 * Plugins > Installed Plugins takes moments.
 *
 * @class       DormantPluginRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class DormantPluginRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'dormant-plugin';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Remove or reactivate inactive plugin', 'vulopilot' );
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
        return 20;
    }

    /**
     * @inheritDoc
     */
    public function get_categories(): array {
        return array( 'plugins' );
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
        return 'plugins' === $finding->get_category() && 'plugin' === $finding->get_object_type();
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Clean up an unused plugin', 'vulopilot' ),
            sprintf(
                /* translators: %s is the finding's own title, e.g. "Inactive plugin installed: Hello Dolly". */
                __( 'Inactive plugins still carry known vulnerabilities and disk footprint: %s', 'vulopilot' ),
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
