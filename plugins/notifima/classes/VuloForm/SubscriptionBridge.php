<?php
/**
 * SubscriptionBridge class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloForm;

use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Turns a VuloForm submission into a Notifima subscriber, via an internal request to Notifima's
 * own `subscribers` REST route -- reuses its existing validation/dedup/notification logic as-is.
 */
class SubscriptionBridge {

    /**
     * SubscriptionBridge constructor.
     */
    public function __construct() {
        add_action( 'vuloform_submission_created', array( $this, 'maybe_subscribe' ), 10, 3 );
    }

    /**
     * @param int   $submission_id VuloForm submission id -- used to recover the product when the
     *                             form's hidden `product_id` field was edited out in the builder.
     * @param array $values        Field key => submitted value.
     * @param array $form          The VuloForm form (id, title, status, schema, ...).
     * @return void
     */
    public function maybe_subscribe( $submission_id, $values, $form ) {
        $configured_form_id = (int) Notifima()->setting->get_setting( 'vuloform_subscription_form_id', 0 );

        if ( ! $configured_form_id || $configured_form_id !== (int) $form['id'] ) {
            return;
        }

        $email      = isset( $values['email'] ) ? sanitize_email( (string) $values['email'] ) : '';
        $product_id = isset( $values['product_id'] ) ? absint( $values['product_id'] ) : 0;

        if ( ! $product_id ) {
            $product_id = $this->product_id_from_page_url( $submission_id );
        }

        if ( ! is_email( $email ) || ! $product_id ) {
            return;
        }

        $product = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : null;

        $request = new \WP_REST_Request( 'POST', '/' . Notifima()->rest_namespace . '/subscribers/' . $product_id );
        // No X-WP-Nonce header available here, so issue one for this same request.
        $request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );
        $request->set_body_params(
            array(
                'action'         => 'subscribe',
                'customer_email' => $email,
                'product_id'     => $product_id,
                'product_title'  => $product ? $product->get_name() : '',
                'variation_id'   => 0,
            )
        );

        $response = rest_do_request( $request );

        if ( $response->is_error() ) {
            Utill::log( $response->as_error() );
        }
    }

    /**
     * Fallback product lookup for when a form's hidden `product_id` field got stripped in
     * VuloForm's own builder UI -- resolved from the product page VuloForm itself recorded as
     * this submission's `meta.page_url`.
     *
     * @param int $submission_id VuloForm submission id.
     * @return int 0 when it can't be resolved.
     */
    private function product_id_from_page_url( $submission_id ) {
        if ( ! $submission_id || ! function_exists( 'vuloform_get_submission' ) ) {
            return 0;
        }

        $submission = vuloform_get_submission( $submission_id );
        $page_url   = $submission['meta']['page_url'] ?? '';

        if ( ! $page_url ) {
            return 0;
        }

        return absint( url_to_postid( $page_url ) );
    }
}
