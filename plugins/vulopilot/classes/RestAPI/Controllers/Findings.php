<?php
/**
 * Findings controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilotCore\ValueObjects\Severity;
use VuloPilot\Repositories\FindingRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /findings backs the shared FindingsTable component (Health/SEO/GEO/
 * WooCommerce/Dashboard pages — src/components/FindingsTable.tsx).
 * POST /findings/{id} backs its "Mark resolved" row action.
 *
 * Zyra's sendApiResponse() (src/services/useApiList.ts and
 * FindingsTable.tsx's handleResolve) always issues a plain POST
 * regardless of semantic intent, so the sub-route accepts
 * WP_REST_Server::EDITABLE (POST/PUT/PATCH) rather than a stricter
 * single-verb registration — matching the client, not an idealized REST
 * verb choice it doesn't actually use.
 *
 * @class       Findings controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Findings extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'findings';

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
        $repository = new FindingRepository();

        $category = sanitize_key( (string) $request->get_param( 'category' ) );
        $severity = sanitize_key( (string) $request->get_param( 'severity' ) );
        $status   = sanitize_key( (string) $request->get_param( 'status' ) );

        if ( '' !== $severity && ! Severity::is_valid( $severity ) ) {
            return new \WP_Error( 'vulopilot_invalid_severity', __( 'Invalid severity filter.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        return rest_ensure_response(
            $repository->find_all(
                array(
                    'page'     => absint( $request->get_param( 'page' ) ) ?: 1,
                    'per_page' => absint( $request->get_param( 'per_page' ) ) ?: 20,
                    'category' => $category,
                    'severity' => $severity,
                    'status'   => $status,
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

        $allowed_statuses = array( 'open', 'resolved', 'ignored', 'snoozed' );

        if ( ! in_array( $status, $allowed_statuses, true ) ) {
            return new \WP_Error( 'vulopilot_invalid_status', __( 'Invalid finding status.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $repository = new FindingRepository();

        if ( ! $repository->find( $id ) ) {
            return new \WP_Error( 'vulopilot_finding_not_found', __( 'Finding not found.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        $updated = $repository->update(
            $id,
            array(
                'status'      => $status,
                'resolved_at' => 'resolved' === $status ? current_time( 'mysql', true ) : null,
            )
        );

        if ( ! $updated ) {
            return new \WP_Error( 'vulopilot_update_failed', __( 'Could not update this finding.', 'vulopilot' ), array( 'status' => 500 ) );
        }

        return rest_ensure_response(
            array(
				'success' => true,
				'id'      => $id,
            )
        );
    }
}
