<?php
/**
 * ActionPreview file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * The human-facing preview an AIActionInterface::build_preview() returns,
 * shown to the user before they approve an ActionRunner::propose() call.
 *
 * @class       ActionPreview class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class ActionPreview {

    /**
     * @var string
     */
    private string $title;

    /**
     * @var string|null Null when there's nothing to diff against (new content).
     */
    private ?string $before;

    /**
     * @var string
     */
    private string $after;

    /**
     * @var string One of 'text', 'html', 'json'.
     */
    private string $format;

    /**
     * @param string      $title  Short summary of what will change.
     * @param string|null $before Previous value, or null for new content.
     * @param string      $after  New/generated value.
     * @param string      $format One of 'text', 'html', 'json'.
     */
    public function __construct( string $title, ?string $before, string $after, string $format ) {
        $this->title  = $title;
        $this->before = $before;
        $this->after  = $after;
        $this->format = $format;
    }

    /**
     * @return string
     */
    public function get_title(): string {
        return $this->title;
    }

    /**
     * @return string|null
     */
    public function get_before(): ?string {
        return $this->before;
    }

    /**
     * @return string
     */
    public function get_after(): string {
        return $this->after;
    }

    /**
     * @return string
     */
    public function get_format(): string {
        return $this->format;
    }

    /**
     * @return string This preview's title, shown in activity-log messages.
     */
    public function get_summary(): string {
        return $this->title;
    }

    /**
     * @return array<string, mixed>
     */
    public function to_array(): array {
        return array(
            'title'  => $this->title,
            'before' => $this->before,
            'after'  => $this->after,
            'format' => $this->format,
        );
    }
}
