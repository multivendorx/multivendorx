<?php
/**
 * MultiVendorX Payment Processor.
 *
 * @package multivendorx
 */

namespace MultiVendorX\Payments;

use MultiVendorX\Store\Store;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Payment Processor.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class PaymentProcessor {
    /**
     * Constructor
     *
     * @return void
     */
    public function __construct() {
        add_action( 'multivendorx_after_payment_complete', array( $this, 'after_payment_complete' ), 10, 7 );

        // COD payments.
        add_action( 'woocommerce_order_status_changed', array( $this, 'cod_order_process' ), 30, 4 );
    }

    /**
     * Process Payment
     *
     * @param int         $store_id Store ID.
     * @param float       $amount Amount to be paid.
     * @param int|null    $order_id Order ID.
     * @param string|null $method Payment Method.
     * @param string|null $note Note.
     *
     * @return void
     */
    public function process_payment( $store_id, $amount, $order_id = null, $method = null, $note = null, $disbursement = false ) {
        global $wpdb;
        $store = new Store( $store_id );

        if ( $method ) {
            $payment_method = $method;
        } else {
            $payment_method = $store->get_meta( Utill::STORE_SETTINGS_KEYS['payment_method'] ) ?? '';
        }

        if ( !$disbursement && ($payment_method === 'bank-transfer' || $payment_method === 'cash' || $payment_method === 'custom-gateway') ) {
            return;
        }

        if ( ! $order_id ) {
            $withdrawals_fees  = MultiVendorX()->setting->get_setting( 'withdrawals_fees', array() );
            $withdrawals_count = (int) $store->get_meta( Utill::STORE_SETTINGS_KEYS['withdrawals_count'] );

            if ( ! empty( $withdrawals_fees['free_withdrawals'] ) && ( (int) $withdrawals_fees['free_withdrawals'] < $withdrawals_count ) ) {
                $deduct_amount = (float) $amount * ( (float) $withdrawals_fees['withdrawal_percentage'] / 100 ) + (float) $withdrawals_fees['withdrawal_fixed'];
                $amount        = $amount - $deduct_amount;

                $data = array(
                    'store_id'         => (int) $store_id,
                    'entry_type'       => 'Dr',
                    'transaction_type' => 'Withdrawal',
                    'amount'           => (float) $deduct_amount,
                    'currency'         => get_woocommerce_currency(),
                    'narration'        => 'Withdrawal cost',
                    'status'           => 'Completed',
                );

                $format = array( '%d', '%s', '%s', '%f', '%s', '%s', '%s' );

                $wpdb->insert(
                    $wpdb->prefix . Utill::TABLES['transaction'],
                    $data,
                    $format
                );

                if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
                    MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
                }

                $transaction_id = $wpdb->insert_id;
            }
        }

        if ( empty( $payment_method ) ) {
            $data = array(
                'store_id'         => (int) $store_id,
                'order_id'         => $order_id,
                'entry_type'       => 'Dr',
                'transaction_type' => 'Withdrawal',
                'payment_method'   => '',
                'amount'           => 0,
                'currency'         => get_woocommerce_currency(),
                'narration'        => 'Withdrawal failed because store default payment method not found',
                'status'           => 'Failed',
            );

            $format = array( '%d', '%d', '%s', '%s', '%s', '%f', '%s', '%s', '%s' );

            $wpdb->insert(
                $wpdb->prefix . Utill::TABLES['transaction'],
                $data,
                $format
            );

            if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
                MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
            }
            
            do_action(
                'multivendorx_notify_payout_failed',
                'payout_failed',
                array(
                    'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                    'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                    'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                    'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                    'store_name' => $store->get( 'name' ),
                    'amount'    => $amount,
                    'category'    => 'activity',
                )
            );
            return;
        }

        do_action( "multivendorx_process_{$payment_method}_payment", $store_id, $amount, $order_id, $transaction_id, $note );
    }

    /**
     * After Payment Complete
     *
     * @param int    $store_id Store ID.
     * @param string $method Payment Method.
     * @param string $status Payment Status.
     * @param int    $order_id Order ID.
     * @param int    $transaction_id Transaction ID.
     * @param string $note Note.
     * @param float  $amount Amount.
     *
     * @return void
     */
    public function after_payment_complete( $store_id, $method, $status, $order_id, $transaction_id, $note, $amount = null ) {
        global $wpdb;

        $store         = new Store( $store_id );
        $order         = $order_id > 0 ? wc_get_order( $order_id ) : null;
        $commission_id = $order ? $order->get_meta( Utill::ORDER_META_SETTINGS['commission_id'], true ) : null;
        $commission    = $commission_id ? CommissionUtil::get_commission_db( $commission_id ) : null;

        $amount = $amount ? $amount : ( $commission ? (float) $commission->store_payable : 0.00 );

        $data = array(
            'store_id'         => (int) $store_id,
            'order_id'         => $order_id > 0 ? (int) $order_id : null,
            'commission_id'    => $commission_id ? (int) $commission_id : null,
            'entry_type'       => 'Dr',
            'transaction_type' => 'Withdrawal',
            'amount'           => $amount,
            'currency'         => get_woocommerce_currency(),
            'payment_method'   => $store->get_meta( Utill::STORE_SETTINGS_KEYS['payment_method'] ),
            'narration'        => $note ? $note : ( ( 'success' === $status )
                                    ? "Withdrawal released via {$method} Payment Processor"
                                    : "Withdrawal failed via {$method} Payment Processor" ),
            'status'           => ( 'success' === $status ) ? 'Completed' : 'Failed',
        );

        $format = array( '%d', '%d', '%d', '%s', '%s', '%f', '%s', '%s', '%s', '%s' );

        $result = $wpdb->insert(
            $wpdb->prefix . Utill::TABLES['transaction'],
            $data,
            $format
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        if ( $result && 'success' === $status ) {
            $withdrawals_count = (int) $store->get_meta( Utill::STORE_SETTINGS_KEYS['withdrawals_count'] );
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['withdrawals_count'], $withdrawals_count + 1 );

            do_action(
                'multivendorx_notify_payout_received',
                'payout_received',
                array(
                    'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                    'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                    'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                    'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                    'order_id'    => $order_id,
                    'category'    => 'activity',
                )
            );
        }

        if ( 'success' !== $status ) {
            $row = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT *
                            FROM $wpdb->prefix . Utill::TABLES['transaction']
                            WHERE id = %d",
                    $transaction_id
                )
            );

            $wpdb->insert(
                $wpdb->prefix . Utill::TABLES['transaction'],
                array(
                    'store_id'         => $row->store_id,
                    'entry_type'       => 'Dr',
                    'transaction_type' => 'Reversed',
                    'amount'           => $row->amount,
                    'currency'         => $row->currency,
                    'narration'        => 'Transaction Reversed',
                    'status'           => 'Completed',
                ),
                array( '%d', '%s', '%s', '%f', '%s', '%s', '%s' )
            );

            if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
                MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
            }

            do_action(
                'multivendorx_notify_payout_failed',
                'payout_failed',
                array(
                    'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                    'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                    'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                    'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                    'store_name' => $store->get( 'name' ),
                    'amount'    => $amount,
                    'category'    => 'activity',
                )
            );
        }
    }

    /**
     * COD Order Process
     *
     * @param int    $order_id Order ID.
     * @param string $old_status Old Status.
     * @param string $new_status New Status.
     * @param object $order Order Object.
     *
     * @return void
     */
    public function cod_order_process( $order_id, $old_status, $new_status, $order ) {
        if ( $order->get_parent_id() === 0 ) {
            return;
        }

        $payment_method = $order->get_payment_method();

        if ( 'cod' === $payment_method && 'completed' === $new_status ) {
            global $wpdb;
            $order         = wc_get_order( $order_id );
            $commission_id = $order ? $order->get_meta( Utill::ORDER_META_SETTINGS['commission_id'], true ) : null;
            $commission    = $commission_id ? CommissionUtil::get_commission_db( $commission_id ) : null;

            $amount = $commission ? (float) $commission->store_payable : 0.00;
            $store  = new Store( (int) $commission->store_id );

                $data = array(
					'store_id'         => (int) $commission->store_id,
					'order_id'         => (int) $order_id,
					'commission_id'    => (int) $commission_id,
					'entry_type'       => 'Dr',
					'transaction_type' => 'COD received',
					'amount'           => $amount,
					'currency'         => get_woocommerce_currency(),
					'payment_method'   => $store->get_meta( Utill::STORE_SETTINGS_KEYS['payment_method'] ) ?? '',
					'narration'        => 'COD payment received for order no. - ' . $order_id,
					'status'           => 'Completed',
				);

				$format = array( '%d', '%d', '%d', '%s', '%s', '%f', '%s', '%s', '%s', '%s' );

				// If shipping not found then else.
				$payment = $order->get_meta( Utill::ORDER_META_SETTINGS['cod_order_payment'], true );
				if ( 'admin' === $payment ) {
					return;
				} elseif ( 'store' === $payment ) {
					$wpdb->insert(
                        $wpdb->prefix . Utill::TABLES['transaction'],
                        $data,
                        $format
					);
                    if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
                        MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
                    }
				} else {
					$order->set_status( $old_status );
					$order->save();
				}
        }
    }
}
