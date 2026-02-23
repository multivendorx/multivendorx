<?php
/**
 * MultiVendorX Stripe Connect payment gateway.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Payments;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Stripe Connect payment gateway.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class StripeConnect {

    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'multivendorx_process_stripe-connect_payment', array( $this, 'process_payment' ), 10, 5 );

        // Register AJAX.
        add_action( 'wp_ajax_create_stripe_account', array( $this, 'ajax_create_account' ) );
        add_action( 'wp_ajax_disconnect_stripe_account', array( $this, 'ajax_disconnect_account' ) );

        // Use admin_post endpoint for OAuth callback (works whether user is logged-in or not).
        add_action( 'admin_post_multivendorx_stripe_oauth_callback', array( $this, 'handle_oauth_callback' ) );
    }

    /**
     * Get payment method ID
     *
     * @return string
     */
    public function get_id() {
        return 'stripe-connect';
    }

    /**
     * Get payment method settings
     *
     * @return array
     */
    public function get_settings() {
        $redirect_url = admin_url( 'admin-post.php?action=multivendorx_stripe_oauth_callback' );
        return array(
            'icon'       => 'stripe-connect',
            'id'         => $this->get_id(),
            'label'      => 'Stripe Connect',
            'desc'       => __( 'Marketplace payouts via Stripe Connect (OAuth).', 'multivendorx' ),
            'disableBtn' => true,
            'formFields' => array(
                array(
                    'key'     => 'payment_mode',
                    'type'    => 'setting-toggle',
                    'label'   => __( 'Payment mode', 'multivendorx' ),
                    'options' => array(
                        array(
							'key'   => 'test',
							'label' => __( 'Test', 'multivendorx' ),
							'value' => 'test',
						),
                        array(
							'key'   => 'live',
							'label' => __( 'Live', 'multivendorx' ),
							'value' => 'live',
						),
                    ),
                ),
                array(
                    'key'         => 'test_client_id',
                    'type'        => 'text',
                    'label'       => __( 'Stripe client ID', 'multivendorx' ),
                    'placeholder' => __( 'Enter Stripe Client ID', 'multivendorx' ),
                    'dependent'   => array(
                        'key'   => 'payment_mode',
                        'set'   => true,
                        'value' => 'test',
                    ),
                ),
                array(
                    'key'         => 'live_client_id',
                    'type'        => 'text',
                    'label'       => __( 'Stripe client ID', 'multivendorx' ),
                    'placeholder' => __( 'Enter Stripe Client ID', 'multivendorx' ),
                    'dependent'   => array(
                        'key'   => 'payment_mode',
                        'set'   => true,
                        'value' => 'live',
                    ),
                ),
                array(
                    'key'         => 'test_secret_key',
                    'type'        => 'text',
                    'label'       => __( 'Secret key', 'multivendorx' ),
                    'placeholder' => __( 'Enter secret key ', 'multivendorx' ),
                    'dependent'   => array(
                        'key'   => 'payment_mode',
                        'set'   => true,
                        'value' => 'test',
                    ),
                ),
                array(
                    'key'         => 'live_secret_key',
                    'type'        => 'text',
                    'label'       => __( 'Secret key', 'multivendorx' ),
                    'placeholder' => __( 'Enter secret key', 'multivendorx' ),
                    'dependent'   => array(
                        'key'   => 'payment_mode',
                        'set'   => true,
                        'value' => 'live',
                    ),
                ),
                array(
                    'key'   => 'redirect_url',
                    'type'  => 'copy-text',
                    'label' => __( 'Redirect url', 'multivendorx' ),
                    'title' => $redirect_url,
                    'desc'  => __( 'Copy this URL and add it to your Stripe dashboard as a redirect URL.', 'multivendorx' ),
                ),
            ),
        );
    }

    /**
     * Get store payment settings
     */
    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();

        if ( ! empty( $stripe_settings ) && $stripe_settings['enable'] ) {
            $store_id = MultiVendorX()->active_store;

            $store             = new Store( $store_id );
            $stripe_account_id = $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'] );
            $onboarding_status = $stripe_account_id ? 'Connected' : 'Not Connected';
            $badge_class       = ( $stripe_account_id ) ? 'green' : 'red';
            $fields            = array(
                array(
                    'type' => 'blocktext',
                    'title' => __( 'Stripe Status:', 'multivendorx' ),
                    'blocktext' =>  $onboarding_status,
                ),
            );

            if ( ! is_admin() ) {
                if ( $stripe_account_id ) {
                    $fields[] = array(
                        'type'   => 'button',
                        'key'    => 'disconnect_account',
                        'label'  => __( 'Disconnect Stripe Account', 'multivendorx' ),
                        'text'  => __( 'Disconnect', 'multivendorx' ),
                        'action' => 'disconnect_stripe_account',
                        'class'  => 'mvx-stripe-disconnect-btn',
                    );
                } else {
                    $fields[] = array(
                        'type'   => 'button',
                        'key'    => 'create_account',
                        'label'  => __( 'Connect with Stripe', 'multivendorx' ),
                        'text'  => __( 'Connect', 'multivendorx' ),
                        'action' => 'create_stripe_account',
                        'class'  => 'mvx-stripe-connect-btn',
                    );
                }
            }

            return array(
                'id'     => $this->get_id(),
                'label'  => __( 'Stripe Connect', 'multivendorx' ),
                'fields' => $fields,
            );
        }
    }

    /**
     * Process payment
     *
     * @param int    $store_id Store ID.
     * @param float  $amount Amount to be paid.
     * @param int    $order_id Order ID.
     * @param string $transaction_id Transaction ID.
     * @param string $note Note.
     */
    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null ) {
        $store             = new Store( $store_id );
        $stripe_account_id = $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'] );

        $transfer = $this->create_transfer( $amount, $stripe_account_id, $order_id );

        $status = $transfer ? 'success' : 'failed';

        do_action( 'multivendorx_after_payment_complete', $store_id, 'Stripe Connect', $status, $order_id, $transaction_id, $note, $amount );
    }

    /**
     * Create Stripe account
     */
    public function ajax_create_account() {
        $store_id               = MultiVendorX()->active_store;
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();
        $mode                   = $stripe_settings['payment_mode'] ?? 'test';
        $client_id              = $mode === 'test' ? $stripe_settings['test_client_id'] : $stripe_settings['live_client_id'] ?? '';

        if ( empty( $client_id ) ) {
            wp_send_json_error( array( 'message' => __( 'Stripe Client ID not configured.', 'multivendorx' ) ) );
        }

        // Use admin-post.php as redirect.
        $redirect_uri = admin_url( 'admin-post.php?action=multivendorx_stripe_oauth_callback' );
        $state        = wp_generate_password( 24, false, false );

        // Store store ID in option for verification.
        $store = new Store( $store_id );
        $store->update_meta(
            Utill::STORE_SETTINGS_KEYS['stripe_oauth_state'],
            wp_json_encode(
                array(
                    'state' => $state,
                    'time'  => time(),
                )
            )
        );

        $onboarding_url = add_query_arg(
            array(
				'response_type' => 'code',
				'client_id'     => $client_id,
				'scope'         => 'read_write',
				'redirect_uri'  => $redirect_uri,
				'state'         => $state,
            ),
            'https://connect.stripe.com/oauth/authorize'
        );

        wp_send_json_success(
            array(
				'message'        => __( 'Redirecting to Stripe onboarding...', 'multivendorx' ),
				'onboarding_url' => $onboarding_url,
            )
        );
    }

    /**
     * Handle Stripe OAuth callback
     */
    public function handle_oauth_callback() {
        $code  = sanitize_text_field( filter_input( INPUT_GET, 'code', FILTER_DEFAULT ) );
        $state = sanitize_text_field( filter_input( INPUT_GET, 'state', FILTER_DEFAULT ) );
        if ( ! $code || ! $state ) {
            wp_safe_redirect( $this->get_redirect_url( 'error', 'stripe_oauth' ) );
            exit;
        }
        // We don't know store_id yet → search it via active store.
        $store_id = MultiVendorX()->active_store;
        $store    = new Store( $store_id );

        $raw_state = $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_oauth_state'] );

        $state_data = json_decode( $raw_state, true ) ?? array();

        if (
            empty( $state_data['state'] ) ||
            $state_data['state'] !== $state ||
            ( time() - $state_data['time'] ) > 600
        ) {
            // Invalid or expired.
            $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_oauth_state'] );
            wp_safe_redirect( $this->get_redirect_url( 'error', 'invalid_state' ) );
            exit;
        }

        // Valid → clean up.
        $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_oauth_state'] );
        $store                  = new Store( $store_id );
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();
        $mode                   = $stripe_settings['payment_mode'] ?? 'test';
        $secret_key             = $mode === 'test' ? $stripe_settings['test_secret_key'] : $stripe_settings['live_secret_key'] ?? '';
        $client_id              = $mode === 'test' ? $stripe_settings['test_client_id'] : $stripe_settings['live_client_id'] ?? '';

        // Stripe OAuth Token Request.
        $response = $this->make_stripe_api_call(
            'https://connect.stripe.com/oauth/token',
            array(
                'grant_type'    => 'authorization_code',
                'client_id'     => $client_id,
                'client_secret' => $secret_key,
                'code'          => $code,
            )
        );
        // Missing stripe_user_id -> fail.
        if ( $response && empty( $response['stripe_user_id'] ) ) {
            wp_safe_redirect( $this->get_redirect_url( 'error', 'stripe_connection_failed' ) );
            exit;
        }
        $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'], sanitize_text_field( $response['stripe_user_id'] ) );
        // Success.
        wp_safe_redirect( $this->get_redirect_url( '', '' ) );
        exit;
    }

    /**
     * Disconnect Stripe account
     */
    public function ajax_disconnect_account() {

        $store_id = MultiVendorX()->active_store;
        $store    = new Store( $store_id );

        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();

        $mode       = $stripe_settings['payment_mode'] ?? 'test';
        $client_id  = $mode === 'test' ? $stripe_settings['test_client_id'] : $stripe_settings['live_client_id'] ?? '';
        $secret_key = $mode === 'test' ? $stripe_settings['test_secret_key'] : $stripe_settings['live_secret_key'] ?? '';

        $stripe_account_id = $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'] );

        // Deauthorize Stripe account
        if ( $stripe_account_id && $client_id && $secret_key ) {
            wp_remote_post(
                'https://connect.stripe.com/oauth/deauthorize',
                array(
                    'headers' => array(
                        'Authorization' => 'Bearer ' . $secret_key,
                    ),
                    'body'    => array(
                        'client_id'      => $client_id,
                        'stripe_user_id' => $stripe_account_id,
                    ),
                )
            );
        }

        $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'] );

        wp_send_json_success(
            array(
				'message' => __( 'Stripe account disconnected successfully.', 'multivendorx' ),
            )
        );

        wp_redirect( $this->get_redirect_url( '', '' ) );
        exit;
    }

    /**
     * Get proper redirect URL for dashboard
     *
     * @param string $type Type.
     * @param string $value Value.
     *
     * @return string
     */
    private function get_redirect_url( $type, $value ) {
        $dashboard_page_id = (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' );
        if ( get_option( Utill::WORDPRESS_SETTINGS['permalink'] ) ) {
            $dashboard_slug = $dashboard_page_id
                ? get_post_field( 'post_name', $dashboard_page_id )
                : 'dashboard';

            $base_url = site_url( '/' . $dashboard_slug ) . '/settings#subtab=payout';
        } else {
            $base_url = site_url(
                add_query_arg(
                    array(
                        'page_id' => $dashboard_page_id,
                        'segment' => 'settings',
                    ),
                    ''
                )
            ) . '#subtab=payout';
        }

        if ( 'connected' === $type ) {
            return add_query_arg( 'connected', $value, $base_url );
        } elseif ( 'error' === $type ) {
            return add_query_arg( 'error', $value, $base_url );
        }
        return $base_url;
    }

    /**
     * Create transfer
     *
     * @param int    $amount Amount in cents.
     * @param string $destination Stripe account ID.
     * @param int    $order_id Order ID.
     *
     * @return array|false
     */
    public function create_transfer( $amount, $destination, $order_id ) {

        $transfer_data = array(
            'amount'         => $amount * 100,
            'currency'       => get_woocommerce_currency(),
            'destination'    => $destination,
            'transfer_group' => $order_id,
        );

        $transfer = $this->make_stripe_api_call(
            'https://api.stripe.com/v1/transfers',
            $transfer_data,
            'POST'
        );

        return $transfer;
    }


    /**
     * Make Stripe API call using WordPress HTTP API
     *
     * @param string $url URL.
     * @param array  $data Data.
     * @param string $method Method.
     *
     * @return array|false
     */
    private function make_stripe_api_call( $url, $data = array(), $method = 'POST' ) {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();
        $mode                   = $stripe_settings['payment_mode'] ?? 'test';
        $secret_key             = $mode === 'test' ? $stripe_settings['test_secret_key'] : $stripe_settings['live_secret_key'] ?? '';

        if ( empty( $secret_key ) ) {
            return false;
        }
        $args = array(
            'method'  => $method,
            'headers' => array(
                'Authorization'  => 'Bearer ' . $secret_key,
                'Content-Type'   => 'application/x-www-form-urlencoded',
                'Stripe-Version' => '2025-10-29.clover',
            ),
            'timeout' => 30,
        );

        if ( ( 'POST' === $method || 'PUT' === $method ) && ! empty( $data ) ) {
            $args['body'] = http_build_query( $data );
        }

        $response = wp_remote_request( $url, $args );

        if ( is_wp_error( $response ) ) {
            return false;
        }

        $body             = wp_remote_retrieve_body( $response );
        $decoded_response = json_decode( $body, true );

        return $decoded_response;
    }
}
