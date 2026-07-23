<?php
/**
 * Automations controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\AutomationRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /automations backs src/pages/Automation/Automation.tsx's table;
 * POST /automations/{id} backs its enable/disable row action; POST
 * /automations creates a new one; POST /automations/{id}/run is the
 * "Run now" action, delegating to AutomationEngine\AutomationEngine::run_now()
 * (ManualTrigger's and RestTrigger's own `trigger_type` both mean "only
 * ever invoked through this route", not fired ambiently — see their own
 * docblocks).
 *
 * @class       Automations controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Automations extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'automations';

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
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'create_item_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)/run',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'run_item' ),
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
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function get_items( $request ) {
        $repository = new AutomationRepository();

        return rest_ensure_response(
            $repository->find_all(
                array(
                    'page'     => absint( $request->get_param( 'page' ) ) ?: 1,
                    'per_page' => absint( $request->get_param( 'per_page' ) ) ?: 20,
                    'status'   => sanitize_key( (string) $request->get_param( 'status' ) ),
                )
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function update_item( $request ) {
        $id     = absint( $request->get_param( 'id' ) );
        $status = sanitize_key( (string) $request->get_param( 'status' ) );

        if ( ! in_array( $status, array( 'enabled', 'disabled' ), true ) ) {
            return new \WP_Error( 'vulopilot_invalid_status', __( 'Invalid automation status.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $repository = new AutomationRepository();

        if ( ! $repository->find( $id ) ) {
            return new \WP_Error( 'vulopilot_automation_not_found', __( 'Automation not found.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        if ( ! $repository->update( $id, array( 'status' => $status ) ) ) {
            return new \WP_Error( 'vulopilot_update_failed', __( 'Could not update this automation.', 'vulopilot' ), array( 'status' => 500 ) );
        }

        return rest_ensure_response(
            array(
				'success' => true,
				'id'      => $id,
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function create_item( $request ) {
        $name         = sanitize_text_field( (string) $request->get_param( 'name' ) );
        $trigger_type = sanitize_key( (string) $request->get_param( 'trigger_type' ) );
        $rule_key     = sanitize_key( (string) $request->get_param( 'rule_key' ) );
        $actions      = $request->get_param( 'actions' );

        if ( '' === $name ) {
            return new \WP_Error( 'vulopilot_missing_name', __( 'An automation needs a name.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( ! VuloPilot()->automation_trigger_registry->get_trigger( $trigger_type ) ) {
            return new \WP_Error( 'vulopilot_invalid_trigger', __( 'Unknown trigger type.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( '' !== $rule_key && ! VuloPilot()->rule_registry->get_rule( $rule_key ) ) {
            return new \WP_Error( 'vulopilot_invalid_rule', __( 'Unknown rule id.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( ! is_array( $actions ) || empty( $actions ) ) {
            return new \WP_Error( 'vulopilot_missing_actions', __( 'An automation needs at least one action.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        foreach ( $actions as $action ) {
            $action_type = is_array( $action ) ? sanitize_key( (string) ( $action['type'] ?? '' ) ) : '';

            if ( ! VuloPilot()->automation_action_registry->get_action( $action_type ) ) {
                return new \WP_Error(
                    'vulopilot_invalid_action',
                    /* translators: %s is the unrecognized action type the request sent. */
                    sprintf( __( 'Unknown automation action type: %s', 'vulopilot' ), $action_type ),
                    array( 'status' => 400 )
                );
            }
        }

        $repository    = new AutomationRepository();
        $automation_id = $repository->insert(
            array(
                'name'           => $name,
                'rule_id'        => null,
                'trigger_type'   => $trigger_type,
                'trigger_config' => wp_json_encode( array( 'rule_key' => $rule_key ?: null ) ),
                'actions'        => wp_json_encode( $actions ),
                'status'         => 'enabled',
                'created_by'     => get_current_user_id(),
            )
        );

        return rest_ensure_response(
            array(
                'success' => true,
                'id'      => $automation_id,
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function run_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );

        try {
            $result = VuloPilot()->automation_engine->run_now( $id );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulopilot_automation_not_found', $exception->getMessage(), array( 'status' => 404 ) );
        } catch ( \RuntimeException $exception ) {
            return new \WP_Error( 'vulopilot_automation_no_match', $exception->getMessage(), array( 'status' => 409 ) );
        }

        return rest_ensure_response(
            array_merge( array( 'success' => true ), $result )
        );
    }
}
