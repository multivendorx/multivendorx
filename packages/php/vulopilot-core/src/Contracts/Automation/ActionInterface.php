<?php
/**
 * ActionInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\Automation;

use VuloPilotCore\ValueObjects\AutomationRunResult;
use VuloPilotCore\ValueObjects\Recommendation;

/**
 * An Automation Engine action — deliberately simpler than
 * Contracts\AI\AIActionInterface's propose/approve/reject/rollback
 * lifecycle: these run synchronously when an automation's trigger fires
 * and its bound rule matches, with no separate human-approval step of
 * their own. An automation that *does* need human approval before making
 * a real change achieves it by using AutomationEngine\Actions\RunAiActionAction
 * to delegate into the AI Action system's own, already-built approval
 * flow, rather than this interface growing a second one.
 *
 * @class       ActionInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface ActionInterface {

    /**
     * @return string Unique, stable action id.
     */
    public function get_id(): string;

    /**
     * @return string Human-readable label.
     */
    public function get_label(): string;

    /**
     * @param Recommendation       $recommendation The recommendation that matched and triggered this run.
     * @param array<string, mixed> $config         This action's own config, from the automation's `actions` JSON.
     * @return AutomationRunResult
     */
    public function execute( Recommendation $recommendation, array $config ): AutomationRunResult;
}
