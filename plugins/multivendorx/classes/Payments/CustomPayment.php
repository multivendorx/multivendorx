<?php
/**
 * Custom payment gateway class.
 *
 * @package multivendorx
 */

namespace MultiVendorX\Payments;

defined( 'ABSPATH' ) || exit;

/**
 * Custom payment class.
 */
class CustomPayment {

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'multivendorx_process_custom-gateway_payment', array( $this, 'process_payment' ), 10, 5 );
    }

    /**
     * Get payment method id.
     *
     * @return string
     */
    public function get_id() {
        return 'custom-gateway';
    }

    /**
     * Get payment settings.
     *
     * @return array
     */
    public function get_settings() {
        return array(
            'icon'       => 'cogs-on-wheels',
            'id'         => $this->get_id(),
            'label'      => 'Custom Gateway',
            'disableBtn' => true,
            'desc'       => 'Connect a custom or third-party payout method tailored to your marketplace needs.',
            'formFields' => array(
                array(
                    'key'         => 'custom_gateway_name',
                    'type'        => 'text',
                    'label'       => 'Gateway name',
                    'placeholder' => 'Enter Name',
                ),
            ),
        );
    }

    /**
     * Get store payment settings.
     */
    public function get_store_payment_settings() {
    }

    /**
     * Process payment.
     *
     * @param int    $store_id for the transaction.
     * @param float  $amount for the transaction.
     * @param int    $order_id for the transaction.
     * @param string $transaction_id for the transaction.
     * @param string $note for the transaction.
     */
    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null ) {
        // quick autoload/class check (helps debugging).
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $settings               = ! empty( $payment_admin_settings['custom-gateway'] ) ? $payment_admin_settings['custom-gateway'] : array();

        $gateway_name = $settings && $settings['custom_gateway_name'] ? $settings['custom_gateway_name'] : 'Custom Gateway';

        $status = 'success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            $gateway_name,
            $status,
            $order_id,
            $transaction_id,
            $note,
            $amount
        );
    }
}
