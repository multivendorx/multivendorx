<?php
/**
 * Tests for MultiVendorX\Payments\PaypalPayout's config-gated store settings.
 *
 * Path mirrors the source file under test: classes/Payments/PaypalPayout.php.
 *
 * Only covers get_id()/get_store_payment_settings()/process_payment()'s
 * early-exit guard - the real PayPal payout API call needs a live/sandbox
 * PayPal account and is left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Payments\PaypalPayout::get_id()/get_store_payment_settings()/process_payment().
 */
class MultiVendorX_PaypalPayout_Test extends WP_UnitTestCase {

	/**
	 * Get_id() returns the fixed method id "paypal-payout".
	 *
	 * @return void
	 */
	public function test_get_id_returns_paypal_payout() {
		$this->assertSame( 'paypal-payout', ( new \MultiVendorX\Payments\PaypalPayout() )->get_id() );
	}

	/**
	 * Get_store_payment_settings() returns nothing (null) when PayPal
	 * Payout hasn't been enabled in the admin payment-method settings.
	 *
	 * @return void
	 */
	public function test_get_store_payment_settings_returns_null_when_not_enabled() {
		$this->assertNull( ( new \MultiVendorX\Payments\PaypalPayout() )->get_store_payment_settings() );
	}

	/**
	 * Get_store_payment_settings() returns the paypal_email field once
	 * PayPal Payout is enabled in admin settings.
	 *
	 * @return void
	 */
	public function test_get_store_payment_settings_returns_fields_when_enabled() {
		MultiVendorX()->setting->update_setting(
			'payment_methods',
			array( 'paypal-payout' => array( 'enable' => true ) )
		);

		$settings = ( new \MultiVendorX\Payments\PaypalPayout() )->get_store_payment_settings();

		$this->assertSame( 'paypal-payout', $settings['id'] );
		$this->assertSame( 'paypal_email', $settings['fields'][0]['key'] );
	}

	/**
	 * Process_payment() is a no-op when PayPal Payout hasn't been configured
	 * at all - it must not attempt an API call with no credentials.
	 *
	 * @return void
	 */
	public function test_process_payment_is_noop_when_unconfigured() {
		// MultiVendorX()->setting is a request-lifetime singleton - explicitly
		// clear payment_methods rather than relying on test execution order,
		// since an earlier test in this file enables paypal-payout on it.
		MultiVendorX()->setting->update_setting( 'payment_methods', array() );

		$fired = false;
		add_action(
            'multivendorx_after_payment_complete',
            function () use ( &$fired ) {
				$fired = true;
			}
        );

		( new \MultiVendorX\Payments\PaypalPayout() )->process_payment( 1, 10 );

		$this->assertFalse( $fired );
	}
}
