<?php

namespace MultiVendorX\StripeConnect;

use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Transfer;

defined('ABSPATH') || exit;

class Payment
{
    public function __construct()
    {
        add_action('multivendorx_process_stripe-connect_payment', array($this, 'process_payment'), 10, 4);
        $this->init_stripe();
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

    public function get_id()
    {
        return 'stripe-connect';
    }

    public function get_settings()
    {
        return [
            'icon'      => 'ST',
            'id'        => $this->get_id(),
            'label'     => 'Stripe Connect',
            'enableOption' => true,
            'desc'      => 'Full marketplace solution with instant payouts, comprehensive dispute handling, and global coverage. Best for established marketplaces.',
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
                    'key'         => 'api_key',
                    'type'        => 'text',
                    'label'       => 'API Key',
                    'placeholder' => 'Enter API Key',
                ],
                [
                    'key'         => 'secret_key',
                    'type'        => 'password',
                    'label'       => 'Secret Key',
                    'placeholder' => 'Enter Secret Key',
                ]
            ]
        ];
    }

    public function get_store_payment_settings()
    {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = !empty($payment_admin_settings['stripe-connect']) ? $payment_admin_settings['stripe-connect'] : [];

        if ($stripe_settings && $stripe_settings['enable']) {
            $vendor_id = get_current_user_id();
            $stripe_account_id = get_user_meta($vendor_id, '_stripe_connect_account_id', true);
            $onboarding_status = 'Not Onboarded';

            if ($stripe_account_id) {
                $account = $this->get_account($stripe_account_id);
                if ($account && $account->charges_enabled) {
                    $onboarding_status = 'Onboarded';
                }
            }

            ob_start();
            ?>
            <div class="mvx-stripe-connect-onboarding">
                <p><strong><?php echo __('Onboarding Status:', 'multivendorx'); ?></strong> <?php echo $onboarding_status; ?></p>
                <a href="<?php echo esc_url(add_query_arg(['action' => 'multivendorx_stripe_connect_onboard'], admin_url('admin.php?page=mvx-settings&tab=payment'))); ?>" class="button button-primary">
                    <?php echo __('Onboard to collect payments', 'multivendorx'); ?>
                </a>
            </div>
            <?php
            $html = ob_get_clean();

            return [
                'id'    => $this->get_id(),
                'label' => __('Stripe Connect', 'multivendorx'),
                'fields' => [
                    [
                        'type'  => 'html',
                        'html'  => $html
                    ]
                ]
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

    public function create_account()
    {
        try {
            $account = Account::create([
                'controller' => [
                    'fees' => [
                        'payer' => 'application',
                    ],
                    'losses' => [
                        'payments' => 'application',
                    ],
                    'stripe_dashboard' => [
                        'type' => 'express',
                    ],
                ],
            ]);
            return $account;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function get_account($account_id)
    {
        try {
            $account = Account::retrieve($account_id);
            return $account;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function create_account_link($account_id)
    {
        try {
            $account_link = AccountLink::create([
                'account' => $account_id,
                'refresh_url' => admin_url('admin.php?page=mvx-settings&tab=payment'),
                'return_url' => admin_url('admin.php?page=mvx-settings&tab=payment'),
                'type' => 'account_onboarding',
            ]);
            return $account_link;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function create_transfer($amount, $destination, $order_id)
    {
        try {
            $transfer = Transfer::create([
                'amount' => $amount * 100,
                'currency' => 'usd',
                'destination' => $destination,
                'transfer_group' => $order_id,
            ]);
            return $transfer;
        } catch (\Exception $e) {
            return null;
        }
    }
}
