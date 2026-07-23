<?php
/**
 * AbstractBasicRule class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RuleEngine\Rules;

use VuloPilotCore\Contracts\RuleEngine\RuleInterface;
use VuloPilotCore\ValueObjects\Impact;

defined( 'ABSPATH' ) || exit;

/**
 * Base class for every free-tier rule under RuleEngine/Rules/.
 *
 * get_tier() is shared for the same reason Scanners\Basic\AbstractBasicScanner
 * hard-codes it: every rule in this namespace is free-tier by definition.
 * get_tags()/is_fixable()/requires_ai()/get_estimated_impact()/
 * get_estimated_time_minutes() get sensible defaults (no tags, not
 * fixable, no AI required, medium impact, 5 minutes) — most rules only
 * need to override a couple of these, not restate all six every time. The
 * methods that meaningfully differ per rule (id/label/type/priority/
 * categories/applies_to/get_recommendation) stay abstract.
 *
 * @class       AbstractBasicRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractBasicRule implements RuleInterface {

    /**
     * @inheritDoc
     */
    public function get_tier(): string {
        return 'free';
    }

    /**
     * @inheritDoc
     */
    public function get_tags(): array {
        return array();
    }

    /**
     * @inheritDoc
     */
    public function is_fixable(): bool {
        return false;
    }

    /**
     * @inheritDoc
     */
    public function requires_ai(): bool {
        return false;
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
        return 5;
    }

    /**
     * @inheritDoc
     */
    abstract public function get_id(): string;

    /**
     * @inheritDoc
     */
    abstract public function get_label(): string;

    /**
     * @inheritDoc
     */
    abstract public function get_type(): string;

    /**
     * @inheritDoc
     */
    abstract public function get_priority(): int;

    /**
     * @inheritDoc
     */
    abstract public function get_categories(): array;

    /**
     * @inheritDoc
     */
    abstract public function applies_to( \VuloPilotCore\ValueObjects\Finding $finding ): bool;

    /**
     * @inheritDoc
     */
    abstract public function get_recommendation( \VuloPilotCore\ValueObjects\Finding $finding ): \VuloPilotCore\ValueObjects\Recommendation;
}
