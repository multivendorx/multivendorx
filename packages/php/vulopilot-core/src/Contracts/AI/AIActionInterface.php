<?php
/**
 * AIActionInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\AI;

use VuloPilotCore\Exceptions\InvalidActionInputException;
use VuloPilotCore\Exceptions\InvalidActionOutputException;
use VuloPilotCore\ValueObjects\ActionExecutionResult;
use VuloPilotCore\ValueObjects\ActionPreview;
use VuloPilotCore\ValueObjects\AIResponse;

/**
 * An AI action is a user-typed-input AI workflow with an approval-gated
 * propose()/approve()/reject()/rollback() lifecycle (AI-ACTIONS.md) —
 * distinct from RuleInterface, which is Recommendation-only and doesn't
 * cover a workflow like "Generate Blog" that has no triggering Finding at
 * all. Implemented by AIActions\Actions\AbstractBasicAction (free) and any
 * premium action Pro registers via `vulopilot_ai_action_sources`.
 *
 * @class       AIActionInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface AIActionInterface {

    /**
     * @return string Unique, stable action id.
     */
    public function get_id(): string;

    /**
     * @return string Human-readable label.
     */
    public function get_label(): string;

    /**
     * @return string 'free' or 'pro'.
     */
    public function get_tier(): string;

    /**
     * Validates and normalizes the raw user-supplied input.
     *
     * @param array $input Raw input.
     * @return array Validated/normalized input.
     * @throws InvalidActionInputException When input is invalid.
     */
    public function validate_input( array $input ): array;

    /**
     * Builds the chat-style message list to send to the AI provider.
     *
     * @param array $input Validated input.
     * @return array<int, array{role: string, content: string}>
     */
    public function build_prompt( array $input ): array;

    /**
     * Parses the raw provider response into this action's output shape.
     *
     * @param AIResponse $response Raw provider response.
     * @return array Parsed output.
     */
    public function parse_response( AIResponse $response ): array;

    /**
     * Validates the parsed output before it's shown to the user as a preview.
     *
     * @param array $output Parsed output.
     * @param array $input  Validated input.
     * @return void
     * @throws InvalidActionOutputException When output is invalid.
     */
    public function validate_output( array $output, array $input ): void;

    /**
     * Builds the human-facing preview shown before approval.
     *
     * @param array $output Validated output.
     * @param array $input  Validated input.
     * @return ActionPreview
     */
    public function build_preview( array $output, array $input ): ActionPreview;

    /**
     * Applies the output as a real WordPress mutation.
     *
     * @param array $output Validated output.
     * @param array $input  Validated input.
     * @return ActionExecutionResult
     */
    public function execute( array $output, array $input ): ActionExecutionResult;

    /**
     * Reverses a previously executed action using its stored snapshot.
     *
     * @param array $snapshot Snapshot captured by execute()'s ActionExecutionResult.
     * @return void
     */
    public function rollback( array $snapshot ): void;
}
