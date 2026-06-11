<?php
/**
 * Modules REST API Quote controller
 *
 * @package catalogx
 */

namespace CatalogX\Quote;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * catalogx REST API Quote controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      catalogx
 */
class Quotes extends \WP_REST_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'quotes';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            CatalogX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'create_item_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Get items permissions check.
     *
     * @param object $request The request object.
     */
    public function create_item_permissions_check( $request ) {
        $user_id = CatalogX()->current_user_id;
        // For non-logged in user.
        if ( 0 === $user_id ) {
            return true;
        }

        // Check if user is admin or customer.
        return current_user_can( 'read' ) || current_user_can( 'manage_options' );
    }


    /**
     * create an item.
     *
     * @param object $request The request object.
     */
    public function create_item( $request ) {

        $nonce_validation = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_validation ) ) {
            return $nonce_validation;
        }

        try {
            $form_data    = $request->get_param( 'formData' ) ?? $request->get_param( 'enquiry' ) ?? array();

            // Handle rejection case.
            $order_id = $request->get_param( 'orderId' );
            if ( ! empty( $order_id ) ) {
                $status = $request->get_param( 'status' );
                $reason = $request->get_param( 'reason' );
                if ( ! empty( $order_id ) && ! empty( $status ) && ! empty( $reason ) ) {
                    $order = wc_get_order( $order_id );
                    $order->update_status( 'wc-quote-rejected' );
                    $order->set_customer_note( $reason );
                    $order->save();
                    /* translators: %s: reject quotation number. */
                    return rest_ensure_response( array( 'message' => sprintf( __( 'You have confirmed rejection of the quotation No: %d', 'catalogx' ), $order_id ) ) );
                }
            }

            if ( empty( $form_data ) ) {
                return new WP_Error( 'invalid_data', __( 'Missing form data.', 'catalogx' ), array( 'status' => 400 ) );
            }

            // Sanitize input fields.
            $customer_name    = isset( $form_data['name'] ) ? sanitize_text_field( $form_data['name'] ) : '';
            $customer_email   = isset( $form_data['email'] ) ? sanitize_email( $form_data['email'] ) : '';
            $customer_phone   = isset( $form_data['phone'] ) ? sanitize_text_field( $form_data['phone'] ) : '';
            $customer_message = isset( $form_data['message'] ) ? sanitize_textarea_field( $form_data['message'] ) : '';

            // Retrieve customer or create guest data.
            $customer    = empty( $customer_email ) ? get_user_by( 'email', $form_data['email'] ) : get_user_by( 'email', $customer_email );
            $customer_id = $customer ? $customer->ID : Util::get_customer_id_by_email( $customer_email );

            // Order arguments.
            $args = array(
                'status'      => 'wc-quote-new',
                'customer_id' => $customer_id,
            );

            // Create order.
            $order = wc_create_order( $args );
            if ( ! $order ) {
                return new WP_Error( 'order_error', __( 'Failed to create order.', 'catalogx' ), array( 'status' => 500 ) );
            }

            // Add customer details.
            $order->set_customer_id( $customer_id );
            $order->set_billing_first_name( $customer_name ? $customer_name : ( $customer ? $customer->display_name : '' ) );
            $order->set_billing_email( empty( $customer_email ) ? $customer->user_email : $customer_email );
            $order->set_billing_phone( $customer_phone );

            // Get product data.
            $product_data = $request->get_param( 'formData' ) ? CatalogX()->quotecart->get_cart_contents() : $form_data['product_info'];
            $product_info = array();
            $product_ids  = array();

            foreach ( $product_data as $item ) {
                $product_id = isset( $item['product_id'] ) ? $item['product_id'] : ( isset( $item['id'] ) ? $item['id'] : null );
                $quantity   = isset( $item['quantity'] ) ? intval( $item['quantity'] ) : 0;

                $product_info[] = array(
                    'product_id' => $product_id,
                    'quantity'   => $quantity,
                );
                if ( $product_id && $quantity > 0 ) {
                    $product = wc_get_product( $product_id );
                    if ( $product ) {
                        $order->add_product( $product, $quantity );
                    }
                }
                $product_ids[] = $product_id;
            }

            // Add order notes and metadata.
            if ( ! empty( $customer_message ) ) {
                $order->add_order_note( $customer_message );
            }
            $order->calculate_totals();
            $order->add_meta_data( 'quote_req', 'yes' );
            $order->add_meta_data( 'quote_customer_name', $customer_name );
            $order->add_meta_data( 'quote_customer_email', $customer_email );
            $order->add_meta_data( 'quote_customer_msg', $customer_message );
            $order->save();

            // If this request comes from an enquiry and quote save as enquiry msg.
            do_action( 'catalogx_quote_save_as_enquiry_msg', $form_data['id'], $customer_id, $product_ids, $order->get_id() );

            // Send email.
            $customer_data = array(
                'name'    => $customer_name,
                'email'   => $customer_email,
                'phone'   => $customer_phone,
                'details' => $customer_message,
            );
            $email         = WC()->mailer()->emails['requestQuoteSendEmail'];
            $email->trigger( $product_info, $customer_data );

            // Clear cart if applicable.
            if ( $request->get_param( 'formData' ) ) {
                CatalogX()->quotecart->clear_quote_cart();
            }

            return rest_ensure_response(
                array(
                    'order_id' => $order->get_id(),
                )
            );
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'catalogx' ),
                array( 'status' => 500 )
            );
        }
    }
}
