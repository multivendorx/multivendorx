<?php
/**
 * Class Disbursement
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Payments;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Disbursement Class.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Disbursement {
    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'multivendorx_transaction_status_update', array( $this, 'transaction_status_update' ) );
        add_action( 'multivendorx_payout_cron', array( $this, 'multivendorx_payout_cron' ) );
    }

    /**
     * Transaction status update
     */
    public function transaction_status_update() {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['transaction'];

        $results = $wpdb->get_results(
            "SELECT * FROM {$table}
            WHERE status = 'Upcoming'
            AND available_at IS NOT NULL
            AND available_at < NOW()"
        );

        foreach ( $results as $row ) {
            $wpdb->update(
                $table,
                array( 'status' => 'Processed' ),
                array( 'id' => $row->id ),
                array( '%s' ),
                array( '%d' )
            );

            $wpdb->insert(
                $table,
                array(
                    'store_id'         => $row->store_id,
                    'order_id'         => $row->order_id,
                    'commission_id'    => $row->commission_id,
                    'entry_type'       => $row->entry_type,
                    'transaction_type' => $row->transaction_type,
                    'amount'           => $row->amount,
                    'currency'         => $row->currency,
                    'narration'        => $row->narration,
                    'status'           => 'Completed',
                    'available_at'     => null,
                    'created_at'       => current_time( 'mysql' ),
                ),
                array( '%d', '%d', '%d', '%s', '%s', '%f', '%s', '%s', '%s', '%s', '%s' )
            );

            if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
                MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
            }
        }
    }

    /**
     * Payout cron job
     */
    public function multivendorx_payout_cron() {

        $threshold_amount      = (int) MultiVendorX()->setting->get_setting( 'payout_threshold_amount', 0 );
        $minimum_wallet_amount = (int) MultiVendorX()->setting->get_setting( 'wallet_threshold_amount', 0 );

        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['transaction'];

        $results = $wpdb->get_results(
            "
            SELECT store_id, balance FROM {$table} WHERE id IN ( SELECT MAX(id) FROM {$table} GROUP BY store_id );
        "
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        foreach ( $results as $row ) {
            if ( StoreUtil::get_excluded_products( '', $row->store_id, true ) ) {
                return;
            }
            if ( ( $threshold_amount + $minimum_wallet_amount ) < $row->balance ) {
                MultiVendorX()->payments->processor->process_payment( $row->store_id, ($row->balance - $minimum_wallet_amount) );
            }
        }
    }
}
