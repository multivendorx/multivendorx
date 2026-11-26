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

        add_action( 'vuloform_submission_created', array( $this, 'maybe_register_store' ), 10, 3 );
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
     * @return void
     */
    public function maybe_register_store( $submission_id, $values, $form ) {
        $configured_form_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( ! $configured_form_id || $configured_form_id !== (int) $form['id'] ) {
            return;
        }

        // VuloForm's own form.js fetches the submit endpoint with `credentials: "omit"` (so a
        // form can be embedded cross-origin) -- no cookie reaches this request at all, so
        // `MultiVendorX()->current_user_id` (which only reflects *this* request's own, cookie-less
        // anonymous context) is always 0 here, never the real visitor. The applicant's id instead
        // comes from the `applicant_user_id` hidden field Templates::applicant_field() adds,
        // resolved from `{user:id}` when the form was *embedded* (that request does carry the
        // visitor's cookie) -- so it travels in $values like any other submitted value. Store
        // registration always needs a real account (there is no guest/"everyone" path for it), so
        // bail if that's 0.
        $applicant_id = (int) ( $values[ Templates::APPLICANT_FIELD_KEY ] ?? 0 );

        if ( ! $applicant_id || ! get_userdata( $applicant_id ) ) {
            return;
        }

        $body = array();

        foreach ( $values as $key => $value ) {
            $body[ $key ] = is_scalar( $value ) ? sanitize_text_field( (string) $value ) : $value;
        }

        // `Stores::create_item()` reads the submitter from `MultiVendorX()->current_user` -- the
        // free plugin's own cached snapshot, taken once at this (anonymous, cookie-less) request's
        // very start, not from get_current_user_id()/wp_get_current_user() live. Re-syncing
        // WordPress's own current user below (needed for current_user_can() checks elsewhere, e.g.
        // the permission callback) does NOT update that cached snapshot -- it has to be overridden
        // the same way, for the same duration, or create_item() attributes the store to the wrong
        // (anonymous) user. Restore both afterward, since this hook runs before VuloForm's own
        // later callbacks on this same hook (e.g. its webhook/notification dispatch) which still
        // expect the original anonymous context. The wp_set_current_user() call must happen
        // *before* the nonce below is created: wp_create_nonce() ties the nonce to whichever user
        // is current at the time.
        $previous_user_id           = get_current_user_id();
        $previous_container_user_id = MultiVendorX()->current_user_id;
        $previous_container_user    = MultiVendorX()->current_user;

        wp_set_current_user( $applicant_id );
        MultiVendorX()->current_user_id = $applicant_id;
        MultiVendorX()->current_user    = get_userdata( $applicant_id );

        $request = new \WP_REST_Request( 'POST', '/' . MultiVendorX()->rest_namespace . '/stores' );
        // No X-WP-Nonce header available here, so issue one for this same request.
        $request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );
        // Matches the header the old FormViewer-based submission sent -- create_item() returns
        // the applicant's own existing registration data under this flag.
        $request->set_header( 'registrations', 'registrations' );
        $request->set_body_params( array( 'formData' => $body ) );

        $response = rest_do_request( $request );

        wp_set_current_user( $previous_user_id );
        MultiVendorX()->current_user_id = $previous_container_user_id;
        MultiVendorX()->current_user    = $previous_container_user;

        if ( $response->is_error() ) {
            Utill::log( $response->as_error() );
        }
    }
}
