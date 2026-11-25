<?php
/**
 * Enquiry module Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX\Enquiry;

use CatalogX\Utill;
use CatalogX\Integrations\VuloMail\Integration as VuloMailIntegration;
use CatalogX\Integrations\VuloMail\Templates as VuloMailTemplates;

/**
 * CatalogX Enquiry Module Rest class
 *
 * @class       Rest class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Rest {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'enquiries';

    /**
     * Rest class constructor function
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

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
                    'permission_callback' => array( $this, 'catalogx_create_item_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Check if the current user has permission to access the enquiry.
     *
     * @return bool True if the user has permission, false otherwise.
     */
    public function catalogx_create_item_permissions_check() {
        return Utill::current_user_has_capability( array( 'customer', 'wholesale_user', 'manage_options' ), '', 'enquiry_user_permission' );
    }

    /**
     * Save enquiry form data
     *
     * Quantity string required
     * Retrieve the quantity of product
     * productId string required
     * Retrieve the product id of enquiry
     * bodyparams array required
     * Retrieve all body parameters from request
     * fileparams array required
     * Retrieve  all file parameters from request
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_Error|\WP_REST_Response
     */
    public function create_item( $request ) {

        $nonce_validation = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_validation ) ) {
            return $nonce_validation;
        }
        try {
            global $wpdb;

            $quantity            = absint( $request->get_param( 'quantity' ) );
            $product_id_param    = $request->get_param( 'productId' );
            $product_id          = absint( $product_id_param );
            $enquiry_form_fields = $request->get_body_params();
            $uploaded_files      = $request->get_file_params();

            $user       = CatalogX()->current_user;
            $user_name  = $user->display_name;
            $user_email = $user->user_email;

            // VuloForm's own submission never carries cookies (it supports cross-origin
            // embeds), so `CatalogX()->current_user` is anonymous here even for a logged-in
            // shopper -- the real user id is staged into the form's hidden `user_id` field
            // instead, from a request that did carry cookies (the embed call).
            $submitted_user_id = absint( $request->get_param( 'user_id' ) );

            if ( $submitted_user_id ) {
                $real_user = get_user_by( 'id', $submitted_user_id );

                if ( $real_user ) {
                    $user       = $real_user;
                    $user_name  = $real_user->display_name;
                    $user_email = $real_user->user_email;
                }
            }

            $attachment_id = null;
            $attachments   = array();

            // Create attachment of files.
            foreach ( $uploaded_files as $file ) {
                $attachment_id = \CatalogX\Utill::create_attachment_from_files_array( $file );
                if ( ! empty( $attachment_id ) ) {
                    $attachments[] = get_attached_file( $attachment_id );
                }
            }

            unset( $enquiry_form_fields['quantity'], $enquiry_form_fields['productId'], $enquiry_form_fields['user_id'] );

            // Gather product information. `productId` is either a single product id (the
            // single-product enquiry button) or a JSON `{product_id: quantity}` map (the
            // enquiry cart's bulk "Send enquiry", baked in via the same `?productId=` query
            // param at embed time -- see catalogx-pro's EnquiryCartTable.tsx).
            $product_info = apply_filters( 'catalogx_set_enquiry_product_info', array() );
            $cart_products = json_decode( (string) $product_id_param, true );

            if ( empty( $product_info ) ) {
                if ( is_array( $cart_products ) ) {
                    foreach ( $cart_products as $cart_product_id => $cart_quantity ) {
                        $product_info[ absint( $cart_product_id ) ] = absint( $cart_quantity );
                    }
                } else {
                    $product_info[ $product_id ] = $quantity;
                }
            }

            // Get extra fields.
            $additional_fields = array();
            foreach ( $enquiry_form_fields as $key => $value ) {
                switch ( $key ) {
                    case 'name':
                        $customer_name = ! empty( $user_name ) ? $user_name : sanitize_text_field( (string) $value );
                        break;

                    case 'email':
                        $submitted_email = sanitize_email( $value );
                        $customer_email  = ! empty( $user_email ) ? $user_email : ( is_email( $submitted_email ) ? $submitted_email : '' );
                        break;

                    default:
                        // VuloForm's `phone` field type submits a nested `{phone: "..."}` value.
                        $additional_fields[] = array(
                            'name'  => $key,
                            'value' => is_array( $value )
                                ? sanitize_text_field( (string) ( $value['phone'] ?? '' ) )
                                : $value,
                        );
                        break;
                }
            }

            // Prepare enquiry_record for insertion.
            $enquiry_record = array(
                'product_info'           => serialize( $product_info ),
                'user_id'                => $user->ID,
                'user_name'              => $customer_name ?? $user_name,
                'user_email'             => $customer_email ?? $user_email,
                'user_additional_fields' => serialize( $additional_fields ),
                'date'                   => current_time( 'mysql', true ),
            );

            if ( ! WC()->session ) {
                WC()->initialize_session();
            }

            $product_variations = WC()->session ? WC()->session->get( 'catalogx_variation_list', array() ) : array();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $result = $wpdb->insert( "{$wpdb->prefix}" . Utill::TABLES['enquiry'], $enquiry_record );

            if ( $result ) {
                $enquiry_id   = $wpdb->insert_id;
                $admin_email  = CatalogX()->admin_email;
                $user_details = get_user_by( 'email', $admin_email );
                $to_user_id   = $user_details->data->ID;

                $chat_message = '';
                foreach ( $additional_fields as $field ) {
                    if ( 'file' !== $field['name'] ) {
                        $chat_message .= sprintf(
                            '<strong>%s:</strong><br>%s<br>',
                            esc_html( $field['name'] ),
                            esc_html( $field['value'] )
                        );
                    }
                }

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->insert(
                    "{$wpdb->prefix}" . Utill::TABLES['message'],
                    array(
                        'to_user_id'   => $to_user_id,
                        'from_user_id' => $user->ID,
                        'chat_message' => $chat_message,
                        'product_id'   => wp_json_encode( $product_info ),
                        'enquiry_id'   => $enquiry_id,
                        'status'       => 'unread',
                        'is_read'      => 0,
                        'attachment'   => $attachment_id,
                    ),
                    array(
                        '%d',
                        '%d',
                        '%s',
                        '%s',
                        '%d',
                        '%s',
                        '%d',
                        '%d',
                    )
                );
                $enquiry_data = apply_filters(
                    'catalogx_enquiry_form_data',
                    array(
                        'enquiry_id'          => $enquiry_id,
                        'user_name'           => $customer_name ?? $user_name,
                        'user_email'          => $customer_email ?? $user_email,
                        'product_id'          => $product_info,
                        'variations'          => $product_variations,
                        'user_enquiry_fields' => $additional_fields,
                    )
                );

                $attachments      = apply_filters( 'catalogx_set_enquiry_pdf_and_attachments', array(), $enquiry_id, $enquiry_data );
                $additional_email = CatalogX()->setting->get_setting( 'additional_alert_email' );

                // Store emails, same as the old EnquiryEmail::add_store_emails().
                if ( Utill::is_active_plugin( 'multivendorx' ) ) {
                    foreach ( $product_info as $enquired_product_id => $quantity ) {
                        $store_id = get_post_meta( $enquired_product_id, 'multivendorx_store_id', true );
                        $store    = new \MultiVendorX\Store\Store( $store_id );

                        if ( $store ) {
                            $additional_email .= ', ' . sanitize_email( $store->get( 'email' ) );
                        }
                    }
                }

                $enquired_product_names = array();

                foreach ( $product_info as $enquired_product_id => $quantity ) {
                    $enquired_product = wc_get_product( $enquired_product_id );

                    if ( $enquired_product ) {
                        $enquired_product_names[] = $enquired_product->get_name();
                    }
                }

                $product_name_text = count( $enquired_product_names ) > 1
                    ? __( 'MULTIPLE PRODUCTS', 'catalogx' )
                    : ( $enquired_product_names[0] ?? '' );

                $enquiry_details = '';

                foreach ( (array) $additional_fields as $field ) {
                    if ( ! empty( $field['name'] ) && isset( $field['value'] ) && '' !== $field['value'] ) {
                        $enquiry_details .= esc_html( $field['name'] ) . ': ' . esc_html( $field['value'] ) . '<br>';
                    }
                }

                $reply_to_name  = str_replace( array( "\r", "\n" ), '', (string) $enquiry_data['user_name'] );
                $reply_to_email = sanitize_email( (string) $enquiry_data['user_email'] );
                $reply_to       = is_email( $reply_to_email ) ? 'Reply-to: ' . $reply_to_name . ' <' . $reply_to_email . '>' : '';

                VuloMailIntegration::send(
                    VuloMailTemplates::ENQUIRY,
                    $additional_email,
                    array(
                        '{product_name}'   => $product_name_text,
                        '{user_name}'      => (string) $enquiry_data['user_name'],
                        '{user_email}'     => (string) $enquiry_data['user_email'],
                        '{enquiry_details}' => $enquiry_details,
                    ),
                    $reply_to,
                    $attachments
                );

                // Check if page redirection after enquiry is enabled.

                $is_redirect_enabled = CatalogX()->setting->get_setting( 'is_page_redirect' );
                $redirect_page_id    = CatalogX()->setting->get_setting( 'redirect_page_id' );

                $redirect_link = $is_redirect_enabled && $redirect_page_id
                    ? get_permalink( $redirect_page_id )
                    : '';

                $success_message = __( 'Enquiry sent successfully', 'catalogx' );

                do_action( 'catalogx_clear_enquiry' );

                return rest_ensure_response(
                    array(
                        'redirect_link' => $redirect_link,
                        'msg'           => $success_message,
                    )
                );
            }

            return rest_ensure_response( null );
        } catch ( \Exception $e ) {
			Utill::server_error( $e );
		}
    }
}
