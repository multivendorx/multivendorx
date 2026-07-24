<?php
/**
 * Recommendation file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * What RuleEngine\RuleEngine turns a Finding into, via a matching
 * RuleInterface::get_recommendation(). Fired in bulk as
 * `do_action('vulopilot_recommendations_generated', $recommendations, $findings)`.
 *
 * @class       Recommendation class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class Recommendation {

    /**
     * @var string
     */
    private string $rule_id;

    /**
     * @var string
     */
    private string $title;

    /**
     * @var string
     */
    private string $description;

    /**
     * @var string One of RuleType's constants.
     */
    private string $type;

    /**
     * @var int
     */
    private int $priority;

    /**
     * @var string[]
     */
    private array $categories;

    /**
     * @var string[]
     */
    private array $tags;

    /**
     * @var bool
     */
    private bool $is_fixable;

    /**
     * @var bool
     */
    private bool $requires_ai;

    /**
     * @var string One of Impact's constants.
     */
    private string $estimated_impact;

    /**
     * @var int
     */
    private int $estimated_time_minutes;

    /**
     * @var string|null
     */
    private ?string $object_type;

    /**
     * @var string|null
     */
    private ?string $object_ref;

    /**
     * @param string      $rule_id                 Rule that produced this recommendation.
     * @param string      $title                   Human-readable summary.
     * @param string      $description             Longer explanation.
     * @param string      $type                    One of RuleType's constants.
     * @param int         $priority                Higher sorts first.
     * @param string[]    $categories              Categories this recommendation belongs to.
     * @param string[]    $tags                    Freeform tags.
     * @param bool        $is_fixable              Whether an AIAction can automatically resolve this.
     * @param bool        $requires_ai             Whether resolving this requires an AI call.
     * @param string      $estimated_impact        One of Impact's constants.
     * @param int         $estimated_time_minutes  Estimated time to resolve.
     * @param string|null $object_type             From the triggering Finding, if any.
     * @param string|null $object_ref              From the triggering Finding, if any.
     */
    public function __construct(
        string $rule_id,
        string $title,
        string $description,
        string $type,
        int $priority,
        array $categories,
        array $tags,
        bool $is_fixable,
        bool $requires_ai,
        string $estimated_impact,
        int $estimated_time_minutes,
        ?string $object_type,
        ?string $object_ref
    ) {
        $this->rule_id                = $rule_id;
        $this->title                  = $title;
        $this->description            = $description;
        $this->type                   = $type;
        $this->priority               = $priority;
        $this->categories             = $categories;
        $this->tags                   = $tags;
        $this->is_fixable             = $is_fixable;
        $this->requires_ai            = $requires_ai;
        $this->estimated_impact       = $estimated_impact;
        $this->estimated_time_minutes = $estimated_time_minutes;
        $this->object_type            = $object_type;
        $this->object_ref             = $object_ref;
    }

    /**
     * @return string
     */
    public function get_rule_id(): string {
        return $this->rule_id;
    }

    /**
     * @return string
     */
    public function get_title(): string {
        return $this->title;
    }

    /**
     * @return string
     */
    public function get_description(): string {
        return $this->description;
    }

    /**
     * @return string
     */
    public function get_type(): string {
        return $this->type;
    }

    /**
     * @return int
     */
    public function get_priority(): int {
        return $this->priority;
    }

    /**
     * @return string[]
     */
    public function get_categories(): array {
        return $this->categories;
    }

    /**
     * @return string[]
     */
    public function get_tags(): array {
        return $this->tags;
    }

    /**
     * @return bool
     */
    public function is_fixable(): bool {
        return $this->is_fixable;
    }

    /**
     * @return bool
     */
    public function requires_ai(): bool {
        return $this->requires_ai;
    }

    /**
     * @return string
     */
    public function get_estimated_impact(): string {
        return $this->estimated_impact;
    }

    /**
     * @return int
     */
    public function get_estimated_time_minutes(): int {
        return $this->estimated_time_minutes;
    }

    /**
     * @return string|null
     */
    public function get_object_type(): ?string {
        return $this->object_type;
    }

    /**
     * @return string|null
     */
    public function get_object_ref(): ?string {
        return $this->object_ref;
    }

    /**
     * @return array<string, mixed>
     */
    public function to_array(): array {
        return array(
            'rule_id'                 => $this->rule_id,
            'title'                   => $this->title,
            'description'             => $this->description,
            'type'                    => $this->type,
            'priority'                => $this->priority,
            'categories'              => $this->categories,
            'tags'                    => $this->tags,
            'is_fixable'              => $this->is_fixable,
            'requires_ai'             => $this->requires_ai,
            'estimated_impact'        => $this->estimated_impact,
            'estimated_time_minutes'  => $this->estimated_time_minutes,
            'object_type'             => $this->object_type,
            'object_ref'              => $this->object_ref,
        );
    }
}
