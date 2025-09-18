<?php

namespace MultiVendorX\StripeConnect;

use Stripe\Stripe;
use Stripe\Account;
use Stripe\Transfer;

defined('ABSPATH') || exit;

class Payment
{
    public function __construct()
    {
        add_action('multivendorx_process_stripe-connect_payment', [$this, 'process_payment'], 10, 4);
        $this->init_stripe();
    
        // Register AJAX
        add_action('wp_ajax_create_stripe_account', [$this, 'ajax_create_account']);
        add_action('wp_ajax_disconnect_stripe_account', [$this, 'ajax_disconnect_account']);
    
        // Use admin_post endpoint for OAuth callback (works whether user is logged-in or not)
        add_action('admin_post_multivendorx_stripe_oauth_callback', [$this, 'handle_oauth_callback']);

    }    
    
    public function ajax_create_account() {
        if (!is_user_logged_in()) {
            wp_send_json_error(['message' => __('You must be logged in.', 'multivendorx')]);
        }
    
        $vendor_id = get_current_user_id();
    
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = $payment_admin_settings['stripe-connect'] ?? [];
        $client_id = $stripe_settings['client_id'] ?? '';
    
        if (empty($client_id)) {
            wp_send_json_error(['message' => __('Stripe Client ID not configured.', 'multivendorx')]);
        }
    
        // ✅ Use admin-post.php as redirect
        $redirect_uri = admin_url('admin-post.php?action=multivendorx_stripe_oauth_callback');
    
        $state = wp_generate_password(24, false, false);
        set_transient('mvx_stripe_oauth_state_' . $state, $vendor_id, 5 * MINUTE_IN_SECONDS);
    
        $onboarding_url = add_query_arg([
            'response_type' => 'code',
            'client_id'     => $client_id,
            'scope'         => 'read_write',
            'redirect_uri'  => $redirect_uri,
            'state'         => $state,
        ], 'https://connect.stripe.com/oauth/authorize');
    
        wp_send_json_success([
            'message'        => __('Redirecting to Stripe onboarding...', 'multivendorx'),
            'onboarding_url' => $onboarding_url,
        ]);
    }
    
    public function handle_oauth_callback() {
        
        if (!isset($_GET['code'], $_GET['state'])) {
            wp_safe_redirect(home_url('/?dashboard=1&tab=payments&subtab=withdrawl&error=stripe_oauth'));
            exit;
        }
    
        $state = sanitize_text_field($_GET['state']);
        $vendor_id = get_transient('mvx_stripe_oauth_state_' . $state);
        delete_transient('mvx_stripe_oauth_state_' . $state);

        if (empty($vendor_id)) {
            wp_die(__('Invalid or expired OAuth state.', 'multivendorx'));
        }
    
        $code = sanitize_text_field($_GET['code']);
        
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = $payment_admin_settings['stripe-connect'] ?? [];
        $secret_key = $stripe_settings['secret_key'] ?? '';
        $client_id  = $stripe_settings['client_id'] ?? '';
    
        // ✅ Use Stripe SDK for token exchange
        try {
            \Stripe\Stripe::setApiKey($secret_key);
    
            $resp = \Stripe\OAuth::token([
                'grant_type' => 'authorization_code',
                'code'       => $code,
            ]);

            if (!empty($resp->stripe_user_id)) {
                update_user_meta($vendor_id, '_stripe_connect_account_id', sanitize_text_field($resp->stripe_user_id));
                update_user_meta($vendor_id, '_vendor_payment_mode', 'stripe-connect');
                update_user_meta($vendor_id, 'vendor_connected', 1);
                update_user_meta($vendor_id, 'admin_client_id', $client_id);
    
                if (!empty($resp->access_token)) {
                    update_user_meta($vendor_id, 'access_token', sanitize_text_field($resp->access_token));
                }
                if (!empty($resp->refresh_token)) {
                    update_user_meta($vendor_id, 'refresh_token', sanitize_text_field($resp->refresh_token));
                }
                if (!empty($resp->stripe_publishable_key)) {
                    update_user_meta($vendor_id, 'stripe_publishable_key', sanitize_text_field($resp->stripe_publishable_key));
                }
                wp_safe_redirect(add_query_arg('connected', 'stripe', home_url('/?dashboard=1&tab=payments&subtab=withdrawl')));
                exit;
            }
    
            wp_safe_redirect(add_query_arg('error', 'stripe_connection_failed', home_url('/?dashboard=1&tab=payments&subtab=withdrawl')));
            exit;
    
        } catch (\Stripe\Exception\ApiErrorException $e) {
            wp_safe_redirect(add_query_arg('error', 'stripe_sdk_error', home_url('/?dashboard=1&tab=payments&subtab=withdrawl')));
            exit;
        }
    }
        
    
    public function ajax_disconnect_account() {
        if (!is_user_logged_in()) {
            wp_send_json_error(['message' => __('You must be logged in.', 'multivendorx')]);
        }
    
        $vendor_id = get_current_user_id();
        delete_user_meta($vendor_id, '_stripe_connect_account_id');
        wp_send_json_success(['message' => __('Your Stripe account has been disconnected.', 'multivendorx')]);
    }
    
    
    public function init_stripe() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = !empty($payment_admin_settings['stripe-connect']) ? $payment_admin_settings['stripe-connect'] : [];

        if ($stripe_settings && $stripe_settings['enable']) {
            $secret_key = $stripe_settings['secret_key'];
            Stripe::setApiKey($secret_key);
            Stripe::setApiVersion('2025-08-27.basil');
        }
    }

    public function get_id() {
        return 'stripe-connect';
    }

    public function get_settings() {
        return [
            'icon'      => 'ST',
            'id'        => $this->get_id(),
            'label'     => 'Stripe Connect',
            'enableOption' => true,
            'desc'      => __('Marketplace payouts via Stripe Connect (OAuth).', 'multivendorx'),
            'formFields' => [
                [
                    'key'   => 'payment_mode',
                    'type'  => 'setting-toggle',
                    'label' => __('Payment Mode', 'multivendorx'),
                    'options' => [
                        ['key' => 'test', 'label' => __('Test', 'multivendorx'), 'value' => 'test'],
                        ['key' => 'live', 'label' => __('Live', 'multivendorx'), 'value' => 'live'],
                    ]
                ],
                [
                    'key'         => 'client_id',
                    'type'        => 'text',
                    'label'       => __('Stripe Client ID', 'multivendorx'),
                    'placeholder' => __('Enter Stripe Client ID', 'multivendorx'),
                ],
                [
                    'key'         => 'secret_key',
                    'type'        => 'password',
                    'label'       => __('Secret Key', 'multivendorx'),
                    'placeholder' => __('Enter Secret Key', 'multivendorx'),
                ]
            ]
        ];
    }

    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = $payment_admin_settings['stripe-connect'] ?? [];
    
        if ($stripe_settings && $stripe_settings['enable']) {
            $vendor_id = get_current_user_id();
            $stripe_account_id = get_user_meta($vendor_id, '_stripe_connect_account_id', true);
            $onboarding_status = 'Not Connected';
            $is_onboarded = false;
    
            if ($stripe_account_id) {
                $account = $this->get_account($stripe_account_id);
                if ($account) {
                    if ($account->charges_enabled) {
                        $onboarding_status = 'Connected';
                        $is_onboarded = true;
                    } else {
                        $onboarding_status = 'Connected – Verification Required';
                    }
                }
            }            
    
            $fields = [
                [
                    'type' => 'html',
                    'html' => '<p><strong>' . __('Stripe Status:', 'multivendorx') . '</strong> ' . $onboarding_status . '</p>',
                ],
            ];
    
            if ($is_onboarded) {
                $fields[] = [
                    'type'  => 'button',
                    'key'   => 'disconnect_account',
                    'label' => __('Disconnect Stripe Account', 'multivendorx'),
                    'action'=> 'disconnect_stripe_account',
                ];
            } else {
                $fields[] = [
                    'type'  => 'button',
                    'key'   => 'create_account',
                    'label' => __('Connect with Stripe', 'multivendorx'),
                    'action'=> 'create_stripe_account',
                ];
            }
    
            return [
                'id'    => $this->get_id(),
                'label' => __('Stripe Connect', 'multivendorx'),
                'fields'=> $fields,
            ];
        }
    }    

    public function process_payment($store_id, $amount, $order_id = null, $transaction_id = null)
    {
        $stripe_account_id = get_user_meta($store_id, '_stripe_connect_account_id', true);
        if (!$stripe_account_id) {
            return [
                'success' => false,
                'message' => __('Vendor is not connected to Stripe.', 'multivendorx')
            ];
        }

        $transfer = $this->create_transfer($amount, $stripe_account_id, $order_id);

        if ($transfer) {
            do_action('multivendorx_after_payment_complete', $store_id, 'Stripe Connect', 'success', $order_id, $transaction_id);
            return [
                'success'  => true,
                'message'  => __('Payout successful', 'multivendorx'),
                'response' => $transfer
            ];
        } else {
            return [
                'success' => false,
                'message' => __('Could not create transfer.', 'multivendorx')
            ];
        }
    }

    public function update_account($account_id, $data) {
        try {
            $account = Account::update($account_id, $data);
            return $account;
        } catch (\Exception $e) {
            error_log('Stripe Account Update Error: ' . $e->getMessage());
            return null;
        }
    }

    public function get_account($account_id) {
        try {
            return Account::retrieve($account_id);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function create_transfer($amount, $destination, $order_id) {
        try {
            return Transfer::create([
                'amount' => $amount * 100,
                'currency' => 'usd',
                'destination' => $destination,
                'transfer_group' => $order_id,
            ]);
        } catch (\Exception $e) {
            error_log('Stripe Transfer Error: ' . $e->getMessage());
            return null;
        }
    }
}
