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
 * GET /ai-action-runs backs the Dashboard's "Pending Approval" widget.
 * POST /ai-action-runs/{id}/approve|reject|rollback complete the write
 * side — AIActions\ActionRunner::approve()/reject()/rollback() have been
 * fully implemented since AI-ACTIONS.md's own pass, but this controller
 * used to only expose get_items(), leaving the entire Preview → Approval
 * → Execution → Rollback lifecycle with no way to actually approve or
 * reject anything from the UI. Each has real side effects (a site
 * mutation, for approve/rollback), so each is its own POST route with its
 * own permission check, not folded into a generic PATCH.
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

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)/approve',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'approve_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)/reject',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'reject_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)/rollback',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'rollback_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
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
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Approves and executes a pending AI action run.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function approve_item( $request ) {
        try {
            $result = VuloPilot()->ai_action_runner->approve( absint( $request->get_param( 'id' ) ) );
        } catch ( \RuntimeException $exception ) {
            return new \WP_Error( 'vulopilot_ai_action_not_pending', $exception->getMessage(), array( 'status' => 409 ) );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulopilot_ai_action_invalid', $exception->getMessage(), array( 'status' => 400 ) );
        }

        return rest_ensure_response( array_merge( array( 'success' => true ), $result ) );
    }

    /**
     * Declines a pending AI action run without ever executing it.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function reject_item( $request ) {
        try {
            VuloPilot()->ai_action_runner->reject( absint( $request->get_param( 'id' ) ) );
        } catch ( \RuntimeException $exception ) {
            return new \WP_Error( 'vulopilot_ai_action_not_pending', $exception->getMessage(), array( 'status' => 409 ) );
        }

        return rest_ensure_response( array( 'success' => true ) );
    }

    /**
     * Reverts a previously executed AI action run.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function rollback_item( $request ) {
        try {
            VuloPilot()->ai_action_runner->rollback( absint( $request->get_param( 'id' ) ) );
        } catch ( \RuntimeException $exception ) {
            return new \WP_Error( 'vulopilot_ai_action_not_rollbackable', $exception->getMessage(), array( 'status' => 409 ) );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulopilot_ai_action_invalid', $exception->getMessage(), array( 'status' => 400 ) );
        }

        return rest_ensure_response( array( 'success' => true ) );
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
