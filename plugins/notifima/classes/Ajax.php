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
 * @version     3.0.0
 * @author      MultiVendorX
 */
class Ajax {

    /**
     * Ajax constructor.
     */
    public function __construct() {
        // Save customer email in database.
        add_action( 'wp_ajax_subscribe_users', array( $this, 'subscribe_users' ) );
        add_action( 'wp_ajax_nopriv_subscribe_users', array( $this, 'subscribe_users' ) );
        // Delete unsubscribed users.
        add_action( 'wp_ajax_unsubscribe_users', array( $this, 'unsubscribe_users' ) );
        add_action( 'wp_ajax_nopriv_unsubscribe_users', array( $this, 'unsubscribe_users' ) );
        // add fields for variation product shortcode.
        add_action( 'wp_ajax_nopriv_get_subscription_form_for_variation', array( $this, 'get_subscription_form_for_variation' ) );
        add_action( 'wp_ajax_get_subscription_form_for_variation', array( $this, 'get_subscription_form_for_variation' ) );
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

        $customer_email = filter_input( INPUT_POST, 'customer_email', FILTER_SANITIZE_EMAIL );
        $customer_email = $customer_email ?: '';

        $product_id   = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT );
        $product_id   = $product_id ?: '';

        $variation_id = filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT );
        $variation_id =$variation_id ?: 0;

        $current_user = Notifima()->current_user;
        if ( ! empty( $current_user ) && empty( $customer_email ) ) {
            $customer_email = $current_user->user_email;
        }

        if ( empty( $customer_email ) ) {
            wp_send_json_error( 'Empty customer Email' );
            wp_die();
        }

        $response = array(
            'status'  => false,
            'message' => '<div class="woocommerce-notices-wrapper"> <ul class="woocommerce-error" role="alert"><li>' . __( 'Some error occurs', 'notifima' ) . ' <a href="${window.location}">' . __( 'Please try again.', 'notifima' ) . '</li></ul></div>',
        );

        if ( $product_id && ! empty( $customer_email ) ) {
            $product = wc_get_product( $product_id );
            if ( $product && $product->is_type( 'variable' ) && $variation_id > 0 ) {
                $success = Subscriber::remove_subscriber( $variation_id, $customer_email );
            } else {
                $success = Subscriber::remove_subscriber( $product_id, $customer_email );
            }
            if ( $success ) {
                $settings_array = Utill::get_form_settings_array();
                $success_msg    = $settings_array['alert_unsubscribe_message'];
                // Prepare success msg data.
                $success_msg = str_replace( '%customer_email%', $customer_email, $success_msg );

                $response = array(
                    'status'  => true,
                    'message' => '<div class="woocommerce-notices-wrapper"> <ul class="woocommerce-message" role="alert"><li>' . $success_msg . '</li></ul></div>',
                );
            }
        }
        wp_send_json( $response );
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
        $product_title  = filter_input( INPUT_POST, 'product_title', FILTER_UNSAFE_RAW ) ? sanitize_text_field( filter_input( INPUT_POST, 'product_title', FILTER_UNSAFE_RAW ) ) : '';
        $variation_id   = filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) : 0;

        $response = array(
            'status'  => true,
            'message' => '',
        );

        $request_data = filter_input_array( INPUT_POST, FILTER_SANITIZE_FULL_SPECIAL_CHARS );
        $response     = apply_filters( 'notifima_handle_subscription_form_data', $response, $request_data );

        $settings_array = Utill::get_form_settings_array();

        /**
         * Action hook before subscription.
         *
         * @var string $customer_email
         * @var int    $product_id
         * @var int    $variation_id
         */
        do_action( 'notifima_before_subscribe_product', $customer_email, $product_id, $variation_id );

        if ( ! $this->is_email_valid( $customer_email ) ) {
            $valid_email = $settings_array['valid_email'];

            $response = array(
                'status'  => false,
                'message' => '<ul class="notifima-error-message woocommerce-error" role="alert"><li>' . $valid_email . '</li></ul>',
            );
            wp_send_json( $response );
            return;
        }

        if ( $product_id && ! empty( $customer_email ) ) {
            $product_id = ( $variation_id && $variation_id > 0 ) ? $variation_id : $product_id;

            if ( Subscriber::is_already_subscribed( $customer_email, $product_id ) ) {
                $button_css              = Notifima()->frontend->subscribe_button_styles();
                $unsubscribe_button_html = '<button class="notifima-unsubscribe wp-block-button__link has-border-color has-accent-1-border-color wp-element-button"' . $button_css . '">' . $settings_array['unsubscribe_button_text'] . '</button>';

                $email_exist = $settings_array['alert_email_exist'];
                // Prepare email exist data.
                $email_exist = str_replace( '%product_title%', $product_title, $email_exist );
                $email_exist = str_replace( '%customer_email%', $customer_email, $email_exist );

                $response = array(
                    'status'  => false,
                    'message' => sprintf(
                        '<div class="woocommerce-notices-wrapper"><ul class="woocommerce-message" role="alert"><li>%s</li></ul></div>%s<input type="hidden" class="notifima-subscribed-email" value="%s" /><input type="hidden" class="notifima-product-id" value="%s" /><input type="hidden" class="notifima-variation-id" value="%s" />',
                        esc_html( $email_exist ),
                        $unsubscribe_button_html,
                        esc_attr( $customer_email ),
                        esc_attr( $product_id ),
                        esc_attr( $variation_id )
                    ),
                );
            } else {
                $subscription_status = apply_filters( 'notifima_eligible_to_subscribe', $response, $customer_email, $product_id );

                if ( $subscription_status['status'] ) {
                    Subscriber::insert_subscriber( $customer_email, $product_id );
                    Subscriber::insert_subscriber_email_trigger( wc_get_product( $product_id ), $customer_email );
                    $success_msg = $settings_array['alert_success'];
                    // Prepare success msg data.
                    $success_msg = str_replace( '%product_title%', $product_title, $success_msg );
                    $success_msg = str_replace( '%customer_email%', $customer_email, $success_msg );

                    $response = array(
                        'status'  => true,
                        'message' => '<div class="woocommerce-notices-wrapper"> <ul class="woocommerce-message" role="alert"><li>' . $success_msg . '</li></ul></div>',
                    );

                    /**
                     * Action hook after subscriber email trigger.
                     *
                     * @var $customer_email customer email address.
                     */
                    do_action( 'notifima_subscriber_added', $customer_email );
                } else {
                    $response = $subscription_status;
                }
            }
        }

        wp_send_json( $response );
    }

    /**
     * Validate email address format.
     *
     * @param string $email The email address to validate.
     * @return bool True if the email is valid, false otherwise.
     */
    public function is_email_valid( $email ) {
        return is_email( $email );
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
        $variation_product    = null;
        if ( $variation_id ) {
            $variation_product = new \WC_Product_Variation( $variation_id );
        }
        echo wp_kses( Notifima()->frontend->get_subscribe_form( $product, $variation_product ), FrontEnd::$allowed_html );
        die();
    }

        public function get_subscribe_form( $product, $variation = null ) {
        if ( ! Subscriber::is_product_outofstock( $variation ? $variation : $product ) ) {
            return '';
        }

        if( $variation && 'yes' === $variation->get_meta(Utill::NOTIFIMA_PRODUCT_META['product_discontinued'])){
            return;
        }
        
        $notifima_fields_array = array();
        $notifima_fields_html  = '';
        $user_email            = '';
        $separator             = apply_filters( 'notifima_subscription_form_fields_separator', '<br>' );
        $settings_array        = Utill::get_form_settings_array();
        $button_settings       = $settings_array['customize_btn'];

        if ( is_user_logged_in() ) {
            $current_user = Notifima()->current_user;
            $user_email   = $current_user->data->user_email;
        }
        $placeholder = $settings_array['email_placeholder_text'];

        $additional_fields[] = apply_filters( 'notifima_subscription_form_additional_fields', '' );

        if ( ! empty( $additional_fields ) ) {
            foreach ( $additional_fields as $field ) {
                $notifima_fields_array[] = $field;
            }
        }

        $notifima_fields_array[] = '<input id="notifima_alert_email" type="text" name="alert_email" class="notifima-email" value="' . esc_attr( $user_email ) . '" placeholder="' . $placeholder . '" >';
        if ( $notifima_fields_array ) {
            $notifima_fields_html = implode( $separator, $notifima_fields_array );
        }

        $alert_text_html = '<h5 style="color:' . esc_html( $settings_array['alert_text_color'] ) . '" class="subscribe-for-interest-text">' . esc_html( $settings_array['alert_text'] ) . '</h5>';

        $button_css = $this->subscribe_button_styles();

        $button_html = '<button style="' . $button_css . '" class="notifima-subscribe notifima-button subscribe-button-hover">' . esc_html( $button_settings['button_text'] ) . '</button>';

        $interested_person = get_post_meta( $variation ? $variation->get_id() : $product->get_id(), 'no_of_subscribers', true );
        $interested_person = max( 0, (int) $interested_person );

        $shown_interest_html = '';
        $shown_interest_text = esc_html( $settings_array['shown_interest_text'] );

        $is_enable_no_interest = Notifima()->setting->get_setting( 'is_enable_no_interest','' );

        if ( 'show_count' === $is_enable_no_interest && 0 !== $interested_person && $shown_interest_text ) {
            $shown_interest_text = str_replace( '%no_of_subscribed%', $interested_person, $shown_interest_text );
            $shown_interest_html = '<p>' . $shown_interest_text . '</p>';
        }

        $lead_text_html = apply_filters( 'notifima_display_product_lead_time', $variation ? $variation : $product );

        return $lead_text_html .
        '<div class="notifima-subscribe-form woocommerce-notices-wrapper"> <ul class="woocommerce-message">
            ' . $alert_text_html . '
            <li> ' . $notifima_fields_html . '' . $button_html . '
            </li>
            <input type="hidden" class="notifima-product-id" value="' . esc_attr( $product->get_id() ) . '" />
            <input type="hidden" class="notifima-variation-id" value="' . esc_attr( $variation ? $variation->get_id() : 0 ) . '" />
            <input type="hidden" class="notifima-product-name" value="' . esc_attr( $product->get_title() ) . '" />
            ' . $shown_interest_html . '
        </ul></div>';
    }
}
