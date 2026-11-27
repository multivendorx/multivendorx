<?php
/**
 * Integration class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations\VuloForm;

use MultiVendorX\Integrations\PluginInstaller;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloForm in as the store registration form builder. Installs VuloForm via the shared
 * `PluginInstaller`; legacy/applicant-field migration lives in the sibling `Migration` class
 * (triggered from `Install.php`'s `do_migration()`). This class only handles the install-state
 * localize data and turning a VuloForm submission into a store.
 *
 * No preview REST route here: the Registration settings tab (`zyra`'s `FormPreview`) fetches the
 * form's embed HTML straight from VuloForm's own public, cross-origin `/public/forms/{id}/embed`
 * endpoint. This class is only responsible for resolving/auto-creating the store registration
 * form id and the install-state check, both localized as plain values via
 * `get_admin_localize_data()` rather than fetched.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new PluginInstaller(
            'vuloform',
            '\VuloForm\VuloForm',
            static function ( $error_message ) {
                return sprintf(
                    /* translators: %s: error message. */
                    __( 'MultiVendorX could not automatically install the VuloForm plugin needed for its forms: %s. Please install and activate "VuloForm" manually from the Plugins screen.', 'multivendorx' ),
                    $error_message
                );
            }
        );
        new Templates();

        add_action( 'vuloform_submission_created', array( $this, 'maybe_register_store' ), 10, 4 );
    }

    /**
     * The install-state/form-id data the Registration settings tab's `FormPreview` needs,
     * localized into `appLocalizer` rather than fetched over REST.
     *
     * @return array {installed, plugin_url, can_activate, form_id}
     */
    public static function get_admin_localize_data() {
        // "Installed" (active) means VuloForm's classes autoload -- they only do while active.
        $installed = class_exists( '\VuloForm\VuloForm' );

        if ( $installed ) {
            return array(
                'installed'    => true,
                'plugin_url'   => '',
                'can_activate' => false,
                'form_id'      => Migration::ensure_form(),
            );
        }

        $plugin_file  = 'vuloform/vuloform.php';
        $file_present = file_exists( WP_PLUGIN_DIR . '/' . $plugin_file );

        return array(
            'installed'    => false,
            'plugin_url'   => $file_present
                ? wp_nonce_url( self_admin_url( 'plugins.php?action=activate&plugin=' . $plugin_file ), 'activate-plugin_' . $plugin_file )
                : admin_url( 'plugin-install.php?s=VuloForm&tab=search&type=term' ),
            'can_activate' => $file_present,
            'form_id'      => 0,
        );
    }

    /**
     * @param int   $submission_id VuloForm submission id (unused -- matching is on form id).
     * @param array $values        Field key => submitted value.
     * @param array $form          The VuloForm form (id, title, status, schema, ...).
     * @param int   $user_id       `get_current_user_id()` as resolved by `PublicForms::submit()`
     *                             -- 0 unless the embed itself carried a `restNonce` (see
     *                             `Renderer::render()`/`registrationForm.tsx`'s `nonce` prop),
     *                             since VuloForm's submit request otherwise runs fully anonymous.
     * @return void
     */
    public function maybe_register_store( $submission_id, $values, $form, $user_id ) {
        $configured_form_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( ! $configured_form_id || $configured_form_id !== (int) $form['id'] ) {
            return;
        }

        $body = array();

        foreach ( $values as $key => $value ) {
            $body[ $key ] = is_scalar( $value ) ? sanitize_text_field( (string) $value ) : $value;
        }

        MultiVendorX()->current_user    = wp_set_current_user( $user_id );
        MultiVendorX()->current_user_id = $user_id;

        $request = new \WP_REST_Request( 'POST', '/' . MultiVendorX()->rest_namespace . '/stores' );
        $request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );
        // Matches the header the old FormViewer-based submission sent -- create_item() returns
        // the applicant's own existing registration data under this flag.
        $request->set_header( 'registrations', 'registrations' );
        $request->set_body_params( array( 'formData' => $body ) );

        $response = rest_do_request( $request );

        if ( $response->is_error() ) {
            Utill::log( $response->as_error() );
        }
    }
}
