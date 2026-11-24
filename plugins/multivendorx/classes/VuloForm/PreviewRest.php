<?php
/**
 * PreviewRest class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\VuloForm;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * REST route for the Registration settings tab's preview (`PreviewFrame.tsx`). Self-registers
 * on `rest_api_init` instead of going through the plugin's module/REST dispatcher. Also
 * auto-creates the store registration form from the starter template on first use, since
 * there's no manual picker.
 */
class PreviewRest {

    /**
     * PreviewRest constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/vuloform-store-registration-preview/(?P<form_id>\d+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_preview' ),
                    'permission_callback' => array( $this, 'check_permission' ),
                ),
            )
        );
    }

    /**
     * @return true|\WP_Error
     */
    public function check_permission() {
        return Utill::current_user_has_capability( array( 'manage_options' ) );
    }

    /**
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_preview( $request ) {
        if ( ! wp_verify_nonce( (string) $request->get_header( 'X-WP-Nonce' ), 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }

        // "Installed" means active -- VuloForm's classes only autoload while active.
        $installed = class_exists( '\VuloForm\VuloForm' );
        $available = $installed && function_exists( 'vuloform_render' ) && function_exists( 'vuloform_get_form' );

        $response = array(
            'installed'  => $installed,
            'plugin_url' => $installed ? admin_url( 'plugins.php' ) : admin_url( 'plugin-install.php?s=VuloForm&tab=search&type=term' ),
            'available'  => $available,
            'form_id'    => 0,
            'edit_url'   => '',
            'style_url'  => '',
            'html'       => '',
        );

        if ( ! $available ) {
            return rest_ensure_response( $response );
        }

        $form_id = $this->resolve_form_id( absint( $request['form_id'] ) );

        if ( ! $form_id ) {
            return rest_ensure_response( $response );
        }

        $response['form_id']   = $form_id;
        $response['edit_url']  = admin_url( 'admin.php?page=vuloform#&tab=forms&form=' . $form_id );
        $response['style_url'] = function_exists( 'VuloForm' ) ? VuloForm()->plugin_url . 'assets/styles/public/vuloform-form.min.css' : '';
        $response['html']      = vuloform_render( $form_id );

        return rest_ensure_response( $response );
    }

    /**
     * The form to preview/edit: the requested id, the stored one, or a freshly created one.
     *
     * @param int $requested_id Form id from the request, 0 when none was asked for.
     * @return int 0 on failure.
     */
    private function resolve_form_id( $requested_id ) {
        if ( $requested_id && vuloform_get_form( $requested_id ) ) {
            return $requested_id;
        }

        $stored_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( $stored_id && vuloform_get_form( $stored_id ) ) {
            return $stored_id;
        }

        return $this->create_default_form();
    }

    /**
     * @return int 0 when VuloForm's template classes aren't available or creation failed.
     */
    private function create_default_form() {
        if ( ! class_exists( '\VuloForm\Forms\Templates' ) ) {
            return 0;
        }

        $templates = \VuloForm\Forms\Templates::all();

        if ( ! isset( $templates[ Templates::TEMPLATE_ID ] ) ) {
            return 0;
        }

        $form_id = (int) VuloForm()->forms->create(
            $templates[ Templates::TEMPLATE_ID ]['title'],
            $templates[ Templates::TEMPLATE_ID ]['schema'],
            'published'
        );

        if ( $form_id ) {
            MultiVendorX()->setting->update_setting(
                'vuloform_store_registration_form_id',
                $form_id,
                Utill::MULTIVENDORX_SETTINGS['registration']
            );
        }

        return $form_id;
    }
}
