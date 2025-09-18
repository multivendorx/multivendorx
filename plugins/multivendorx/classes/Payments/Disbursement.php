<?php

namespace MultiVendorX\Payments;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class Disbursement {
    public function __construct() {
        // add_action('woocommerce_order_status_changed', array($this, 'disbursement_process'), 30, 4);
        add_action( 'multivendorx_transaction_status_update', array($this, 'transaction_status_update'));
        add_action( 'multivendorx_payout_cron', array($this, 'multivendorx_payout_cron'));
        
    }

    // public function disbursement_process($order_id, $old_status, $new_status, $order) {
    //     if ($order->get_parent_id() == 0) {
    //         return;
    //     }

    //     $disbursement_status = MultiVendorX()->setting->get_setting( 'disbursement_order_status' );
    //     if( !empty($disbursement_status) && in_array($new_status, $disbursement_status)){
    //         $disbursement_method = MultiVendorX()->setting->get_setting( 'disbursement_method' );
            
    //         if ($disbursement_method == 'instantly') {
    //             $commission_id = $order->get_meta( 'multivendorx_commission_id', true) ?? '';
    //             $commission = CommissionUtil::get_commission_db($commission_id);

    //             $store_id = $commission->store_id;
    //             $amount = $commission->commission_total;

    //             MultiVendorX()->payments->processor->process_payment($store_id, $amount, $order_id);

    //         }
    //     }

    // }

    public function transaction_status_update() {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['transaction'];

        $results = $wpdb->get_results("SELECT * FROM {$table}
            WHERE status = 'Pending'
            AND available_at IS NOT NULL
            AND available_at < NOW()"
        );

        foreach ($results as $row) {
            $wpdb->update(
                $table,
                [ 'status' => 'Processed' ],
                [ 'id'     => $row->id ],
                [ '%s' ],
                [ '%d' ]
            );

            $wpdb->insert(
                $table,
                [
                    'store_id'        => $row->store_id,
                    'order_id'        => $row->order_id,
                    'commission_id'   => $row->commission_id,
                    'entry_type'      => $row->entry_type,
                    'transaction_type'=> $row->transaction_type,
                    'amount'          => $row->amount,
                    'currency'        => $row->currency,
                    'narration'       => $row->narration,
                    'status'          => 'Completed',
                    'available_at'    => null,
                    'created_at'      => current_time('mysql'),
                ],
                ['%d','%d','%d','%s','%s', '%f','%s','%s', '%s','%s','%s']
            );

        }
    }

    public function multivendorx_payout_cron() {
       
        $threshold_amount = MultiVendorX()->setting->get_setting( 'payout_threshold_amount' );
        $minimum_wallet_amount = MultiVendorX()->setting->get_setting( 'wallet_threshold_amount', 0 );
        
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['transaction'];
        
        $results = $wpdb->get_results("
            SELECT store_id, balance FROM {$table} WHERE id IN ( SELECT MAX(id) FROM {$table} GROUP BY store_id );
        ");

        foreach ($results as $row) {
            if (($threshold_amount + $minimum_wallet_amount) < $row->balance) {
                MultiVendorX()->payments->processor->process_payment( $row->store_id, $row->balance);
            }
        }
    }
}