<?php
/**
 * DashboardLayout controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * GET/POST /dashboard-layout backs the Dashboard page's drag-and-drop
 * widget grid (src/dashboard-widgets/DashboardGrid.tsx). Persists to user
 * meta rather than VULOPILOT_SETTINGS_KEY's shared wp_options row — see
 * Utill::DASHBOARD_LAYOUT_META_KEY's docblock for why a widget
 * arrangement is per-user state, not site-wide settings.
 *
 * @class       DashboardLayout controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class DashboardLayout extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'dashboard-layout';

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
     * Returns the current user's saved layout, reconciled against
     * Utill::DASHBOARD_WIDGET_IDS: any widget id that exists but isn't in
     * the saved layout yet (a widget added after this user last saved a
     * custom order) is appended, enabled by default; any saved id that no
     * longer exists (a removed widget) is dropped. This is what makes a
     * stale saved layout additive-safe instead of silently hiding new
     * widgets forever.
     *
     * @inheritDoc
     */
    public function get_items( $request ) {
        return rest_ensure_response( $this->get_reconciled_layout() );
    }

    /**
     * @inheritDoc
     */
    public function update_item( $request ) {
        $submitted = $request->get_param( 'widgets' );

        if ( ! is_array( $submitted ) || empty( $submitted ) ) {
            return new \WP_Error( 'vulopilot_invalid_layout', __( 'A widget layout array is required.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $layout = array();

        foreach ( $submitted as $entry ) {
            $id = sanitize_key( (string) ( is_array( $entry ) ? ( $entry['id'] ?? '' ) : '' ) );

            if ( ! in_array( $id, Utill::DASHBOARD_WIDGET_IDS, true ) ) {
                continue; // Unknown id — never persist a widget id the client invented.
            }

            $layout[] = array(
                'id'      => $id,
                'enabled' => ! empty( $entry['enabled'] ),
            );
        }

        if ( empty( $layout ) ) {
            return new \WP_Error( 'vulopilot_invalid_layout', __( 'No valid widgets in the submitted layout.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        update_user_meta( get_current_user_id(), Utill::DASHBOARD_LAYOUT_META_KEY, $layout );

        return rest_ensure_response( array( 'success' => true ) );
    }

    /**
     * @return array<int, array{id: string, enabled: bool}>
     */
    private function get_reconciled_layout(): array {
        $saved = get_user_meta( get_current_user_id(), Utill::DASHBOARD_LAYOUT_META_KEY, true );
        $saved = is_array( $saved ) ? $saved : array();

        $by_id = array();
        foreach ( $saved as $entry ) {
            $id = is_array( $entry ) ? (string) ( $entry['id'] ?? '' ) : '';
            if ( in_array( $id, Utill::DASHBOARD_WIDGET_IDS, true ) ) {
                $by_id[ $id ] = ! empty( $entry['enabled'] );
            }
        }

        $reconciled = array();

        foreach ( array_keys( $by_id ) as $id ) {
            $reconciled[] = array(
                'id'      => $id,
                'enabled' => $by_id[ $id ],
            );
        }

        foreach ( Utill::DASHBOARD_WIDGET_IDS as $id ) {
            if ( ! array_key_exists( $id, $by_id ) ) {
                $reconciled[] = array(
                    'id'      => $id,
                    'enabled' => true,
                );
            }
        }

        return $reconciled;
    }
}
