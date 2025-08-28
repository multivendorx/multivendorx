<?php

namespace MultiVendorX\Payments\Providers;

defined('ABSPATH') || exit;

class MultiVendorX_Stripe_Payment {
    public function get_id() {
        return 'stripe';
    }

    public function get_settings() {
        return [
            'icon'      => 'ST',
            'id'        => $this->get_id(),
            'label'     => 'Stripe Connect',
            'connected' => true,
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
}
