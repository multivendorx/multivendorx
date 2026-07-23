<?php
/**
 * AiActionRuns controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\ActionRunRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /ai-action-runs — read-only list of vulopilot_ai_action_runs rows
 * (AI-ACTIONS.md), backing the Dashboard's "Pending Approval" widget
 * today. Only get_items() exists here: propose/approve/reject/rollback
 * are AIActions\ActionRunner's job and each has side effects (an AI call,
 * a site mutation) that AI-ACTIONS.md's "What's not here yet" section
 * deliberately leaves as a separate, not-yet-built REST surface — a
 * plain list endpoint for an existing widget doesn't require building
 * that surface first, the same way Reports/AiHistory's read-only
 * get_items() didn't need their own write endpoints to exist yet either.
 *
 * @class       AiActionRuns controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AiActionRuns extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'ai-action-runs';

    /**
     * @inheritDoc
     */
    public function register_routes() {
        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function get_items( $request ) {
        $repository = new ActionRunRepository();

        $status = sanitize_key( (string) $request->get_param( 'status' ) );

        return rest_ensure_response(
            $repository->find_all(
                array(
                    'page'      => absint( $request->get_param( 'page' ) ) ?: 1,
                    'per_page'  => absint( $request->get_param( 'per_page' ) ) ?: 20,
                    'status'    => $status,
                    'action_id' => sanitize_key( (string) $request->get_param( 'action_id' ) ),
                )
            )
        );
    }
}
