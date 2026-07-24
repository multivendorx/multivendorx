<?php
/**
 * AutomationRunResult file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * The outcome of a single Contracts\Automation\ActionInterface::execute()
 * call — AutomationEngine\AutomationEngine aggregates one or more of these
 * (an automation can run several actions in sequence) into the
 * `vulopilot_automation_runs` row's `actions_executed`/`actions_failed`
 * counts and `result_log`.
 *
 * @class       AutomationRunResult class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class AutomationRunResult {

    /**
     * @var bool
     */
    private bool $success;

    /**
     * @var string
     */
    private string $action_id;

    /**
     * @var string
     */
    private string $message;

    /**
     * @param bool   $success   Whether the action succeeded.
     * @param string $action_id The action's own get_id().
     * @param string $message   Human-readable outcome, success or failure.
     */
    public function __construct( bool $success, string $action_id, string $message ) {
        $this->success   = $success;
        $this->action_id = $action_id;
        $this->message   = $message;
    }

    /**
     * @return bool
     */
    public function is_success(): bool {
        return $this->success;
    }

    /**
     * @return string
     */
    public function get_action_id(): string {
        return $this->action_id;
    }

    /**
     * @return string
     */
    public function get_message(): string {
        return $this->message;
    }

    /**
     * @return array<string, mixed>
     */
    public function to_array(): array {
        return array(
            'success'   => $this->success,
            'action_id' => $this->action_id,
            'message'   => $this->message,
        );
    }
}
