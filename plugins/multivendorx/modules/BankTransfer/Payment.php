<?php

namespace MultiVendorX\BankTransfer;

defined('ABSPATH') || exit;

use MultiVendorX\Store\Store;


class Payment {
    public function __construct(){
        add_action('multivendorx_process_bank-transfer_payment', array($this, 'process_payment'), 10, 4);
    }

    public function get_id() {
        return 'bank-transfer';
    }

    public function get_settings() {
        return [
            'icon'      => 'BB',
            'id'        => $this->get_id(),
            'label'     => 'Bank Transfer',
            'enableOption' => true,
            'desc'      => 'Bank transfer',
            'formFields' => [
                [
                    'key'         => 'bank_name',
                    'type'        => 'text',
                    'label'       => 'Bank Name',
                    'placeholder' => 'Enter Bank Name',
                ],
                [
                    'key'         => 'abr_routing_number',
                    'type'        => 'text',
                    'label'       => 'ABA Routing Number',
                    'placeholder' => 'Enter ABA Routing Number',
                ],
                [
                    'key'         => 'destination_currency',
                    'type'        => 'text',
                    'label'       => 'Destination Currency',
                    'placeholder' => 'Enter Destination Currency',
                ],
                [
                    'key'         => 'bank_address',
                    'type'        => 'text-area',
                    'label'       => 'Bank Address',
                    'placeholder' => 'Enter Bank Address',
                ],
                [
                    'key'         => 'iban',
                    'type'        => 'text',
                    'label'       => 'IBAN',
                    'placeholder' => 'Enter IBAN',
                ],
                [
                    'key'         => 'account_holder_name',
                    'type'        => 'text',
                    'label'       => 'Account Holder Name',
                    'placeholder' => 'Enter Account Holder Name',
                ],
                [
                    'key'         => 'account_number',
                    'type'        => 'text',
                    'label'       => 'Account Number',
                    'placeholder' => 'Enter Account Number',
                ]
            ]
        ];
    }

    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );

        $settings = !empty($payment_admin_settings['bank-transfer']) ? $payment_admin_settings['bank-transfer'] : [];
        
        if ($settings && $settings['enable']) {
            return [
                'id'    => $this->get_id(),
                'label' => __('Bank Transfer', 'multivendorx'),
                'fields' => [
                    'key'   => 'account_type',
                    'type'  => 'setting-toggle',
                    'label' => __('Account type', 'multivendorx'),
                    'options' => [
                        ['key' => 'current', 'label' => __('current', 'multivendorx'), 'value' => 'current'],
                        ['key' => 'savings', 'label' => __('Savings', 'multivendorx'), 'value' => 'savings'],
                    ]
                ],
                [
                    'key'         => 'bank_name',
                    'type'        => 'text',
                    'label'       => 'Bank Name',
                    'placeholder' => 'Enter Bank Name',
                ],
                [
                    'key'         => 'abr_routing_number',
                    'type'        => 'text',
                    'label'       => 'ABA Routing Number',
                    'placeholder' => 'Enter ABA Routing Number',
                ],
                [
                    'key'         => 'destination currency',
                    'type'        => 'text',
                    'label'       => 'Destination Currency',
                    'placeholder' => 'Enter Destination Currency',
                ],
                [
                    'key'         => 'bank_address',
                    'type'        => 'text-area',
                    'label'       => 'Bank Address',
                    'placeholder' => 'Enter Bank Address',
                ],
                [
                    'key'         => 'iban',
                    'type'        => 'text',
                    'label'       => 'IBAN',
                    'placeholder' => 'Enter IBAN',
                ],
                [
                    'key'         => 'account_holder_name',
                    'type'        => 'text',
                    'label'       => 'Account Holder Name',
                    'placeholder' => 'Enter Account Holder Name',
                ],
                [
                    'key'         => 'account_number',
                    'type'        => 'text',
                    'label'       => 'Account Number',
                    'placeholder' => 'Enter Account Number',
                ]
            ];
        }

    }

    public function process_payment($store_id, $amount, $order_id = null, $transaction_id = null) {

        // quick autoload/class check (helps debugging)
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );
        $store   = new Store( $store_id );

        $status ='success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            'Bank Transfer',
            $status,
            $order_id, 
            $transaction_id
        );

        
    }

}

