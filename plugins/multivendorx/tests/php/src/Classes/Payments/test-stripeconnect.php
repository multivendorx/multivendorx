<?php
/**
 * Tests for MultiVendorX\Payments\StripeConnect's config-gated store settings.
 *
 * Path mirrors the source file under test: classes/Payments/StripeConnect.php.
 *
 * Only covers get_id()/get_store_payment_settings()'s not-enabled path - the
 * enabled path needs MultiVendorX()->active_store plus a real OAuth-connected
 * store, and the actual Stripe Connect OAuth flow needs a live Stripe account;
 * both are left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Payments\StripeConnect::get_id()/get_store_payment_settings().
 */
class MultiVendorX_StripeConnect_Test extends WP_UnitTestCase {

	/**
	 * Get_id() returns the fixed method id "stripe-connect".
	 *
	 * @return void
	 */
	public function test_get_id_returns_stripe_connect() {
		$this->assertSame( 'stripe-connect', ( new \MultiVendorX\Payments\StripeConnect() )->get_id() );
	}

	/**
	 * Get_settings() includes the OAuth redirect URL the Stripe Connect app
	 * must be configured with.
	 *
	 * @return void
	 */
	public function test_get_settings_includes_oauth_redirect_url() {
		$settings     = ( new \MultiVendorX\Payments\StripeConnect() )->get_settings();
		$redirect_url = $settings['formFields'][2]['text'];

		$this->assertStringContainsString( 'multivendorx_stripe_oauth_callback', $redirect_url );
	}

	/**
	 * Get_store_payment_settings() returns nothing (null) when Stripe Connect
	 * hasn't been enabled in the admin payment-method settings - the "return
	 * array(...)" is inside the enabled branch only, with no trailing return.
	 *
	 * @return void
	 */
	public function test_get_store_payment_settings_returns_null_when_not_enabled() {
		MultiVendorX()->setting->update_setting( 'payment_methods', array() );

		$this->assertNull( ( new \MultiVendorX\Payments\StripeConnect() )->get_store_payment_settings() );
	}
}
