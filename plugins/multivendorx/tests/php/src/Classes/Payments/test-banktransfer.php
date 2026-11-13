<?php
/**
 * Tests for MultiVendorX\Payments\BankTransfer's payment-method descriptor.
 *
 * Path mirrors the source file under test: classes/Payments/BankTransfer.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Payments\BankTransfer::get_id()/get_settings()/process_payment().
 */
class MultiVendorX_BankTransfer_Test extends WP_UnitTestCase {

	/**
	 * Get_id() returns the fixed method id "bank-transfer".
	 *
	 * @return void
	 */
	public function test_get_id_returns_bank_transfer() {
		$this->assertSame( 'bank-transfer', ( new \MultiVendorX\Payments\BankTransfer() )->get_id() );
	}

	/**
	 * Get_settings() lists every required bank-detail field key.
	 *
	 * @return void
	 */
	public function test_get_settings_lists_required_bank_detail_fields() {
		$settings = ( new \MultiVendorX\Payments\BankTransfer() )->get_settings();
		$options  = $settings['formFields'][0]['options'];
		$keys     = array_column( $options, 'key' );

		foreach ( array( 'bank_name', 'account_holder_name', 'account_number' ) as $expected_key ) {
			$this->assertContains( $expected_key, $keys );
		}
	}

	/**
	 * Process_payment() fires the completion hook with method "Bank Transfer"
	 * and a success status.
	 *
	 * @return void
	 */
	public function test_process_payment_fires_completion_hook() {
		$captured = array();

		add_action(
			'multivendorx_after_payment_complete',
			function ( $store_id, $method, $status ) use ( &$captured ) {
				$captured = array(
					'method' => $method,
					'status' => $status,
				);
			},
			10,
			3
		);

		( new \MultiVendorX\Payments\BankTransfer() )->process_payment( 1, 10 );

		$this->assertSame( 'Bank Transfer', $captured['method'] );
		$this->assertSame( 'success', $captured['status'] );
	}
}
