<?php

namespace MultiVendorX\Payments\Providers;

defined('ABSPATH') || exit;

class MultiVendorX_PayPal_Payment {
    public function get_id() {
        return 'paypal';
    }

    public function get_settings() {
        return [
            'icon'      => 'PP',
            'id'        => $this->get_id(),
            'label'     => 'PayPal',
            'connected' => false,
            'desc'      => 'Secure global payments with PayPal integration.',
            'formFields' => [
                [
                    'key'   => 'environment',
                    'type'  => 'setting-toggle',
                    'label' => __('Environment', 'multivendorx'),
                    'options' => [
                        ['key' => 'sandbox', 'label' => __('Sandbox', 'multivendorx'), 'value' => 'sandbox'],
                        ['key' => 'live', 'label' => __('Live', 'multivendorx'), 'value' => 'live'],
                    ]
                ],
                [
                    'key'         => 'client_id',
                    'type'        => 'text',
                    'label'       => 'Client ID',
                    'placeholder' => 'Enter Client ID',
                ],
                [
                    'key'         => 'secret',
                    'type'        => 'password',
                    'label'       => 'Secret Key',
                    'placeholder' => 'Enter Secret Key',
                ]
            ]
        ];
    }
}
