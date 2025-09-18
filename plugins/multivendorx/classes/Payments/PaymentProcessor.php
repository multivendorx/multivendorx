<?php

namespace MultiVendorX\Payments;
use MultiVendorX\Store\Store;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\MultiVendorX;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class PaymentProcessor {
    public function __construct() {
        add_action('multivendorx_after_payment_complete', array( $this, 'after_payment_complete'), 10, 5);
        // add_action('multivendorx_after_real_time_payment_complete', array( $this, 'after_real_time_payment_complete'), 10, 2);
    
        //COD payments.
        add_action('woocommerce_order_status_changed', array($this, 'cod_order_process'), 30, 4);
        
    }

    
    public function process_payment($store_id, $amount, $order_id = null) {
        global $wpdb;
        $store = new Store($store_id);

        if (!$order_id) {
            $withdrawals_fees = MultiVendorX()->setting->get_setting( 'withdrawals_fees', [] );
            $withdrawals_count = (int)$store->get_meta('withdrawals_count');

            if ($withdrawals_fees['free_withdrawals'] < $withdrawals_count) {

                $deduct_amount = (float) $amount * ((float) $withdrawals_fees['withdrawal_percentage'] / 100) + (float) $withdrawals_fees['withdrawal_fixed'];
                $amount = $amount - $deduct_amount;

                $data = [
                    'store_id'         => (int) $store_id,
                    'entry_type'       => 'Dr',
                    'transaction_type' => 'Withdrawal',
                    'amount'           => (float) $deduct_amount,
                    'currency'         => get_woocommerce_currency(),
                    'narration'        => "Withdrawal cost",
                    'status'           => 'Completed',
                ];

                $format = [ "%d", "%s", "%s", "%f", "%s", "%s", "%s" ];

                $wpdb->insert(
                    $wpdb->prefix . Utill::TABLES['transaction'],
                    $data,
                    $format
                );

                $transaction_id = $wpdb->insert_id;
                $store->update_meta('withdrawals_count', $withdrawals_count+1);
            }
        }

        $payment_method = $store->get_meta('payment_method') ?? '';

        if (empty($payment_method)) {
            $data = [
                'store_id'         => (int) $store_id,
                'order_id'         => $order_id,
                'entry_type'       => 'Dr',
                'transaction_type' => 'Withdrawal',
                'amount'           => 0,
                'currency'         => get_woocommerce_currency(),
                'narration'        => "Withdrawal failed because store default payment method not found",
                'status'           => 'Failed',
            ];

            $format = ["%d", "%d", "%s", "%s", "%f", "%s", "%s", "%s"];

            $wpdb->insert(
                $wpdb->prefix . Utill::TABLES['transaction'],
                $data,
                $format
            );

            return;
        }
            
        do_action("multivendorx_process_{$payment_method}_payment", $store_id, $amount, $order_id, $transaction_id);

    }

    public function after_payment_complete($store_id, $method, $status, $order_id, $transaction_id) {
        global $wpdb;

        $order         = $order_id > 0 ? wc_get_order($order_id) : null;
        $commission_id = $order ? $order->get_meta('multivendorx_commission_id', true) : null;
        $commission    = $commission_id ? CommissionUtil::get_commission_db($commission_id) : null;

        $amount = $commission ? (float) $commission->commission_total : 0.00;

        $data = [
            'store_id'         => (int) $store_id,
            'order_id'         => $order_id > 0 ? (int) $order_id : null,
            'commission_id'    => $commission_id ? (int) $commission_id : null,
            'entry_type'       => 'Dr',
            'transaction_type' => 'Withdrawal',
            'amount'           => $amount,
            'currency'         => get_woocommerce_currency(),
            'narration'        => ($status === 'success')
                                    ? "Withdrawal released via {$method} Payment Processor"
                                    : "Withdrawal failed via {$method} Payment Processor",
            'status'           => ($status === 'success') ? 'Completed' : 'Failed',
        ];

        $format = ["%d", "%d", "%d", "%s", "%s", "%f", "%s", "%s", "%s"];

        $wpdb->insert(
            $wpdb->prefix . Utill::TABLES['transaction'],
            $data,
            $format
        );
        if ($status != 'success') {
            $row = $wpdb->get_row(
                        $wpdb->prepare(
                            "SELECT *
                            FROM $wpdb->prefix . Utill::TABLES['transaction']
                            WHERE id = %d",
                            $transaction_id ));

            $wpdb->insert(
                $wpdb->prefix . Utill::TABLES['transaction'],
                [
                    'store_id'        => $row->store_id,
                    'entry_type'      => 'Cr',
                    'transaction_type'=> 'Reversed',
                    'amount'          => $row->amount,
                    'currency'        => $row->currency,
                    'narration'       => 'Transaction Reversed',
                    'status'          => 'Completed',
                ],
                ['%d','%s','%s', '%f','%s','%s', '%s']
            );
        }
    }


    // public function after_real_time_payment_complete($store_id, $order_id) {
    //     global $wpdb;

    //     $order         = $order_id > 0 ? wc_get_order($order_id) : null;
    //     $commission_id = $order ? $order->get_meta('multivendorx_commission_id', true) : null;
    //     $commission    = $commission_id ? CommissionUtil::get_commission_db($commission_id) : null;

    //     $amount = $commission ? (float) $commission->commission_total : 0.00;

    //     $data = [
    //         'receiver_id'      => (int) $store_id,
    //         'order_id'         => $order_id > 0 ? (int) $order_id : null,
    //         'commission_id'    => $commission_id ? (int) $commission_id : null,
    //         'receiver_type'    => 'Store',
    //         'amount'           => $amount,
    //         'currency'         => get_woocommerce_currency(),
    //         'narration'        => "Payment Successful",
    //     ];

    //     $format = ["%d", "%d", "%d", "%s", "%f", "%s", "%s"];

    //     $wpdb->insert(
    //         $wpdb->prefix . Utill::TABLES['real_time_transaction'],
    //         $data,
    //         $format
    //     );
        
    // }

    public function cod_order_process($order_id, $old_status, $new_status, $order) {
        if ($order->get_parent_id() == 0) {
            return;
        }

        $payment_method = $order->get_payment_method();

        if ($payment_method == 'cod' && $new_status == 'completed') {
            global $wpdb;
            $order         = wc_get_order($order_id);
            $commission_id = $order ? $order->get_meta('multivendorx_commission_id', true) : null;
            $commission    = $commission_id ? CommissionUtil::get_commission_db($commission_id) : null;

            $amount = $commission ? (float) $commission->commission_total : 0.00;
                $data = [
                'store_id'         => (int) $commission->store_id,
                'order_id'         => (int) $order_id,
                'commission_id'    => (int) $commission_id,
                'entry_type'       => 'Dr',
                'transaction_type' => 'COD received',
                'amount'           => $amount,
                'currency'         => get_woocommerce_currency(),
                'narration'        => "COD payment received for order no. - " . $order_id,
                'status'           => 'Completed',
            ];

            $format = ["%d", "%d", "%d", "%s", "%s", "%f", "%s", "%s", "%s"];

            // check shipping
            // if shipping == admin then do nothing
            // if shipping == store {
                // $wpdb->insert(
                //     $wpdb->prefix . Utill::TABLES['transaction'],
                //     $data,
                //     $format
                // );
            // }

            //if shipping not found then else
            $payment =  $order->get_meta('multivendorx_cod_order_payment', true );
            if ($payment == 'admin') {
                return;
            } elseif ($payment == 'store'){
                 $wpdb->insert(
                    $wpdb->prefix . Utill::TABLES['transaction'],
                    $data,
                    $format
                );
            } else {
                $order->set_status($old_status);
                $order->save();
            }
        }
    }

}