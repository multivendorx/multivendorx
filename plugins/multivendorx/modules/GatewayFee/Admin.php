<?php
/**
 * MultiVendorX Gateway Fee Admin
 *
 * Handles gateway fee logic for commissions.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\GatewayFee;

use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Utill;

/**
 * MultiVendorX Gateway Fee Admin class.
 *
 * @class       Admin class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Constructor.
     *
     * Adds required filters for gateway fee calculation.
     */
    public function __construct() {
        add_filter( 'multivendorx_before_commission_insert', array( $this, 'gateway_fee_calculation' ), 10, 5 );
    }

    /**
     * Calculate gateway fees and update commission data.
     *
     * @param array  $filtered Filtered commission data.
     * @param object $store Vendor store object.
     * @param float  $total Order total.
     * @param object $order WC_Order object.
     * @param bool   $refund Whether this is a refund.
     *
     * @return array Modified commission data including gateway fee.
     */
    public function gateway_fee_calculation( $filtered, $store, $total, $order, $refund ) {

        if ( ! empty( MultiVendorX()->setting->get_setting( 'gateway_fees' ) ) ) {
            $fixed_fee        = 0;
            $percentage_fee   = 0;
            $gateway_settings = reset( MultiVendorX()->setting->get_setting( 'gateway_fees', array() ) );
            $parent_order     = wc_get_order( $order->get_parent_id() );

            $payment_method = $parent_order->get_payment_method();
            $fixed_fee      = (float) (
                $gateway_settings[ $payment_method . '_fixed' ]
                ?? $gateway_settings['default_fixed']
                ?? 0
            );

            $percentage_fee = (float) (
                $gateway_settings[ $payment_method . '_percentage' ]
                ?? $gateway_settings['default_percentage']
                ?? 0
            );

            $gateway_fee = $order->get_total() > 0
                ? ( (float) $order->get_total() * ( (float) $percentage_fee / 100 ) ) + (float) $fixed_fee
                : 0;

            if ( $refund ) {
                $commission_id     = $order->get_meta( Utill::ORDER_META_SETTINGS['commission_id'], true );
                $commission        = CommissionUtil::get_commission_db( $commission_id );
                $remaining_payable = (float) ( $order->get_total() - $order->get_total_refunded() );

                $gateway_fee = $remaining_payable > 0
                    ? ( ( $remaining_payable * ( (float) $percentage_fee / 100 ) ) + (float) $fixed_fee )
                    : 0;
            }

            // Decode applied rules safely using JSON.
            $rules = unserialize( $filtered['data']['rules_applied'] );

            $rules['gateway_fee'] = array(
                'fixed'      => $fixed_fee,
                'percentage' => $percentage_fee,
            );

            $filtered['data']['gateway_fee']         = (float) $gateway_fee;
            $filtered['data']['store_payable']       = (float) $filtered['data']['store_payable'] - (float) $gateway_fee;
            $filtered['data']['marketplace_payable'] = (float) $filtered['data']['marketplace_payable'] + (float) $gateway_fee;

            if ( $refund ) {
                $filtered['data']['store_refunded']       = (float) $filtered['data']['store_refunded'] - (float) ( $commission->gateway_fee - $gateway_fee );
                $filtered['data']['marketplace_refunded'] = (float) $filtered['data']['marketplace_refunded'] + (float) ( $commission->gateway_fee - $gateway_fee );
            }

            // Encode rules safely.
            $filtered['data']['rules_applied'] = serialize( $rules );

            $filtered['format'][] = '%f';
        }

        return $filtered;
    }
}
