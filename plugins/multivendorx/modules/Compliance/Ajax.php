<?php
/**
 * Modules Compliance Ajax Class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Compliance;

use MultiVendorX\Compliance\Util;
use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

/**
 * MultiVendorX Compliance Module.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Ajax {
    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'wp_ajax_multivendorx_submit_report_abuse', array( $this, 'handle_report_abuse' ) );
        add_action( 'wp_ajax_nopriv_multivendorx_submit_report_abuse', array( $this, 'handle_report_abuse' ) );
        add_action( 'wp_ajax_get_report_reasons', array( $this, 'get_report_reasons' ) );
        add_action( 'wp_ajax_nopriv_get_report_reasons', array( $this, 'get_report_reasons' ) );
    }

    /**
     * Handle the report abuse form submission.
     */
    public function handle_report_abuse() {
        // Verify nonce.
        check_ajax_referer( 'report_abuse_ajax_nonce', 'nonce' );

        // Get and sanitize inputs.
        $name       = filter_input( INPUT_POST, 'name', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
        $email      = filter_input( INPUT_POST, 'email', FILTER_SANITIZE_EMAIL );
        $message    = filter_input( INPUT_POST, 'message', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
        $product_id = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT );

        if ( empty( $name ) || empty( $email ) || empty( $message ) || ! $product_id ) {
            wp_send_json_error( 'All fields are required.' );
        }

        // Get store_id from product meta.
        $store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true ) ?? 0;

        // Check if this user (email) already reported this product.
        $existing_reports = Util::get_report_abuse_information(
            array(
				'product_id' => $product_id,
				'email'      => $email,
            )
        );

        if ( ! empty( $existing_reports ) ) {
            wp_send_json_error( 'You have already submitted a report for this product.' );
        }

        // Save the report using Util function.
        $report_id = Util::create_report_abuse(
            array(
				'store_id'   => $store_id,
				'product_id' => $product_id,
				'name'       => $name,
				'email'      => $email,
				'message'    => $message,
            )
        );

        if ( ! $report_id ) {
            wp_send_json_error( 'Something went wrong, please try again.' );
        }

        $store = new Store($store_id);
        $product = wc_get_product($product_id);

        do_action(
            'multivendorx_notify_report_abuse_submitted',
                'report_abuse_submitted',
                array(
                    'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                    'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                    'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                    'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                    'customer_email' => $email,
                    'product_name'    => $product->get_name(),
                    'category'    => 'activity',
                )
            );

        wp_send_json_success( 'Your report has been submitted. Thank you!' );
    }

    /**
     * Get the list of reasons for reporting abuse.
     */
    public function get_report_reasons() {
        // Get the saved reasons from settings.
        $reasons = MultiVendorX()->setting->get_setting( 'abuse_report_reasons', array() );
        // Extract reason values.
        $reason_list = array();
        foreach ( $reasons as $reason ) {
            $reason_list[] = $reason['label'];
        }

        // Add an "Other" option at the end.
        $reason_list[] = 'Other';

        // Send the final list back as JSON.
        wp_send_json_success( $reason_list );
    }
}
