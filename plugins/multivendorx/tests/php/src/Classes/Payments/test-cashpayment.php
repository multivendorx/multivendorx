<?php
/**
 * Tests for MultiVendorX\Payments\CashPayment's payment-method descriptor.
 *
 * Path mirrors the source file under test: classes/Payments/CashPayment.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Payments\CashPayment::get_id()/get_settings()/process_payment().
 */
class MultiVendorX_CashPayment_Test extends WP_UnitTestCase {

	/**
	 * Get_id() returns the fixed method id "cash".
	 *
	 * @return void
	 */
	public function test_get_id_returns_cash() {
		$this->assertSame( 'cash', ( new \MultiVendorX\Payments\CashPayment() )->get_id() );
	}

	/**
	 * Get_settings() returns the method descriptor shape the payment-method
	 * selection UI relies on, with disableBtn true (cash has no setup form).
	 *
	 * @return void
	 */
	public function test_get_settings_returns_expected_shape() {
		$settings = ( new \MultiVendorX\Payments\CashPayment() )->get_settings();

		$this->assertSame( 'cash', $settings['id'] );
		$this->assertTrue( $settings['disableBtn'] );
		$this->assertSame( array(), $settings['formFields'] );
	}

	/**
	 * Process_payment() fires multivendorx_after_payment_complete with a
	 * 'success' status and the given amount/order/transaction details.
	 *
	 * @return void
	 */
	public function test_process_payment_fires_completion_hook_with_success_status() {
		$captured = null;

		add_action(
			'multivendorx_after_payment_complete',
			function ( $store_id, $method, $status, $order_id, $transaction_id, $note, $amount ) use ( &$captured ) {
				$captured = array(
					'store_id'       => $store_id,
					'method'         => $method,
					'status'         => $status,
					'order_id'       => $order_id,
					'transaction_id' => $transaction_id,
					'note'           => $note,
					'amount'         => $amount,
				);
			},
			10,
			7
		);

		( new \MultiVendorX\Payments\CashPayment() )->process_payment( 5, 99.5, 100, 'txn-1', 'A note' );

		$this->assertSame( 5, $captured['store_id'] );
		$this->assertSame( 'Cash', $captured['method'] );
		$this->assertSame( 'success', $captured['status'] );
		$this->assertSame( 99.5, $captured['amount'] );
	}
}
