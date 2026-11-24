<?php
/**
 * SubmissionBridge class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\VuloForm;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Turns a VuloForm submission of the store registration form into a store, via an internal
 * request to MultiVendorX's own `stores` REST route -- reuses its existing create/approval logic
 * as-is.
 */
class SubmissionBridge {

    /**
     * SubmissionBridge constructor.
     */
    public function __construct() {
        add_action( 'vuloform_submission_created', array( $this, 'maybe_register_store' ), 10, 3 );
    }

    /**
     * @param int   $_submission_id VuloForm submission id (unused -- matching is on form id).
     * @param array $values         Field key => submitted value.
     * @param array $form           The VuloForm form (id, title, status, schema, ...).
     * @return void
     */
    public function maybe_register_store( $_submission_id, $values, $form ) {
        $configured_form_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( ! $configured_form_id || $configured_form_id !== (int) $form['id'] ) {
            return;
        }

        // VuloForm's public submit endpoint is deliberately unauthenticated (so an embedded,
        // cross-origin form can still submit) -- is_user_logged_in()/get_current_user_id() are
        // always false/0 here regardless of whether the real visitor is logged in.
        // `MultiVendorX()->current_user_id` was captured earlier in this same request, before
        // that happened, so it still holds the real identity. Store registration always needs a
        // real account (there is no guest/"everyone" path for it), so bail if that's 0.
        $applicant_id = (int) MultiVendorX()->current_user_id;

        if ( ! $applicant_id ) {
            return;
        }

        $body = array();

        foreach ( $values as $key => $value ) {
            $body[ $key ] = is_scalar( $value ) ? sanitize_text_field( (string) $value ) : $value;
        }

        // `Stores::create_item()` reads the submitter from the real current user
        // (current_user_can(), MultiVendorX()->current_user) rather than anything on $request --
        // re-sync WordPress's own current user to the real identity before dispatching, then
        // restore it afterward, since this hook runs before VuloForm's own later callbacks on
        // this same hook (e.g. its webhook/notification dispatch) which still expect the
        // original anonymous context. This must happen *before* the nonce below is created:
        // wp_create_nonce() ties the nonce to whichever user is current at the time.
        $previous_user_id = get_current_user_id();
        wp_set_current_user( $applicant_id );

        $request = new \WP_REST_Request( 'POST', '/' . MultiVendorX()->rest_namespace . '/stores' );
        // No X-WP-Nonce header available here, so issue one for this same request.
        $request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );
        // Matches the header the old FormViewer-based submission sent -- create_item() returns
        // the applicant's own existing registration data under this flag.
        $request->set_header( 'registrations', 'registrations' );
        $request->set_body_params( array( 'formData' => $body ) );

        $response = rest_do_request( $request );

        wp_set_current_user( $previous_user_id );

        if ( $response->is_error() ) {
            Utill::log( $response->as_error() );
        }
    }
}
