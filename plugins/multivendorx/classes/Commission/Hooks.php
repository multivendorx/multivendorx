<?php
/**
 * Modules Commission Hooks
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Commission;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Commission Hooks.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Hooks {
    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'multivendorx_checkout_store_order_processed', array( $this, 'create_commission' ), 10, 3 );
        add_action( 'woocommerce_order_refunded', array( $this, 'create_commission_refunds' ), 10, 2 );
    }

    /**
     * Create commission of store order.
     *
     * @param   object $store_order Store order object.
     * @param   object $main_order Main order object.
     * @return  void
     */
    public function create_commission( $store_order, $main_order ) {
        $processed = $store_order->get_meta( Utill::ORDER_META_SETTINGS['commissions_processed'], true );

        if ( ! $processed ) {
            $commission_id = MultiVendorX()->commission->calculate_commission( $store_order );
            $store_order->update_meta_data( Utill::ORDER_META_SETTINGS['commission_id'], $commission_id );
            $store_order->update_meta_data( Utill::ORDER_META_SETTINGS['commissions_processed'], 'yes' );

            // Action hook after commission processed.
            do_action( 'multivendorx_after_calculate_commission', $commission_id, $store_order, $main_order );
        }
    }

    /**
     * Create refunds for store commission
     *
     * @param mixed $order_id Order ID.
     * @param mixed $refund_id Refund ID.
     * @return void
     */
    public function create_commission_refunds( $order_id, $refund_id ) {
        $order  = wc_get_order( $order_id );
        $refund = wc_get_order( $refund_id );

        if ( $order->get_parent_id() === 0 ) {
			return;
        }

        if ( $refund->get_meta( '_commission_refund_processed', true ) ) {
            return;
        }

        $commission_id = MultiVendorX()->commission->calculate_commission_refunds( $order, $refund_id );

        if ( $commission_id ) {
            $refund->update_meta_data( '_commission_refund_processed', true );

            $store_id = $order->get_meta( Utill::POST_META_SETTINGS['store_id'] );
            if ( $store_id ) {
                $refund->update_meta_data( Utill::POST_META_SETTINGS['store_id'], $store_id );
            }

            $refund->save();

            /**
             * Action hook after commission refund save.
             *
             * @since 3.4.0
             */
            do_action( 'multivendorx_after_create_commission_refunds', $order_id, $commission_id );
        }
    }
}
