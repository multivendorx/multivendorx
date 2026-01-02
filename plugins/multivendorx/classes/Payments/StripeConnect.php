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

        // Use admin_post endpoint for OAuth callback.
        add_action( 'admin_post_multivendorx_stripe_oauth_callback', array( $this, 'handle_oauth_callback' ) );
        
        // Add webhook handler
        add_action( 'woocommerce_api_multivendorx_stripe_webhook', array( $this, 'handle_webhook' ) );
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
            'icon'         => 'adminlib-stripe-connect',
            'id'           => $this->get_id(),
            'label'        => 'Stripe Connect',
            'enableOption' => true,
            'desc'         => __( 'Marketplace payouts via Stripe Connect (OAuth).', 'multivendorx' ),
            'disableBtn'   => true,
            'formFields'   => array(
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
                ),
                array(
                    'key'         => 'live_client_id',
                    'type'        => 'text',
                    'label'       => __( 'Stripe client ID', 'multivendorx' ),
                    'placeholder' => __( 'Enter Stripe Client ID', 'multivendorx' ),
                ),
                array(
                    'key'         => 'test_secret_key',
                    'type'        => 'text',
                    'label'       => __( 'Secret key', 'multivendorx' ),
                    'placeholder' => __( 'Enter secret key ', 'multivendorx' ),
                ),
                array(
                    'key'         => 'live_secret_key',
                    'type'        => 'text',
                    'label'       => __( 'Secret key', 'multivendorx' ),
                    'placeholder' => __( 'Enter secret key', 'multivendorx' ),
                ),
                array(
                    'key'         => 'test_publishable_key',
                    'type'        => 'text',
                    'label'       => __( 'Publishable key', 'multivendorx' ),
                    'placeholder' => __( 'Enter publishable key', 'multivendorx' ),
                ),
                array(
                    'key'         => 'live_publishable_key',
                    'type'        => 'text',
                    'label'       => __( 'Publishable key', 'multivendorx' ),
                    'placeholder' => __( 'Enter publishable key', 'multivendorx' ),
                ),
                array(
                    'key'   => 'redirect_url',
                    'type'  => 'copy-text',
                    'label' => __( 'Redirect url', 'multivendorx' ),
                    'title' => $redirect_url,
                    'desc'  => __( 'Copy this URL and add it to your Stripe dashboard as a redirect URL.', 'multivendorx' ),
                ),
                array(
                    'key'     => 'onboarding_flow',
                    'type'    => 'setting-toggle',
                    'label'   => __( 'Onboarding Flow', 'multivendorx' ),
                    'options' => array(
                        array(
                            'key'   => 'hosted',
                            'label' => __( 'Hosted', 'multivendorx' ),
                            'value' => 'hosted',
                        ),
                        array(
                            'key'   => 'embedded',
                            'label' => __( 'Embedded', 'multivendorx' ),
                            'value' => 'embedded',
                        ),
                    ),
                    'default' => 'hosted',
                ),
                array(
                    'key'     => 'dashboard_access',
                    'type'    => 'setting-toggle',
                    'label'   => __( 'Dashboard Access', 'multivendorx' ),
                    'options' => array(
                        array(
                            'key'   => 'standard',
                            'label' => __( 'Stripe', 'multivendorx' ),
                            'value' => 'standard',
                        ),
                        array(
                            'key'   => 'express',
                            'label' => __( 'Express', 'multivendorx' ),
                            'value' => 'express',
                        ),
                        array(
                            'key'   => 'none',
                            'label' => __( 'None', 'multivendorx' ),
                            'value' => 'none',
                        ),
                    ),
                    'default' => 'express',
                ),
                array(
                    'key'     => 'charge_type',
                    'type'    => 'setting-toggle',
                    'label'   => __( 'Charge Type', 'multivendorx' ),
                    'options' => array(
                        array(
                            'key'   => 'direct',
                            'label' => __( 'Direct', 'multivendorx' ),
                            'value' => 'direct',
                        ),
                        array(
                            'key'   => 'destination',
                            'label' => __( 'Destination', 'multivendorx' ),
                            'value' => 'destination',
                        ),
                        array(
                            'key'   => 'separate',
                            'label' => __( 'Separate charges and transfers', 'multivendorx' ),
                            'value' => 'separate',
                        ),
                    ),
                    'default' => 'destination',
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
            $store_id = get_user_meta( get_current_user_id(), Utill::USER_SETTINGS_KEYS['active_store'], true );

            $store             = new Store( $store_id );
            $stripe_account_id = $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'] );
            $account_type      = $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_type'] ) ?: 'new';
            $onboarding_status = $stripe_account_id ? 'Connected' : 'Not Connected';
            $badge_class       = $stripe_account_id ? 'green' : 'red';
            
            $fields = array();

            // Account type selection
            $fields[] = array(
                'type'    => 'setting-toggle',
                'key'     => 'stripe_account_type',
                'name'    => 'stripe_account_type',
                'label'   => __( 'Account Type', 'multivendorx' ),
                'options' => array(
                    array(
                        'key'   => 'new',
                        'label' => __( 'Create New Account', 'multivendorx' ),
                        'value' => 'new',
                    ),
                    array(
                        'key'   => 'existing',
                        'label' => __( 'Connect Existing Account', 'multivendorx' ),
                        'value' => 'existing',
                    ),
                ),
                'default' => $account_type,
            );

            // Status message
            $status_html = '<div class="form-group">';
            $status_html .= '<label>' . __( 'Stripe Status:', 'multivendorx' ) . ' <span class="admin-badge ' . $badge_class . '">' . $onboarding_status . '</span></label>';
            
            if ( $stripe_account_id ) {
                $status_html .= '<p><small>' . sprintf( __( 'Account ID: %s', 'multivendorx' ), esc_html( $stripe_account_id ) ) . '</small></p>';
            }
            
            if ( $stripe_account_id && $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_onboarding_status'] ) !== 'complete' ) {
                $status_html .= '<p><small style="color:orange;">' . __( 'Onboarding incomplete - please complete setup', 'multivendorx' ) . '</small></p>';
            }
            
            $status_html .= '</div>';
            
            $fields[] = array(
                'type' => 'html',
                'html' => $status_html,
            );

            // Onboarding section
            $onboarding_flow = $stripe_settings['onboarding_flow'] ?? 'hosted';
            $onboarding_html = $this->get_onboarding_html( $store_id, $stripe_account_id, $onboarding_flow, $account_type );
            
            if ( $onboarding_html ) {
                $fields[] = array(
                    'type' => 'html',
                    'html' => $onboarding_html,
                );
            }

            // Toggle script
            $fields[] = array(
                'type' => 'html',
                'html' => $this->get_toggle_script( $store_id ),
            );

            return array(
                'id'     => $this->get_id(),
                'label'  => __( 'Stripe Connect', 'multivendorx' ),
                'fields' => $fields,
            );
        }
    }

    /**
     * Get onboarding HTML
     */
    private function get_onboarding_html( $store_id, $stripe_account_id, $onboarding_flow, $account_type ) {
        $html = '';
        
        if ( $account_type === 'existing' && ! $stripe_account_id ) {
            // OAuth for existing accounts
            $oauth_url = wp_nonce_url(
                admin_url( 'admin-post.php?action=multivendorx_stripe_connect_oauth' ),
                'multivendorx_stripe_connect_oauth_nonce'
            );
            
            $html .= '<div class="stripe-oauth-section" style="display:none;">';
            $html .= '<div style="padding:15px; background:#f9f9f9; border-radius:4px; margin-top:10px;">';
            $html .= '<p>' . __( 'Connect your existing Stripe account using OAuth. You will be redirected to Stripe to authorize the connection.', 'multivendorx' ) . '</p>';
            $html .= sprintf(
                '<a href="%s" class="button button-primary">%s</a>',
                esc_url( $oauth_url ),
                __( 'Connect Existing Stripe Account', 'multivendorx' )
            );
            $html .= '</div>';
            $html .= '</div>';
        } elseif ( $account_type === 'new' && ( ! $stripe_account_id || $onboarding_flow === 'hosted' ) ) {
            // Hosted onboarding for new accounts
            $onboard_url = $this->get_onboarding_url( $store_id, $stripe_account_id );
            
            if ( $onboard_url ) {
                $html .= '<div class="stripe-onboarding-section">';
                $html .= sprintf(
                    '<a href="%s" target="_blank" class="button button-primary">%s</a>',
                    esc_url( $onboard_url ),
                    $stripe_account_id ? __( 'Continue Stripe Setup', 'multivendorx' ) : __( 'Connect with Stripe', 'multivendorx' )
                );
                $html .= '</div>';
            }
        } elseif ( $account_type === 'new' && $onboarding_flow === 'embedded' && ! $stripe_account_id ) {
            // Embedded onboarding for new accounts
            $embedded_data = $this->get_embedded_onboarding_data( $store_id );
            
            if ( $embedded_data && ! empty( $embedded_data['client_secret'] ) ) {
                $html .= '<div class="stripe-embedded-section">';
                $html .= '<div id="stripe-embedded-onboarding-container" style="width:100%;height:700px;border:1px solid #ddd;"></div>';
                $html .= '<script type="text/javascript">';
                $html .= 'jQuery(document).ready(function($) {';
                $html .= 'if (typeof Stripe !== "undefined") {';
                $html .= 'var stripe = Stripe("' . esc_js( $this->get_publishable_key() ) . '");';
                $html .= 'stripe.initEmbeddedOnboarding({';
                $html .= 'clientSecret: "' . esc_js( $embedded_data['client_secret'] ) . '",';
                $html .= 'onComplete: function() {';
                $html .= 'window.location.reload();';
                $html .= '}';
                $html .= '});';
                $html .= '}';
                $html .= '});';
                $html .= '</script>';
                $html .= '</div>';
            }
        }

        return $html;
    }

    /**
     * Get toggle script for account type
     */
    private function get_toggle_script( $store_id ) {
        $nonce = wp_create_nonce( 'stripe_account_type_nonce' );
        
        $script = '
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            function handleAccountTypeToggle() {
                var selectedValue = $(\'input[name="stripe_account_type"]:checked\').val();
                var oauthSection = $(\'.stripe-oauth-section\');
                var onboardingSection = $(\'.stripe-onboarding-section\');
                var embeddedSection = $(\'.stripe-embedded-section\');
                
                oauthSection.hide();
                onboardingSection.hide();
                embeddedSection.hide();
                
                if (selectedValue === "existing") {
                    oauthSection.show();
                } else {
                    if (onboardingSection.length) {
                        onboardingSection.show();
                    }
                    if (embeddedSection.length) {
                        embeddedSection.show();
                    }
                }
                
                // Save the selection via AJAX
                $.ajax({
                    url: "' . admin_url( 'admin-ajax.php' ) . '",
                    type: "POST",
                    data: {
                        action: "save_stripe_account_type",
                        store_id: ' . $store_id . ',
                        account_type: selectedValue,
                        nonce: "' . $nonce . '"
                    }
                });
            }
            
            $(\'input[name="stripe_account_type"]\').on(\'change\', handleAccountTypeToggle);
            handleAccountTypeToggle(); // Initial call
        });
        </script>';
        
        return $script;
    }

    /**
     * Get onboarding URL
     */
    private function get_onboarding_url( $store_id, $stripe_account_id = '' ) {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();
        $mode                   = $stripe_settings['payment_mode'] ?? 'test';
        $client_id              = $mode === 'test' ? $stripe_settings['test_client_id'] : $stripe_settings['live_client_id'] ?? '';
        
        if ( empty( $client_id ) ) {
            return false;
        }

        $redirect_uri = admin_url( 'admin-post.php?action=multivendorx_stripe_oauth_callback' );
        $state        = wp_generate_password( 24, false, false );

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

        $params = array(
            'response_type' => 'code',
            'client_id'     => $client_id,
            'scope'         => 'read_write',
            'redirect_uri'  => $redirect_uri,
            'state'         => $state,
        );

        if ( ! empty( $stripe_account_id ) ) {
            $params['stripe_user'] = $stripe_account_id;
        }

        return add_query_arg( $params, 'https://connect.stripe.com/oauth/authorize' );
    }

    /**
     * Get embedded onboarding data
     */
    private function get_embedded_onboarding_data( $store_id ) {
        // For embedded onboarding, we need to create an Account Session via Stripe API
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();
        $mode                   = $stripe_settings['payment_mode'] ?? 'test';
        $secret_key             = $mode === 'test' ? $stripe_settings['test_secret_key'] : $stripe_settings['live_secret_key'] ?? '';
        
        if ( empty( $secret_key ) ) {
            return false;
        }

        $store = new Store( $store_id );
        $stripe_account_id = $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'] );

        if ( ! $stripe_account_id ) {
            // Create new account
            $account_response = $this->make_stripe_api_call(
                'https://api.stripe.com/v1/accounts',
                array(
                    'type' => 'express',
                    'capabilities[card_payments][requested]' => 'true',
                    'capabilities[transfers][requested]' => 'true',
                ),
                'POST'
            );

            if ( $account_response && isset( $account_response['id'] ) ) {
                $stripe_account_id = $account_response['id'];
                $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'], $stripe_account_id );
                $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_type'], 'new' );
            }
        }

        if ( $stripe_account_id ) {
            // Create Account Session
            $session_response = $this->make_stripe_api_call(
                'https://api.stripe.com/v1/account_sessions',
                array(
                    'account' => $stripe_account_id,
                    'components[account_onboarding][enabled]' => 'true',
                ),
                'POST'
            );

            if ( $session_response && isset( $session_response['client_secret'] ) ) {
                return array(
                    'account_id'    => $stripe_account_id,
                    'client_secret' => $session_response['client_secret'],
                );
            }
        }

        return false;
    }

    /**
     * Get publishable key
     */
    private function get_publishable_key() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();
        $mode                   = $stripe_settings['payment_mode'] ?? 'test';
        
        return $mode === 'test' ? ( $stripe_settings['test_publishable_key'] ?? '' ) : ( $stripe_settings['live_publishable_key'] ?? '' );
    }

    /**
     * Handle OAuth connection for existing accounts
     */
    public function handle_oauth_connection() {
        if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], 'multivendorx_stripe_connect_oauth_nonce' ) ) {
            wp_die( __( 'Security check failed', 'multivendorx' ) );
        }

        $store_id = get_user_meta( get_current_user_id(), Utill::USER_SETTINGS_KEYS['active_store'], true );
        $store    = new Store( $store_id );
        
        // Store account type as existing
        $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_type'], 'existing' );

        $oauth_url = $this->get_onboarding_url( $store_id );
        
        if ( $oauth_url ) {
            wp_redirect( $oauth_url );
            exit;
        } else {
            wp_die( __( 'Could not generate OAuth URL', 'multivendorx' ) );
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
        $store_id = get_user_meta( get_current_user_id(), Utill::USER_SETTINGS_KEYS['active_store'], true );
        
        // Set account type as new
        $store = new Store( $store_id );
        $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_type'], 'new' );

        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings        = $payment_admin_settings['stripe-connect'] ?? array();
        $mode                   = $stripe_settings['payment_mode'] ?? 'test';
        $client_id              = $mode === 'test' ? $stripe_settings['test_client_id'] : $stripe_settings['live_client_id'] ?? '';

        if ( empty( $client_id ) ) {
            wp_send_json_error( array( 'message' => __( 'Stripe Client ID not configured.', 'multivendorx' ) ) );
        }

        $onboarding_url = $this->get_onboarding_url( $store_id );

        if ( $onboarding_url ) {
            wp_send_json_success(
                array(
                    'message'        => __( 'Redirecting to Stripe onboarding...', 'multivendorx' ),
                    'onboarding_url' => $onboarding_url,
                )
            );
        } else {
            wp_send_json_error( array( 'message' => __( 'Could not generate onboarding URL.', 'multivendorx' ) ) );
        }
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

        $store_id = get_user_meta( get_current_user_id(), Utill::USER_SETTINGS_KEYS['active_store'], true );
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

        if ( $response && ! empty( $response['stripe_user_id'] ) ) {
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'], sanitize_text_field( $response['stripe_user_id'] ) );
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_onboarding_status'], 'complete' );
            
            // Save additional OAuth data
            if ( isset( $response['access_token'] ) ) {
                $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_access_token'], $response['access_token'] );
            }
            if ( isset( $response['refresh_token'] ) ) {
                $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_refresh_token'], $response['refresh_token'] );
            }
            if ( isset( $response['stripe_publishable_key'] ) ) {
                $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_publishable_key'], $response['stripe_publishable_key'] );
            }
            
            // Success.
            wp_safe_redirect( $this->get_redirect_url( 'success', 'connected' ) );
            exit;
        } else {
            wp_safe_redirect( $this->get_redirect_url( 'error', 'stripe_connection_failed' ) );
            exit;
        }
    }

    /**
     * Disconnect Stripe account
     */
    public function ajax_disconnect_account() {
        $store_id = get_user_meta( get_current_user_id(), Utill::USER_SETTINGS_KEYS['active_store'], true );
        $store    = new Store( $store_id );

        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $stripe_settings = $payment_admin_settings['stripe-connect'] ?? array();

        $mode       = $stripe_settings['payment_mode'] ?? 'test';
        $client_id  = $mode === 'test' ? $stripe_settings['test_client_id'] : $stripe_settings['live_client_id'] ?? '';
        $secret_key = $mode === 'test' ? $stripe_settings['test_secret_key'] : $stripe_settings['live_secret_key'] ?? '';

        $stripe_account_id = $store->get_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'] );

        // Deauthorize Stripe account
        if ( $stripe_account_id && $client_id && $secret_key ) {
            wp_remote_post(
                'https://connect.stripe.com/oauth/deauthorize',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $secret_key,
                    ],
                    'body' => [
                        'client_id'      => $client_id,
                        'stripe_user_id' => $stripe_account_id,
                    ],
                ]
            );
        }

        // Clear all Stripe meta
        $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_id'] );
        $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_type'] );
        $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_onboarding_status'] );
        $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_access_token'] );
        $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_refresh_token'] );
        $store->delete_meta( Utill::STORE_SETTINGS_KEYS['stripe_publishable_key'] );

        wp_send_json_success([
            'message' => __( 'Stripe account disconnected successfully.', 'multivendorx' ),
        ]);
    }

    /**
     * Save account type
     */
    public function ajax_save_account_type() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'stripe_account_type_nonce' ) ) {
            wp_send_json_error( __( 'Security check failed', 'multivendorx' ) );
        }

        $store_id     = isset( $_POST['store_id'] ) ? absint( $_POST['store_id'] ) : 0;
        $account_type = isset( $_POST['account_type'] ) ? sanitize_text_field( $_POST['account_type'] ) : 'new';
        
        if ( ! $store_id ) {
            wp_send_json_error( __( 'Invalid store ID.', 'multivendorx' ) );
        }

        $store = new Store( $store_id );
        $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_account_type'], $account_type );
        
        wp_send_json_success();
    }

    /**
     * Handle webhook events
     */
    public function handle_webhook() {
        $payload = @file_get_contents( 'php://input' );
        $event = json_decode( $payload, true );
        
        if ( ! $event || ! isset( $event['type'] ) ) {
            http_response_code( 400 );
            exit;
        }

        $this->log( "Received webhook event: " . $event['type'] );

        switch ( $event['type'] ) {
            case 'account.updated':
                $this->handle_account_updated( $event['data']['object'] );
                break;
                
            case 'payout.paid':
                $this->handle_payout_paid( $event['data']['object'] );
                break;
        }

        http_response_code( 200 );
        exit;
    }

    /**
     * Handle account updated event
     */
    private function handle_account_updated( $account ) {
        if ( ! isset( $account['id'] ) ) {
            return;
        }

        // Find store by Stripe account ID
        global $wpdb;
        $store_id = $wpdb->get_var( $wpdb->prepare(
            "SELECT store_id FROM {$wpdb->prefix}multivendorx_store_meta 
            WHERE meta_key = %s AND meta_value = %s",
            Utill::STORE_SETTINGS_KEYS['stripe_account_id'],
            $account['id']
        ) );

        if ( $store_id ) {
            $store = new Store( $store_id );
            
            // Update onboarding status
            if ( isset( $account['charges_enabled'] ) && $account['charges_enabled'] ) {
                $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_onboarding_status'], 'complete' );
            } elseif ( isset( $account['details_submitted'] ) && $account['details_submitted'] ) {
                $store->update_meta( Utill::STORE_SETTINGS_KEYS['stripe_onboarding_status'], 'incomplete' );
            }
        }
    }

    /**
     * Handle payout paid event
     */
    private function handle_payout_paid( $payout ) {
        if ( ! isset( $payout['id'] ) || ! isset( $payout['destination'] ) ) {
            return;
        }

        // Find store by Stripe account ID
        global $wpdb;
        $store_id = $wpdb->get_var( $wpdb->prepare(
            "SELECT store_id FROM {$wpdb->prefix}multivendorx_store_meta 
            WHERE meta_key = %s AND meta_value = %s",
            Utill::STORE_SETTINGS_KEYS['stripe_account_id'],
            $payout['destination']
        ) );

        if ( $store_id ) {
            // Update store payout status
            $store = new Store( $store_id );
            $store->update_meta( 'stripe_last_payout_id', $payout['id'] );
            $store->update_meta( 'stripe_last_payout_amount', $payout['amount'] / 100 );
            $store->update_meta( 'stripe_last_payout_date', date( 'Y-m-d H:i:s' ) );
        }
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
        } elseif ( 'success' === $type ) {
            return add_query_arg( 'success', $value, $base_url );
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
        if ( ! $destination ) {
            return false;
        }

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
            $this->log( 'Stripe API error: ' . $response->get_error_message() );
            return false;
        }

        $body             = wp_remote_retrieve_body( $response );
        $decoded_response = json_decode( $body, true );

        return $decoded_response;
    }

    /**
     * Log messages
     */
    private function log( $message ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '[MultiVendorX Stripe] ' . $message );
        }
    }
}