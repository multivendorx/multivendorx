<?php
/**
 * Tests for MultiVendorX\Payments\CustomPayment's payment-method descriptor.
 *
 * Path mirrors the source file under test: classes/Payments/CustomPayment.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Payments\CustomPayment::get_id()/get_settings()/process_payment().
 */
class MultiVendorX_CustomPayment_Test extends WP_UnitTestCase {

	/**
	 * Get_id() returns the fixed method id "custom-gateway".
	 *
	 * @return void
	 */
	public function test_get_id_returns_custom_gateway() {
		$this->assertSame( 'custom-gateway', ( new \MultiVendorX\Payments\CustomPayment() )->get_id() );
	}

	/**
	 * Process_payment() falls back to the generic "Custom Gateway" label when
	 * no custom_gateway_name setting has been configured.
	 *
	 * @return void
	 */
	public function test_process_payment_falls_back_to_generic_label_when_unconfigured() {
		$captured_method = null;

		add_action(
			'multivendorx_after_payment_complete',
			function ( $store_id, $method ) use ( &$captured_method ) {
				$captured_method = $method;
			},
			10,
			2
		);

		( new \MultiVendorX\Payments\CustomPayment() )->process_payment( 1, 10 );

		$this->assertSame( 'Custom Gateway', $captured_method );
	}

	/**
	 * Process_payment() uses the configured custom_gateway_name when the
	 * marketplace has set one.
	 *
	 * @return void
	 */
	public function test_process_payment_uses_configured_gateway_name() {
		MultiVendorX()->setting->update_setting(
			'payment_methods',
			array( 'custom-gateway' => array( 'custom_gateway_name' => 'Acme Payouts' ) )
		);

		$captured_method = null;

		add_action(
			'multivendorx_after_payment_complete',
			function ( $store_id, $method ) use ( &$captured_method ) {
				$captured_method = $method;
			},
			10,
			2
		);

		( new \MultiVendorX\Payments\CustomPayment() )->process_payment( 1, 10 );

		$this->assertSame( 'Acme Payouts', $captured_method );
	}
}
