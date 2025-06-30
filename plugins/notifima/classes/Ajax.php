<?php
/**
 * Ajax class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Ajax class
 *
 * @class       Ajax class
 * @version     PRODUCT_VERSION
 * @author      MultivendorX
 */
class Ajax {

    /**
     * Ajax constructor.
     */
    public function __construct() {
        // Save customer email in database.
        add_action( 'wp_ajax_subscribe_users', array( &$this, 'subscribe_users' ) );
        add_action( 'wp_ajax_nopriv_subscribe_users', array( &$this, 'subscribe_users' ) );
        // Delete unsubscribed users.
        add_action( 'wp_ajax_unsubscribe_users', array( $this, 'unsubscribe_users' ) );
        add_action( 'wp_ajax_nopriv_unsubscribe_users', array( $this, 'unsubscribe_users' ) );
        // Export data.
        add_action( 'wp_ajax_export_subscribers', array( $this, 'export_csv_data' ) );
        // add fields for variation product shortcode.
        add_action( 'wp_ajax_nopriv_get_subscription_form_for_variation', array( $this, 'get_subscription_form_for_variation' ) );
        add_action( 'wp_ajax_get_subscription_form_for_variation', array( $this, 'get_subscription_form_for_variation' ) );
    }

    /**
     * Prepare data for CSV export.
     *
     * Generates and outputs a CSV file containing all Notifima subscription details.
     *
     * @param array $argument arguments for data filtering or customization.
     * @return void
     */
    public function export_csv_data( $argument = array() ) {
        $get_subscribed_user = array();

        // Merge the arguments with default arguments.
        if ( ! is_array( $argument ) ) {
            $argument = array();
        }
        $argument = array_merge(
            array(
				'limit'  => -1,
				'return' => 'ids',
            ),
            $argument
        );

        $products = wc_get_products( $argument );

        foreach ( $products as $product ) {
            $product_ids = Subscriber::get_related_product( $product );

            foreach ( $product_ids as $product_id ) {
                $subscribers = Subscriber::get_product_subscribers_email( $product_id );
                if ( $subscribers && ! empty( $subscribers ) ) {
                    $get_subscribed_user[ $product_id ] = $subscribers;
                }
            }
        }

        $csv_header_string = '';
        $csv_headers_array = array();
        $csv_body_arrays   = array();
        $file_name         = 'list_subscribers.csv';

        // Set page headers to force download of CSV.
        header( 'Content-type: text/x-csv' );
        header( 'Content-Disposition: File Transfar' );
        header( "Content-Disposition: attachment;filename= {$file_name} " );

        // Set CSV headers.
        $csv_headings = array(
            'product_id',
            'product_name',
            'product_sku',
            'product_type',
            'subscribers',
        );

        foreach ( $csv_headings as $heading ) {
            $csv_headers_array[] = $heading;
        }
        $csv_header_string = implode( ', ', $csv_headers_array );

        if ( isset( $get_subscribed_user ) && ! empty( $get_subscribed_user ) ) {
            foreach ( $get_subscribed_user as $product_id => $subscribers ) {
                foreach ( $subscribers as $subscriber ) {
                    $product           = wc_get_product( $product_id );
                    $csv_body_arrays[] = array(
                        $product_id,
                        $product->get_name(),
                        $product->get_sku(),
                        $product->get_type(),
                        $subscriber,
                    );
                }
            }
        }

        echo esc_html( $csv_header_string );
        if ( isset( $csv_body_arrays ) && ! empty( $csv_body_arrays ) ) {
            foreach ( $csv_body_arrays as $csv_body_array ) {
                echo "\r\n";
                echo esc_html( implode( ', ', $csv_body_array ) );
            }
        }
        exit();
    }

    /**
     * Unsubscribe a user through ajax call.
     *
     * @return never
     */
    public function unsubscribe_users() {
        if ( ! check_ajax_referer( 'notifima-security-nonce', 'nonce', false ) ) {
            wp_send_json_error( 'Invalid security token sent.' );
            wp_die();
        }

        $customer_email = filter_input( INPUT_POST, 'customer_email', FILTER_SANITIZE_EMAIL ) ? filter_input( INPUT_POST, 'customer_email', FILTER_SANITIZE_EMAIL ) : '';
        $product_id     = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) : '';
        $variation_id   = filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) : 0;

        $settings_array  = Utill::get_form_settings_array();
        $success_msg = $settings_array['alert_unsubscribe_message'];
        // Prepare success msg data
        $success_msg = str_replace('%customer_email%', $customer_email, $success_msg);

        // $success = false;
        $response = array(
            'status'  => false,
            'message' => '<div class="registered-message">' . __('Some error occurs', 'notifima') . ' <a href="${window.location}">' . __('Please try again.', 'notifima') . '</a></div>',
        );

        if ( $product_id && ! empty( $product_id ) && ! empty( $customer_email ) ) {
            $product = wc_get_product( $product_id );
            if ( $product && $product->is_type( 'variable' ) && $variation_id > 0 ) {
                $success = Subscriber::remove_subscriber( $variation_id, $customer_email );
            } else {
                $success = Subscriber::remove_subscriber( $product_id, $customer_email );
            }
            if ($success) {
                $response = array(
                    'status'  => true,
                    'message' => '<div class="registered-message">' . $success_msg . '</div>',
                );
            }
        }
        wp_send_json( $response );
        die();
    }

    /**
     * Subscribe a user through ajax call.
     *
     * @return void
     */
    public function subscribe_users() {
        if ( ! check_ajax_referer( 'notifima-security-nonce', 'nonce', false ) ) {
            wp_send_json_error( 'Invalid security token sent.' );
            wp_die();
        }

        $customer_email = filter_input( INPUT_POST, 'customer_email', FILTER_SANITIZE_EMAIL ) ? filter_input( INPUT_POST, 'customer_email', FILTER_SANITIZE_EMAIL ) : '';
        $product_id     = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) : '';
        $product_title =  filter_input( INPUT_POST, 'product_title', FILTER_UNSAFE_RAW ) ? sanitize_text_field( filter_input( INPUT_POST, 'product_title', FILTER_UNSAFE_RAW ) ) : '';
        $variation_id   = filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) : 0;
        $response = array(
            'status'  => true,
            'message' => '',
        );
    
        $settings_array  = Utill::get_form_settings_array();
        $button_settings = $settings_array['customize_btn'];

        $border_size = ( ! empty( $button_settings['button_border_size'] ) ) ? $button_settings['button_border_size'] . 'px' : '1px';

        $button_css = '';
        if ( ! empty( $button_settings['button_background_color'] ) ) {
            $button_css .= 'background:' . $button_settings['button_background_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_text_color'] ) ) {
            $button_css .= 'color:' . $button_settings['button_text_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_border_color'] ) ) {
            $button_css .= 'border: ' . $border_size . ' solid ' . $button_settings['button_border_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_font_size'] ) ) {
            $button_css .= 'font-size:' . $button_settings['button_font_size'] . 'px; ';
        }
        if ( ! empty( $button_settings['button_border_redious'] ) ) {
            $button_css .= 'border-radius:' . $button_settings['button_border_redious'] . 'px;';
        }

        $unsubscribe_button_html = '<button class="notifima-unsubscribe unsubscribe-button" style="' . $button_css . '">' . $settings_array['unsubscribe_button_text'] . '</button>';

        $valid_email = $settings_array['valid_email'];
        $email_exist = $settings_array['alert_email_exist'];
        // Prepare email exist data
        $email_exist = str_replace('%product_title%', $product_title, $email_exist);
        $email_exist = str_replace('%customer_email%', $customer_email, $email_exist);

        $success_msg = $settings_array['alert_success'];
        // Prepare success msg data
        $success_msg = str_replace('%product_title%', $product_title, $success_msg);
        $success_msg = str_replace('%customer_email%', $customer_email, $success_msg);
        /**
         * Action hook before subscription.
         *
         * @var string $customer_email
         * @var int    $product_id
         * @var int    $variation_id
         */
        do_action( 'notifima_before_subscribe_product', $customer_email, $product_id, $variation_id );

        if ( ! $this->is_email_valid($customer_email) ) {
            $response = array(
                'status'  => false,
                'message' => '<p style="color:#e2401c;" class="responsedata-error-message">' . $valid_email . '</p>',
            );
            wp_send_json( $response );
            return;
        }

        if ( $product_id && ! empty( $product_id ) && ! empty( $customer_email ) ) {
            $product_id = ( $variation_id && $variation_id > 0 ) ? $variation_id : $product_id;
            
            if ( Subscriber::is_already_subscribed( $customer_email, $product_id ) ) {
                $response = array(
                    'status'  => false,
                    'message' => '<div class="registered-message">' . $email_exist . '</div>' . $unsubscribe_button_html . '<input type="hidden" class="notifima_subscribed_email" value="' . esc_attr( $customer_email ) . '" />' . '<input type="hidden" class="notifima_product_id" value="' . esc_attr( $product_id ) . '" />' . '<input type="hidden" class="notifima_variation_id" value="' . esc_attr( $variation_id ) . '" />',
                );

            } else {
                $eligible = apply_filters( 'notifima_eligible_to_subscribe', $response, $customer_email, $product_id );

                if ( $eligible['status'] ) {
                    Subscriber::insert_subscriber( $customer_email, $product_id );
                    Subscriber::insert_subscriber_email_trigger( wc_get_product( $product_id ), $customer_email );
                    $response = array(
                        'status'  => true,
                        'message' => '<div class="registered-message">' . $success_msg . '</div>',
                    );

                    /**
                     * Action hook after subscriber email trigger.
                     *
                     * @var $customer_email customer email address.
                     */
                    do_action( 'notifima_subscriber_added', $customer_email );
                } else {
                    $response = $eligible;
                }
            }
        }

        wp_send_json( $response );
        die();
    }

    public function is_email_valid( $email ) {
        return (bool) preg_match( '/^([a-zA-Z0-9_\.\-\+])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/', $email );
    }

    /**
     * Get the subscription form for variation product through ajax call.
     *
     * @return never
     */
    public function get_subscription_form_for_variation() {
        if ( ! check_ajax_referer( 'notifima-security-nonce', 'nonce', false ) ) {
            wp_send_json_error( 'Invalid security token sent.' );
            wp_die();
        }
        $product_id   = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) : '';
        $variation_id = filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) : '';
        $product      = wc_get_product( $product_id );
        $child_obj    = null;
        if ( $variation_id && ! empty( $variation_id ) ) {
            $child_obj = new \WC_Product_Variation( $variation_id );
        }
        echo wp_kses( Notifima()->frontend->get_subscribe_form( $product, $child_obj ), FrontEnd::$allowed_html );
        die();
    }
}
