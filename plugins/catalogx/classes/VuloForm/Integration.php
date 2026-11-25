<?php
/**
 * Integration class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloForm;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloForm in as the enquiry form builder, for every CatalogX site.
 *
 * No preview REST route here: the Enquiry form settings tab (`zyra`'s `FormPreview`) fetches the
 * form's embed HTML straight from VuloForm's own public, cross-origin `/public/forms/{id}/embed`
 * endpoint. This class is only responsible for resolving/auto-creating the form id (via
 * `Installer::ensure_form()`, so a legacy-field migration or a freshly created starter-template
 * form is reused rather than duplicated here), the install-state check (both localized as plain
 * values via `get_admin_localize_data()` rather than fetched), and turning a VuloForm submission
 * of the enquiry form into an enquiry, via an internal request to CatalogX's own `enquiries` REST
 * route -- reuses its existing create/notify logic as-is.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new Installer();
        new Templates();

        add_action( 'vuloform_submission_created', array( $this, 'maybe_create_enquiry' ), 10, 3 );
    }

    /**
     * The install-state/form-id data the Enquiry form settings tab's `FormPreview` needs,
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
                'form_id'      => ( new Installer() )->ensure_form(),
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
     * @param int   $_submission_id VuloForm submission id (unused -- matching is on form id).
     * @param array $values         Field key => submitted value.
     * @param array $form           The VuloForm form (id, title, status, schema, ...).
     * @return void
     */
    public function maybe_create_enquiry( $_submission_id, $values, $form ) {
        $configured_form_id = (int) CatalogX()->setting->get_setting( 'vuloform_enquiry_form_id', 0 );

        if ( ! $configured_form_id || $configured_form_id !== (int) $form['id'] ) {
            return;
        }

        // `product_id` is either a single product id (the single-product enquiry button) or a
        // JSON `{product_id: quantity}` map (the enquiry cart's bulk "Send enquiry") -- passed
        // through as-is, `create_item()` tells the two apart.
        $product_id = isset( $values['product_id'] ) ? sanitize_text_field( (string) $values['product_id'] ) : 0;

        $body = array(
            'productId' => $product_id,
            'quantity'  => isset( $values['quantity'] ) ? absint( $values['quantity'] ) : 1,
        );

        foreach ( $values as $key => $value ) {
            if ( ! in_array( $key, array( 'product_id', 'quantity' ), true ) ) {
                $body[ $key ] = is_scalar( $value ) ? sanitize_text_field( (string) $value ) : $value;
            }
        }

        $applicant_id      = !empty( $values['user_id'] ) ? absint( $values['user_id'] ) : 0;
        if ( $applicant_id ) {
            wp_set_current_user( $applicant_id );
        }

        $request = new \WP_REST_Request( 'POST', '/' . CatalogX()->rest_namespace . '/enquiries' );
        // No X-WP-Nonce header available here, so issue one for this same request.
        $request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );
        $request->set_body_params( $body );

        $response = rest_do_request( $request );

        wp_set_current_user( CatalogX()->current_user_id );

        if ( $response->is_error() ) {
            Utill::log( $response->as_error() );
        }
    }
}
