<?php
/**
 * Tests for MultiVendorX\Payments\Payments' provider registry.
 *
 * Path mirrors the source file under test: classes/Payments/Payments.php.
 *
 * Uses the real MultiVendorX()->payments singleton rather than constructing
 * a second Payments instance, since its constructor instantiates every
 * payment-method class and registers their hooks - doing that twice would
 * double-register them.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Payments\Payments::__get()/get_all_payment_settings().
 */
class MultiVendorX_Payments_Test extends WP_UnitTestCase {

	/**
	 * The magic __get() resolves a registered sub-class by its container key.
	 *
	 * @return void
	 */
	public function test_magic_get_resolves_registered_subclass() {
		$this->assertInstanceOf( \MultiVendorX\Payments\CashPayment::class, MultiVendorX()->payments->cash );
	}

	/**
	 * An unregistered key returns a WP_Error rather than throwing.
	 *
	 * @return void
	 */
	public function test_magic_get_returns_wp_error_for_unknown_key() {
		$this->assertWPError( MultiVendorX()->payments->not_a_real_provider );
	}

	/**
	 * Get_all_payment_settings() returns a settings entry for every built-in
	 * provider, keyed by its id.
	 *
	 * @return void
	 */
	public function test_get_all_payment_settings_includes_every_builtin_provider() {
		$settings = MultiVendorX()->payments->get_all_payment_settings();

		foreach ( array( 'custom-gateway', 'cash', 'bank-transfer', 'paypal-payout', 'stripe-connect' ) as $provider_id ) {
			$this->assertArrayHasKey( $provider_id, $settings );
		}
	}

	/**
	 * KNOWN ISSUE, pinned down here rather than fixed: get_all_payment_settings()
	 * appends its hardcoded provider list onto $this->providers on every call
	 * (`$this->providers = array_merge($this->providers ?? [], $providers)`)
	 * instead of replacing it. The returned settings array is keyed by
	 * provider id, so duplicate entries don't corrupt that specific return
	 * value - but $this->providers itself grows by 5 extra entries on every
	 * call, and get_all_store_payment_settings() (which also iterates
	 * $this->providers) does correspondingly more redundant object
	 * construction each time this has been called. A real, if low-severity,
	 * unbounded-growth issue across a single request with many calls.
	 *
	 * @return void
	 */
	public function test_get_all_payment_settings_duplicates_providers_list_on_repeated_calls() {
		MultiVendorX()->payments->get_all_payment_settings();
		$count_after_first = count( MultiVendorX()->payments->providers );

		MultiVendorX()->payments->get_all_payment_settings();
		$count_after_second = count( MultiVendorX()->payments->providers );

		$this->assertGreaterThan( $count_after_first, $count_after_second );
	}
}
