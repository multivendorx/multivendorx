<?php
/**
 * Class CashPayment.
 *
 * @package MultiVendorX\Payments
 */

namespace MultiVendorX\Payments;

defined( 'ABSPATH' ) || exit;

/**
 * Class CashPayment.
 */
class CashPayment {

    /**
     * CashPayment constructor.
     */
    public function __construct() {
        add_action( 'multivendorx_process_cash_payment', array( $this, 'process_payment' ), 10, 5 );
    }

    /**
     * Get payment method id.
     *
     * @return string
     */
    public function get_id() {
        return 'cash';
    }

    /**
     * Get payment method settings.
     *
     * @return array
     */
    public function get_settings() {
        return array(
            'icon'       => 'cash',
            'id'         => $this->get_id(),
            'label'      => 'Cash',
            'disableBtn' => true,
            'desc'       => 'Confirm and record payouts made directly to stores via cash.',
            'formFields' => array(),
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
     * @param int    $store_id       Store ID.
     * @param float  $amount         Amount.
     * @param int    $order_id       Order ID.
     * @param string $transaction_id Transaction ID.
     * @param string $note           Note.
     */
    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null ) {

        $status = 'success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            'Cash',
            $status,
            $order_id,
            $transaction_id,
            $note,
            $amount
        );
    }
}
