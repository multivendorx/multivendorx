<?php
/**
 * Quote module Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX\Quote;

/**
 * CatalogX Quote Module Rest class
 *
 * @class       Rest class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Rest {
    /**
     * Rest class constructor functions
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
    }

    /**
     * Regsiter rest api
     *
     * @return void
     */
    public function register_rest_api() {
        register_rest_route(
            CatalogX()->rest_namespace,
            '/quote-cart',
            array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'get_quote_cart' ),
					'permission_callback' => array( $this, 'quote_cart_permission' ),
				),
				array(
					'methods'             => 'PUT',
					'callback'            => array( $this, 'update_quote_cart' ),
					'permission_callback' => array( $this, 'quote_cart_permission' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_quote_cart' ),
					'permission_callback' => array( $this, 'quote_cart_permission' ),
				),
			)
        );

        register_rest_route(
            CatalogX()->rest_namespace,
            '/quotes',
            array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'process_quote_request' ),
				'permission_callback' => array( $this, 'quote_cart_permission' ),
			)
        );
    }

    /**
     * Get all the quote in cart
     *
     * Row string required
     * Retrieve the row parameter
     * Page string optional
     * Retrieve the current page
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_Error|\WP_REST_Response
     */
    public function get_quote_cart( $request ) {
        $row  = $request->get_param( 'row' );
        $page = $request->get_param( 'page' );

        // Get all cart data.
        $all_cart_data = CatalogX()->quotecart->get_cart_data();

        // Calculate pagination.
        $total_items = count( $all_cart_data );
        $offset      = ( $page - 1 ) * $row;

        // Slice data for current page.
        $paginated_cart_data = array_slice( $all_cart_data, $offset, $row );

        // Prepare the quote list.
        $quote_list = array();
        foreach ( $paginated_cart_data as $key => $item ) {
            $product   = wc_get_product( $item['product_id'] );
            $thumbnail = $product->get_image( apply_filters( 'catalogx_quote_cart_item_thumbnail_size', array( 84, 84 ) ) );
            $name      = '';
            if ( $item['variation'] ) {
                foreach ( $item['variation'] as $label => $value ) {
                    $label = str_replace( array( 'attribute_pa_', 'attribute_' ), '', $label );
                    $name .= '<br>' . ucfirst( $label ) . ': ' . ucfirst( $value );
                }
            }

            $product_price = $product->get_price();
            $quantity      = isset( $item['quantity'] ) ? $item['quantity'] : 1;
            $subtotal      = $product_price * $quantity;

            $quote_list[] = apply_filters(
                'catalogx_quote_list_data',
                array(
					'key'      => $key,
					'id'       => $product->get_id(),
					'image'    => $thumbnail,
					'name'     => $product->get_name() . ( $name ? $name : '' ),
					'quantity' => $item['quantity'],
					'total'    => wc_price( $subtotal ),
				),
				$product
            );
        }

        return rest_ensure_response(
            array(
				'count'    => $total_items,
				'response' => $quote_list,
			)
        );
    }


    /**
     * Update quote in cart
     *
     * Products array required
     * Retrieve the product which is in quote cart
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_Error|\WP_REST_Response
     */
    public function update_quote_cart( $request ) {
        $products = $request->get_param( 'products' );

        foreach ( $products as $key => $product ) {
            $product_id = $product['id'];
            $quantity   = $product['quantity'];
            CatalogX()->quotecart->update_cart( $product['key'], 'quantity', $quantity );
            $update_msg = __( 'Quote cart updated!', 'catalogx' );
        }

        return rest_ensure_response( array( 'msg' => $update_msg ) );
    }

    /**
     * Remove quote in cart
     *
     * ProductId string required
     * Retrieve the product id which is remove from quote cart
     * Key string required
     * Retrieve the key which generated from quote cart
     *
     * @param mixed \WP_REST_Request $request The REST request object.
     * @return \WP_Error|\WP_REST_Response
     */
    public function delete_quote_cart( $request ) {
        $product_id = $request->get_param( 'productId' );
        $key        = $request->get_param( 'key' );
        $status     = false;
        if ( $product_id && isset( $key ) ) {
            $status = CatalogX()->quotecart->remove_cart( $key );
        }
        return rest_ensure_response(
            array(
				'status'    => $status,
				'cart_data' => CatalogX()->quotecart->get_cart_data(),
			)
        );
    }

    /**
     * Send quote from cart and create order or reject quote from my-account page
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_Error|\WP_REST_Response
     */
    public function process_quote_request( $request ) {
        $request_data = $request->get_params();
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
        $product_data = $request->get_param( 'formData' ) ? CatalogX()->quotecart->get_cart_data() : $form_data['product_info'];
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
            'details' => $customer_message,
        );
        $email         = WC()->mailer()->emails['requestQuoteSendEmail'];
        $email->trigger( $product_info, $customer_data );

        // Clear cart if applicable.
        if ( $request->get_param( 'formData' ) ) {
            CatalogX()->quotecart->clear_cart();
        }

        return rest_ensure_response(
            array(
				'order_id' => $order->get_id(),
            )
        );
    }

    /**
     * Check if the current user has permission to access the quote cart.
     *
     * @return bool True if the user has permission, false otherwise.
     */
    public function quote_cart_permission() {
        $user_id = get_current_user_id();
        // For non-logged in user.
        if ( 0 === $user_id ) {
            return true;
        }

        // Check if user is admin or customer.
        return current_user_can( 'customer' ) || current_user_can( 'manage_options' );
    }
}
