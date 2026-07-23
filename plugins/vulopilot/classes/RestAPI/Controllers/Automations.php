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
 * POST /automations/{id} backs its enable/disable row action.
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

        return rest_ensure_response( array( 'success' => true, 'id' => $id ) );
    }
}
