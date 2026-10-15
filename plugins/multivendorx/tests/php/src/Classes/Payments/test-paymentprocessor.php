<?php
/**
 * Tests for MultiVendorX\Payments\PaymentProcessor's withdrawal guard/failure paths.
 *
 * Path mirrors the source file under test: classes/Payments/PaymentProcessor.php.
 *
 * Only covers process_payment()'s early-exit and no-payment-method-configured
 * paths - the real gateway payout branches (PayPal/Stripe/bank transfer) need
 * those providers' own API clients and are left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Payments\PaymentProcessor::process_payment()'s manual-method guard
 * and no-payment-method-configured failure recording.
 */
class MultiVendorX_PaymentProcessor_Test extends WP_UnitTestCase {

	/**
	 * For a manually-settled method (cash/bank-transfer/custom-gateway) that
	 * isn't a disbursement call, process_payment() is a pure no-op - no
	 * transaction row is written, since that method already recorded its own.
	 *
	 * @return void
	 */
	public function test_process_payment_is_noop_for_manual_methods() {
		$processor = MultiVendorX()->payments->processor;

		$processor->process_payment( 1, 50, null, 'cash', 'note', false );

		global $wpdb;
		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['transaction'];
		$count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.

		$this->assertSame( 0, $count );
	}

	/**
	 * With no payment method configured on the store and none passed
	 * explicitly, process_payment() records a Failed transaction rather than
	 * silently doing nothing or crashing on an empty gateway name.
	 *
	 * @return void
	 */
	public function test_process_payment_records_failed_transaction_when_no_method_configured() {
		$store     = $this->create_store();
		$processor = MultiVendorX()->payments->processor;

		$processor->process_payment( $store->get_id(), 20, 500 );

		global $wpdb;
		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['transaction'];
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM %i WHERE status = 'Failed'", $table ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.

		$this->assertNotNull( $row );
		$this->assertStringContainsString( 'no payment method configured', $row->narration );
	}

	/**
	 * Running counter so repeated calls within one test don't collide on
	 * name/slug.
	 *
	 * @var int
	 */
	private static $store_sequence = 0;

	/**
	 * Create and save a store with sensible defaults, overridable per call.
	 *
	 * @param array $overrides Store data to override the defaults with.
	 * @return \MultiVendorX\Store\Store
	 */
	private function create_store( array $overrides = array() ): \MultiVendorX\Store\Store {
		++self::$store_sequence;

		$data = wp_parse_args(
			$overrides,
			array(
				'name'   => 'Test Store ' . self::$store_sequence,
				'status' => 'active',
			)
		);

		$store = new \MultiVendorX\Store\Store();
		foreach ( $data as $key => $value ) {
			$store->set( $key, $value );
		}
		$store->save();

		return $store;
	}
}
