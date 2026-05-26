<?php
/**
 * Enquiry module Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX\Enquiry;

use CatalogX\Utill;

/**
 * CatalogX Enquiry Module Rest class
 *
 * @class       Rest class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Rest {
    /**
     * Rest class constructor function
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
    }

    /**
     * Register rest apis
     *
     * @return void
     */
    public function register_rest_routes() {
        register_rest_route(
            CatalogX()->rest_namespace,
            '/enquiries',
            array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'create_enquiry' ),
				'permission_callback' => array( $this, 'enquiry_permission' ),
			)
        );
    }

    /**
     * Save enquiry form data
     *
     * quantity string required
     * Retrieve the quantity of product
     * productId string required
     * Retrieve the product id of enquiry
     * bodyparams array required
     * Retrieve the all body parameter from request
     * fileparams array required
     * Retrieve the all file parameter from request
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_Error|\WP_REST_Response
     */
    public function create_enquiry( $request ) {
        global $wpdb;

        $quantity       = $request->get_param( 'quantity' );
        $product_id     = $request->get_param( 'productId' );
        $request_fields = $request->get_body_params();
        $uploaded_files = $request->get_file_params();

        $user        = wp_get_current_user();
        $user_name   = $user->display_name;
        $user_email  = $user->user_email;
        $attachments = array();

        // Create attachment of files.
        foreach ( $uploaded_files as $file ) {
            $attachment_id = \CatalogX\Utill::create_attachment_from_files_array( $file );
            if ( ! empty( $attachment_id ) ) {
                $attachments[] = get_attached_file( $attachment_id );
            }
        }

        unset( $request_fields['quantity'], $request_fields['productId'] );

        // Gather product information.
        $product_info = apply_filters( 'catalogx_set_enquiry_product_info', array() );
        if ( empty( $product_info ) ) {
            $product_info[ $product_id ] = $quantity;
        }

        // Get extra fields.
        $custom_fields = array();
        foreach ( $request_fields as $key => $value ) {
            switch ( $key ) {
                case 'name':
                    $customer_name = ! empty( $user_name ) ? $user_name : $value;
                    break;

                case 'email':
                    $customer_email = ! empty( $user_email ) ? $user_email : $value;
                    break;

                default:
                    $custom_fields[] = array(
                        'name'  => $key,
                        'value' => $value,
                    );
                    break;
            }
        }

        // Prepare enquiry_record for insertion.
        $enquiry_record = array(
            'product_info'           => wp_json_encode( $product_info ),
            'user_id'                => $user->ID,
            'user_name'              => $customer_name ?? $user_name,
            'user_email'             => $customer_email ?? $user_email,
            'user_additional_fields' => wp_json_encode( $custom_fields ),
        );

        $product_variations = get_transient( 'variation_list' ) ?: array();
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $result = $wpdb->insert( "{$wpdb->prefix}" . Utill::TABLES['enquiry'], $enquiry_record );

        if ( $result ) {
            $enquiry_id   = $wpdb->insert_id;
            $admin_email  = CatalogX()->admin_email;
            $user_details = get_user_by( 'email', $admin_email );
            $to_user_id   = $user_details->data->ID;

            $chat_message = '';
            foreach ( $custom_fields as $key => $field ) {
                if ( 'file' !== $field['name'] ) {
                    $chat_message .= '<strong>' . $field['name'] . ':</strong><br>' . $field['value'] . '<br>';
                }
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
            $wpdb->query( $wpdb->prepare( "INSERT INTO {$wpdb->prefix}" . Utill::TABLES['message'] . ' SET to_user_id=%d, from_user_id=%d, chat_message=%s, product_id=%s, enquiry_id=%d, status=%s, attachment=%d', $to_user_id, $user->ID, $chat_message, wp_json_encode( $product_info ), $enquiry_id, 'unread', $attachment_id ) );

            $enquiry_data = apply_filters(
                'catalogx_enquiry_form_data',
                array(
					'enquiry_id'          => $enquiry_id,
					'user_name'           => $customer_name ?? $user_name,
					'user_email'          => $customer_email ?? $user_email,
					'product_id'          => $product_info,
					'variations'          => $product_variations,
					'user_enquiry_fields' => $custom_fields,
				)
            );

            $attachments = apply_filters( 'catalogx_set_enquiry_pdf_and_attachments', array(), $enquiry_id, $enquiry_data );

            $additional_email = CatalogX()->setting->get_setting( 'additional_alert_email' );
            $email_handler    = WC()->mailer()->emails['EnquiryEmail'];

            $email_handler->trigger( $additional_email, $enquiry_data, $attachments );

            $redirect_link = CatalogX()->setting->get_setting( 'is_page_redirect' ) && CatalogX()->setting->get_setting( 'redirect_page_id' ) ? get_permalink( CatalogX()->setting->get_setting( 'redirect_page_id' ) ) : '';

            $msg = __( 'Enquiry sent successfully', 'multivendorx' );

            do_action( 'catalogx_clear_enquiry' );

            return rest_ensure_response(
                array(
					'redirect_link' => $redirect_link,
					'msg'           => $msg,
                )
            );
        }

        return rest_ensure_response( null );
    }

    /**
     * Check if the current user has permission to access the enquiry.
     *
     * @return bool True if the user has permission, false otherwise.
     */
    public function enquiry_permission() {
        // $user_id = get_current_user_id();
        // // For non-logged in user.
        // if ( 0 === $user_id && empty( CatalogX()->setting->get_setting( 'enquiry_user_permission' ) ) ) {
        // return true;
        // }

        // // Check if user is admin or customer.
        // return current_user_can( 'customer' ) || current_user_can( 'manage_options' );
        return true;
    }
}
