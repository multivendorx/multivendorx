<?php
/**
 * AutomationRuns controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\AutomationRunRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /automation-runs — read-only list of vulopilot_automation_runs rows
 * (ARCHITECTURE.md's Prompt 12), the run history behind an automation's
 * detail view. Same read-only shape as Controllers\AiActionRuns — writes
 * happen only as a side effect of AutomationEngine actually running an
 * automation (via a trigger firing, or Controllers\Automations' "Run now"
 * sub-route), never directly through this controller.
 *
 * @class       AutomationRuns controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AutomationRuns extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'automation-runs';

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
        $repository = new AutomationRunRepository();

        return rest_ensure_response(
            $repository->find_all(
                array(
                    'page'          => absint( $request->get_param( 'page' ) ) ?: 1,
                    'per_page'      => absint( $request->get_param( 'per_page' ) ) ?: 20,
                    'automation_id' => absint( $request->get_param( 'automation_id' ) ) ?: '',
                    'status'        => sanitize_key( (string) $request->get_param( 'status' ) ),
                )
            )
        );
    }
}
