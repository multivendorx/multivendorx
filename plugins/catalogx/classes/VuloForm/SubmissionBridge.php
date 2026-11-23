<?php
/**
 * SubmissionBridge class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloForm;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Turns a VuloForm submission of the enquiry form into an enquiry, via an internal request to
 * CatalogX's own `enquiries` REST route -- reuses its existing create/notify logic as-is.
 */
class SubmissionBridge {

    /**
     * SubmissionBridge constructor.
     */
    public function __construct() {
        add_action( 'vuloform_submission_created', array( $this, 'maybe_create_enquiry' ), 10, 3 );
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

        // No early return when this is empty: the Enquiry Cart's bulk "Send an enquiry" form
        // (catalogx-pro) is this same configured form, submitted with no product_id at all --
        // `create_item()` gets its product list from the cart itself server-side, via
        // `catalogx-pro`'s `catalogx_set_enquiry_product_info` filter (modules/Enquiry/Admin.php),
        // not from this field. Only the single-product enquiry button actually relies on it.
        $product_id = isset( $values['product_id'] ) ? absint( $values['product_id'] ) : 0;

        $body = array(
            'productId' => $product_id,
            'quantity'  => isset( $values['quantity'] ) ? absint( $values['quantity'] ) : 1,
        );

        foreach ( $values as $key => $value ) {
            if ( ! in_array( $key, array( 'product_id', 'quantity' ), true ) ) {
                $body[ $key ] = is_scalar( $value ) ? sanitize_text_field( (string) $value ) : $value;
            }
        }

        // VuloForm's public submit endpoint is deliberately unauthenticated (so an embedded,
        // cross-origin form can still submit) -- by this point in the request, WordPress's own
        // REST layer has reset the real current user to anonymous (get_current_user_id()/
        // is_user_logged_in() both report logged-out here) even for a visitor who really is
        // logged in. `CatalogX()->current_user_id` was captured earlier in this same request,
        // before that happened, so it still holds the real identity (0 for a genuine guest) --
        // re-sync WordPress's own current user to it before dispatching, then restore
        // afterward, since this hook runs before VuloForm's own later callbacks (e.g.
        // Webhooks::queue) which still expect the original anonymous context. Without this,
        // `catalogx_create_item_permissions_check()` denies a logged-in customer's own
        // enquiry: the `enquiry_user_permission === 'everyone'` anonymous bypass doesn't apply
        // (CatalogX()->current_user_id isn't 0), yet current_user_can() also fails (the live
        // user really is anonymous here) -- neither path can succeed without this re-sync.
        $previous_user_id = get_current_user_id();
        wp_set_current_user( CatalogX()->current_user_id );

        $request = new \WP_REST_Request( 'POST', '/' . CatalogX()->rest_namespace . '/enquiries' );
        // No X-WP-Nonce header available here, so issue one for this same request.
        $request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );
        $request->set_body_params( $body );

        $response = rest_do_request( $request );

        wp_set_current_user( $previous_user_id );

        if ( $response->is_error() ) {
            Utill::log( $response->as_error() );
        }
    }
}
