<?php
/**
 * ActionRunner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIActions;

use VuloPilotCore\ValueObjects\Severity;
use VuloPilot\AIProviders\Support\SafeRequestSender;
use VuloPilot\Repositories\ActionRunRepository;
use VuloPilot\Repositories\ActivityLogRepository;

defined( 'ABSPATH' ) || exit;

/**
 * Orchestrates every AIAction through its full lifecycle — the same
 * orchestrator role Scanners\ScanRunner and RuleEngine\RuleEngine play
 * for their own engines, but split across four public methods instead of
 * one `run()`, because "Approval" (AI-ACTIONS.md's 5th lifecycle stage)
 * is a genuine pause: propose() and approve()/reject() are always two
 * separate HTTP requests, potentially made by two different people, with
 * a persisted `vulopilot_ai_action_runs` row bridging them.
 *
 * ```
 * propose()  Input → Prompt Builder → (AI call) → Validator → Preview   [persists: pending_approval]
 * approve()  Execution                                                  [persists: executed | failed]
 * reject()   (no-op besides recording the decision)                     [persists: rejected]
 * rollback() Rollback                                                   [persists: rolled_back]
 * ```
 *
 * Logging (stage 8) isn't a method on AIActionInterface — every
 * transition above writes to the existing ActivityLogRepository here,
 * once, rather than each action re-implementing its own audit trail.
 *
 * @class       ActionRunner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ActionRunner {

    private ActionRegistry $registry;
    private SafeRequestSender $request_sender;
    private ActionRunRepository $runs;
    private ActivityLogRepository $activity_logs;

    /**
     * @param ActionRegistry             $registry           Registry to resolve action ids from.
     * @param SafeRequestSender          $request_sender      Sends a prompt through the safety-validate → provider chain → sanitize sequence.
     * @param ActionRunRepository|null   $runs           Defaults to a new instance (injectable for tests).
     * @param ActivityLogRepository|null $activity_logs Defaults to a new instance (injectable for tests).
     */
    public function __construct(
        ActionRegistry $registry,
        SafeRequestSender $request_sender,
        ?ActionRunRepository $runs = null,
        ?ActivityLogRepository $activity_logs = null
    ) {
        $this->registry       = $registry;
        $this->request_sender = $request_sender;
        $this->runs           = $runs ?? new ActionRunRepository();
        $this->activity_logs  = $activity_logs ?? new ActivityLogRepository();
    }

    /**
     * Stages 1-4: validates input, builds and safety-checks the prompt,
     * sends it through the configured provider chain, validates and
     * previews the result. Persists the outcome as a `pending_approval`
     * row — nothing about the site's actual content changes yet.
     *
     * @param string               $action_id  e.g. 'generate-alt'.
     * @param array<string, mixed> $raw_input Raw input (REST params, or built from a Recommendation).
     * @return array{run_id: int, preview: array<string, mixed>}
     *
     * @throws \InvalidArgumentException If $action_id isn't registered.
     * @throws \RuntimeException         If no AI provider is configured.
     */
    public function propose( string $action_id, array $raw_input ): array {
        $action = $this->get_action_or_fail( $action_id );

        $input    = $action->validate_input( $raw_input );
        $messages = $action->build_prompt( $input );
        $response = $this->request_sender->send( $messages );

        $output = $action->parse_response( $response );
        $action->validate_output( $output, $input );

        $preview = $action->build_preview( $output, $input );

        $run_id = $this->runs->insert(
            array(
                'action_id'    => $action_id,
                'status'       => 'pending_approval',
                'input'        => wp_json_encode( $input ),
                'output'       => wp_json_encode( $output ),
                'preview'      => wp_json_encode( $preview->to_array() ),
                'requested_by' => get_current_user_id(),
            )
        );

        $this->log( $run_id, 'ai_action.proposed', Severity::INFO, sprintf( '%s proposed: %s', $action->get_label(), $preview->get_summary() ) );

        return array(
            'run_id'  => $run_id,
            'preview' => $preview->to_array(),
        );
    }

    /**
     * Stage 6: applies a previously proposed, still-pending action.
     *
     * @param int $run_id A propose()-returned run_id.
     * @return array<string, mixed> ActionExecutionResult::to_array().
     *
     * @throws \RuntimeException If $run_id doesn't exist or isn't pending approval.
     */
    public function approve( int $run_id ): array {
        $run = $this->get_pending_run_or_fail( $run_id );

        $action = $this->get_action_or_fail( $run['action_id'] );
        $input  = json_decode( (string) $run['input'], true ) ?? array();
        $output = json_decode( (string) $run['output'], true ) ?? array();

        $result = $action->execute( $output, $input );

        $this->runs->update(
            $run_id,
            array(
                'status'        => $result->is_success() ? 'executed' : 'failed',
                'object_type'   => $result->get_object_type(),
                'object_ref'    => $result->get_object_ref(),
                'snapshot'      => wp_json_encode( $result->get_snapshot() ),
                'error_message' => $result->get_message(),
                'approved_by'   => get_current_user_id(),
                'approved_at'   => current_time( 'mysql', true ),
                'executed_at'   => $result->is_success() ? current_time( 'mysql', true ) : null,
            )
        );

        $this->log(
            $run_id,
            $result->is_success() ? 'ai_action.executed' : 'ai_action.failed',
            $result->is_success() ? Severity::INFO : Severity::HIGH,
            $result->is_success()
                ? sprintf( '%s executed.', $action->get_label() )
                : sprintf( '%s failed: %s', $action->get_label(), $result->get_message() )
        );

        return $result->to_array();
    }

    /**
     * Stage 5's negative outcome — declines a pending action without
     * ever calling execute().
     *
     * @param int $run_id A propose()-returned run_id.
     * @return void
     *
     * @throws \RuntimeException If $run_id doesn't exist or isn't pending approval.
     */
    public function reject( int $run_id ): void {
        $run = $this->get_pending_run_or_fail( $run_id );

        $this->runs->update( $run_id, array( 'status' => 'rejected' ) );

        $this->log( $run_id, 'ai_action.rejected', Severity::INFO, sprintf( 'Action run #%d rejected.', $run_id ) );
    }

    /**
     * Stage 7: reverts a previously executed action.
     *
     * @param int $run_id A propose()-returned, subsequently approve()'d run_id.
     * @return void
     *
     * @throws \RuntimeException If $run_id doesn't exist or wasn't successfully executed.
     */
    public function rollback( int $run_id ): void {
        $run = $this->runs->find( $run_id );

        if ( ! $run || 'executed' !== $run['status'] ) {
            throw new \RuntimeException( __( 'This action run cannot be rolled back.', 'vulopilot' ) );
        }

        $action = $this->get_action_or_fail( $run['action_id'] );

        $action->rollback( json_decode( (string) $run['snapshot'], true ) ?? array() );

        $this->runs->update(
            $run_id,
            array(
                'status'         => 'rolled_back',
                'rolled_back_at' => current_time( 'mysql', true ),
            )
        );

        $this->log( $run_id, 'ai_action.rolled_back', Severity::MEDIUM, sprintf( '%s rolled back.', $action->get_label() ) );
    }

    /**
     * @param string $action_id Action id to resolve.
     * @return \VuloPilotCore\Contracts\AI\AIActionInterface
     *
     * @throws \InvalidArgumentException If unregistered.
     */
    private function get_action_or_fail( string $action_id ) {
        $action = $this->registry->get_action( $action_id );

        if ( ! $action ) {
            throw new \InvalidArgumentException( sprintf( 'No AI action registered for "%s".', $action_id ) );
        }

        return $action;
    }

    /**
     * @param int $run_id Run id to fetch.
     * @return array<string, mixed>
     *
     * @throws \RuntimeException If missing or not pending approval.
     */
    private function get_pending_run_or_fail( int $run_id ): array {
        $run = $this->runs->find( $run_id );

        if ( ! $run || 'pending_approval' !== $run['status'] ) {
            throw new \RuntimeException( __( 'This action run is not awaiting approval.', 'vulopilot' ) );
        }

        return $run;
    }

    /**
     * @param int    $run_id   Run id this event is about.
     * @param string $event_type e.g. 'ai_action.executed'.
     * @param string $severity One of Severity's constants.
     * @param string $message  Human-readable description.
     * @return void
     */
    private function log( int $run_id, string $event_type, string $severity, string $message ): void {
        $this->activity_logs->log( $event_type, $message, $severity, 'user', 'ai_action_run', (string) $run_id );
    }
}
