<?php
/**
 * Finding file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * A single issue surfaced by a Scanner. Immutable — every field is set at
 * construction time by the scanner that produced it.
 *
 * @class       Finding class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class Finding {

    /**
     * @var string
     */
    private string $title;

    /**
     * @var string One of Severity's constants.
     */
    private string $severity;

    /**
     * @var string
     */
    private string $category;

    /**
     * @var string
     */
    private string $description;

    /**
     * @var string|null e.g. 'post', 'attachment', 'user', 'url', 'plugin', 'table', 'core'.
     */
    private ?string $object_type;

    /**
     * @var string|null e.g. a post id, a URL, a table name.
     */
    private ?string $object_ref;

    /**
     * @var array<string, mixed>
     */
    private array $meta;

    /**
     * @param string      $title       Human-readable summary.
     * @param string      $severity    One of Severity's constants.
     * @param string      $category    Category this finding belongs to.
     * @param string      $description Longer explanation.
     * @param string|null $object_type What kind of thing this finding is about, if any.
     * @param string|null $object_ref  Reference to the specific object, if any.
     * @param array       $meta        Arbitrary scanner-specific extra data.
     */
    public function __construct(
        string $title,
        string $severity,
        string $category,
        string $description,
        ?string $object_type = null,
        ?string $object_ref = null,
        array $meta = array()
    ) {
        $this->title       = $title;
        $this->severity    = $severity;
        $this->category    = $category;
        $this->description = $description;
        $this->object_type = $object_type;
        $this->object_ref  = $object_ref;
        $this->meta        = $meta;
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
    public function get_severity(): string {
        return $this->severity;
    }

    /**
     * @return string
     */
    public function get_category(): string {
        return $this->category;
    }

    /**
     * @return string|null
     */
    public function get_description(): ?string {
        return $this->description;
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
    public function get_meta(): array {
        return $this->meta;
    }
}
