<?php
/**
 * Findings controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\ValueObjects\Severity;
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

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/bulk',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'bulk_update_items' ),
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

        $category    = sanitize_key( (string) $request->get_param( 'category' ) );
        $severity    = sanitize_key( (string) $request->get_param( 'severity' ) );
        $status      = sanitize_key( (string) $request->get_param( 'status' ) );
        $search      = sanitize_text_field( (string) $request->get_param( 'search' ) );
        $scanner_ids = $this->parse_scanner_ids( $request->get_param( 'scanner_id' ) );

        if ( '' !== $severity && ! Severity::is_valid( $severity ) ) {
            return new \WP_Error( 'vulopilot_invalid_severity', __( 'Invalid severity filter.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $result                  = $repository->find_all(
            array(
                'page'       => absint( $request->get_param( 'page' ) ) ?: 1,
                'per_page'   => absint( $request->get_param( 'per_page' ) ) ?: 20,
                'category'   => $category,
                'severity'   => $severity,
                'status'     => $status,
                'search'     => $search,
                'scanner_id' => $scanner_ids ?? '',
                'orderby'    => sanitize_key( (string) $request->get_param( 'orderby' ) ),
                'order'      => sanitize_key( (string) $request->get_param( 'order' ) ),
            )
        );
        $result['status_counts'] = $repository->get_status_counts( '' !== $category ? $category : null, $scanner_ids );

        return rest_ensure_response(
            // Lets a Pro module (vulopilot-pro's OneClickFix) annotate each
            // row with a `fix_action_id` without Free knowing anything
            // about AI-action-to-scanner mapping — same "register a
            // source, don't modify the host" pattern as
            // vulopilot_reports_advanced_panel/vulopilot_pro_dashboard_component.
            apply_filters( 'vulopilot_finding_list_response', $result )
        );
    }

    /**
     * SEO.tsx's per-section tables (e.g. "Titles & meta") pass a
     * comma-separated `scanner_id` param covering every scanner id that
     * section groups together, since FindingRepository::find_all()'s
     * filterable_columns only exact-matches a single scalar per column
     * value unless given an array (AbstractRepository::build_column_where_clause()).
     * A single scanner id (no comma) still round-trips correctly as a
     * one-element array.
     *
     * @param mixed $raw_param Raw `scanner_id` request param.
     * @return string[]|null Sanitized scanner ids, or null when the param was empty/absent.
     */
    private function parse_scanner_ids( $raw_param ): ?array {
        if ( empty( $raw_param ) ) {
            return null;
        }

        $scanner_ids = array_filter( array_map( 'sanitize_key', explode( ',', (string) $raw_param ) ) );

        return $scanner_ids ? array_values( $scanner_ids ) : null;
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

    /**
     * Backs FindingsTable.tsx's bulk Resolve/Ignore action — applies the
     * same status update update_item() does, to every id in one request,
     * via AbstractRepository::bulk_update()'s single-row-update loop.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function bulk_update_items( $request ) {
        $ids    = array_map( 'absint', (array) $request->get_param( 'ids' ) );
        $status = sanitize_key( (string) $request->get_param( 'status' ) );

        if ( ! in_array( $status, array( 'resolved', 'ignored' ), true ) ) {
            return new \WP_Error( 'vulopilot_invalid_status', __( 'Invalid bulk finding status.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( empty( $ids ) ) {
            return new \WP_Error( 'vulopilot_no_ids', __( 'No findings selected.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $repository    = new FindingRepository();
        $updated_count = $repository->bulk_update(
            $ids,
            array(
                'status'      => $status,
                'resolved_at' => 'resolved' === $status ? current_time( 'mysql', true ) : null,
            )
        );

        return rest_ensure_response(
            array(
                'success' => true,
                'updated' => $updated_count,
            )
        );
    }
}
