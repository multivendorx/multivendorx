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
