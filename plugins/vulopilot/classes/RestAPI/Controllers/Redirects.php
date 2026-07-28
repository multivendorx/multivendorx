<?php
/**
 * Redirects controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\RedirectRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET/POST /redirects, POST /redirects/{id}, POST /redirects/{id}/delete —
 * the "Redirects & 404s" feature's own CRUD surface, backing
 * src/pages/Redirects/Redirects.tsx. Same route/verb shape as
 * AiProviders.php (POST rather than PUT/DELETE for update/delete, since the
 * zyra core package's sendApiResponse() helper — what the actual frontend
 * page calls — always issues POST regardless of any `method` override
 * passed in).
 *
 * @class       Redirects controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Redirects extends \WP_REST_Controller {

    /**
     * REST base for this controller's routes.
     *
     * @var string
     */
    protected $rest_base = 'redirects';

    /**
     * Registers GET/POST /redirects, POST /redirects/{id}, POST /redirects/{id}/delete.
     *
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
                    'methods'             => array( \WP_REST_Server::EDITABLE, \WP_REST_Server::CREATABLE ),
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)/delete',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'delete_item' ),
                    'permission_callback' => array( $this, 'delete_item_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Same manage_options gate every other VuloPilot REST route uses.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Same manage_options gate every other VuloPilot REST route uses.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Same manage_options gate every other VuloPilot REST route uses.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Same manage_options gate every other VuloPilot REST route uses.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function delete_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Lists redirects, paginated/filtered/searched, plus active/inactive counts for the status pill bar.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) {
        $repository = new RedirectRepository();

        $page     = absint( $request->get_param( 'page' ) );
        $per_page = absint( $request->get_param( 'per_page' ) );

        $result                     = $repository->find_all(
            array(
                'page'      => $page ? $page : 1,
                'per_page'  => $per_page ? $per_page : 20,
                'is_active' => sanitize_key( (string) $request->get_param( 'is_active' ) ),
                'search'    => sanitize_text_field( (string) $request->get_param( 'search' ) ),
                'orderby'   => sanitize_key( (string) $request->get_param( 'orderby' ) ),
                'order'     => sanitize_key( (string) $request->get_param( 'order' ) ),
            )
        );
        $result['is_active_counts'] = $repository->count_by_column( 'is_active' );

        return rest_ensure_response( $result );
    }

    /**
     * Creates a new redirect, rejecting a source path that already has one.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_item( $request ) {
        $source_path = RedirectRepository::normalize_path( sanitize_text_field( (string) $request->get_param( 'source_path' ) ) );
        $target_url  = esc_url_raw( (string) $request->get_param( 'target_url' ) );

        if ( '/' === $source_path || '' === $target_url ) {
            return new \WP_Error( 'vulopilot_invalid_redirect', __( 'Both a source path and a target URL are required.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $repository = new RedirectRepository();

        if ( $repository->find_by_source_path( $source_path ) ) {
            return new \WP_Error(
                'vulopilot_redirect_already_exists',
                __( 'A redirect for this path already exists — edit or delete the existing one instead.', 'vulopilot' ),
                array( 'status' => 400 )
            );
        }

        $redirect_type = absint( $request->get_param( 'redirect_type' ) );

        $id = $repository->insert(
            array(
                'source_path'   => $source_path,
                'target_url'    => $target_url,
                'redirect_type' => in_array( $redirect_type, array( 301, 302 ), true ) ? $redirect_type : 301,
                'hit_count'     => 0,
                'is_active'     => 1,
                'created_by'    => get_current_user_id(),
            )
        );

        return rest_ensure_response( $repository->find( $id ) );
    }

    /**
     * Partially updates a redirect — only the fields actually present in the request body change.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item( $request ) {
        $id         = absint( $request->get_param( 'id' ) );
        $repository = new RedirectRepository();

        if ( ! $repository->find( $id ) ) {
            return new \WP_Error( 'vulopilot_redirect_not_found', __( 'Redirect not found.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        $update = array();

        if ( null !== $request->get_param( 'target_url' ) ) {
            $update['target_url'] = esc_url_raw( (string) $request->get_param( 'target_url' ) );
        }

        if ( null !== $request->get_param( 'redirect_type' ) ) {
            $redirect_type           = absint( $request->get_param( 'redirect_type' ) );
            $update['redirect_type'] = in_array( $redirect_type, array( 301, 302 ), true ) ? $redirect_type : 301;
        }

        if ( null !== $request->get_param( 'is_active' ) ) {
            $update['is_active'] = $request->get_param( 'is_active' ) ? 1 : 0;
        }

        if ( empty( $update ) ) {
            return new \WP_Error( 'vulopilot_no_changes', __( 'Nothing to update.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( ! $repository->update( $id, $update ) ) {
            return new \WP_Error( 'vulopilot_update_failed', __( 'Could not update this redirect.', 'vulopilot' ), array( 'status' => 500 ) );
        }

        return rest_ensure_response( $repository->find( $id ) );
    }

    /**
     * Deletes a redirect.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function delete_item( $request ) {
        $id         = absint( $request->get_param( 'id' ) );
        $repository = new RedirectRepository();

        if ( ! $repository->find( $id ) ) {
            return new \WP_Error( 'vulopilot_redirect_not_found', __( 'Redirect not found.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        if ( ! $repository->delete( $id ) ) {
            return new \WP_Error( 'vulopilot_delete_failed', __( 'Could not delete this redirect.', 'vulopilot' ), array( 'status' => 500 ) );
        }

        return rest_ensure_response( array( 'deleted' => true ) );
    }
}
