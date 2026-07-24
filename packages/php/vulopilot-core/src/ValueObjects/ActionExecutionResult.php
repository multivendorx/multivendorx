<?php
/**
 * ActionExecutionResult file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * The outcome of an AIActionInterface::execute() call. Carries the
 * rollback snapshot ActionRunner::rollback() later replays through
 * AIActionInterface::rollback().
 *
 * @class       ActionExecutionResult class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class ActionExecutionResult {

    /**
     * @var bool
     */
    private bool $success;

    /**
     * @var string|null e.g. 'post', 'attachment'.
     */
    private ?string $object_type;

    /**
     * @var string|null
     */
    private ?string $object_ref;

    /**
     * @var array<string, mixed>
     */
    private array $snapshot;

    /**
     * @var string|null Error message on failure.
     */
    private ?string $message;

    /**
     * @param bool        $success     Whether execution succeeded.
     * @param string|null $object_type What kind of thing was mutated, if any.
     * @param string|null $object_ref  Reference to the specific object mutated, if any.
     * @param array       $snapshot    Data needed to roll this execution back.
     * @param string|null $message     Error message on failure.
     */
    public function __construct(
        bool $success,
        ?string $object_type,
        ?string $object_ref,
        array $snapshot = array(),
        ?string $message = null
    ) {
        $this->success     = $success;
        $this->object_type = $object_type;
        $this->object_ref  = $object_ref;
        $this->snapshot    = $snapshot;
        $this->message     = $message;
    }

    /**
     * @return bool
     */
    public function is_success(): bool {
        return $this->success;
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
    public function get_snapshot(): array {
        return $this->snapshot;
    }

    /**
     * @return string|null
     */
    public function get_message(): ?string {
        return $this->message;
    }

    /**
     * @return array<string, mixed>
     */
    public function to_array(): array {
        return array(
            'success'     => $this->success,
            'object_type' => $this->object_type,
            'object_ref'  => $this->object_ref,
            'snapshot'    => $this->snapshot,
            'message'     => $this->message,
        );
    }
}
