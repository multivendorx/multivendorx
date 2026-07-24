<?php
/**
 * RunAiActionAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Actions;

use VuloPilotCore\Contracts\Automation\ActionInterface;
use VuloPilotCore\ValueObjects\AutomationRunResult;
use VuloPilotCore\ValueObjects\Recommendation;

defined( 'ABSPATH' ) || exit;

/**
 * Bridges the Automation Engine into the AI Action system rather than
 * duplicating its approval-gated lifecycle
 * (AIActions\ActionRunner::propose()/approve()/reject()/rollback(), see
 * that class's own docblock). Calling propose() here only ever creates a
 * `pending_approval` row and stops — it never auto-approves — so an
 * automation configured with this action still requires the same human
 * approval any other AI action does; "Approvals" (ARCHITECTURE.md's
 * Prompt 12) is satisfied by delegating to infrastructure that already
 * exists rather than a second approval mechanism.
 *
 * `$config['ai_action_id']` selects which registered AIActionInterface to
 * propose (e.g. 'generate-alt', 'write-product-short-description'). The
 * input built from the recommendation is deliberately minimal (just
 * whichever id field that action's own validate_input() expects) —
 * everything else about *how* to fix it is that action's own job.
 *
 * @class       RunAiActionAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RunAiActionAction implements ActionInterface {

    /**
     * Maps a Recommendation's object_type to the input key most
     * AIActionInterface::validate_input() implementations expect.
     *
     * @var array<string, string>
     */
    private const OBJECT_TYPE_INPUT_KEYS = array(
        'attachment' => 'attachment_id',
        'post'       => 'post_id',
        'page'       => 'post_id',
        'product'    => 'post_id',
    );

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'run-ai-action';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Propose an AI fix (requires approval)', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function execute( Recommendation $recommendation, array $config ): AutomationRunResult {
        $ai_action_id = sanitize_key( (string) ( $config['ai_action_id'] ?? '' ) );

        if ( '' === $ai_action_id ) {
            return new AutomationRunResult( false, $this->get_id(), __( 'This automation action is missing its ai_action_id config.', 'vulopilot' ) );
        }

        $object_type = $recommendation->get_object_type();
        $object_ref  = $recommendation->get_object_ref();
        $input_key   = self::OBJECT_TYPE_INPUT_KEYS[ $object_type ] ?? null;

        if ( ! $input_key || ! $object_ref ) {
            return new AutomationRunResult(
                false,
                $this->get_id(),
                __( 'This recommendation\'s object type has no known AI action input mapping.', 'vulopilot' )
            );
        }

        try {
            $proposed = VuloPilot()->ai_action_runner->propose( $ai_action_id, array( $input_key => $object_ref ) );
        } catch ( \Throwable $exception ) {
            return new AutomationRunResult( false, $this->get_id(), $exception->getMessage() );
        }

        return new AutomationRunResult(
            true,
            $this->get_id(),
            sprintf(
                /* translators: %d is the pending AI action run's own id. */
                __( 'Proposed AI fix #%d — awaiting approval.', 'vulopilot' ),
                $proposed['run_id']
            )
        );
    }
}
