<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Transactions' listing/balance endpoints.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Transactions.php.
 *
 * Only covers get_item() (store balance) - get_items()'s listing/status-count
 * headers follow the same pattern already covered for the pro plugin's
 * equivalent controller, and update_item() (approve/reject) needs a fuller
 * withdrawal-request fixture chain left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Transactions::get_item()'s store-balance breakdown.
 */
class MultiVendorX_RestAPI_Transactions_Test extends WP_UnitTestCase {

	/**
	 * A request without a valid nonce is rejected with a 403.
	 *
	 * @return void
	 */
	public function test_get_item_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Transactions();
		$request = new \WP_REST_Request();

		$result = $rest->get_item( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * A zero/missing store id returns a zeroed-out balance shape rather than
	 * attempting a lookup with an invalid id.
	 *
	 * @return void
	 */
	public function test_get_item_returns_zeroed_balance_for_missing_store_id() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Transactions();
		$request = new \WP_REST_Request();
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$response = $rest->get_item( $request );
		$data     = $response->get_data();

		$this->assertSame( 0, $data['balance'] );
		$this->assertSame( 0, $data['lifetime_earning'] );
	}

	/**
	 * A user who doesn't manage the given store is forbidden from viewing its balance.
	 *
	 * @return void
	 */
	public function test_get_item_denies_user_who_does_not_manage_store() {
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber );

		$store   = $this->create_store();
		$rest    = new \MultiVendorX\RestAPI\Controllers\Transactions();
		$request = new \WP_REST_Request();
		$request->set_param( 'id', $store->get_id() );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$result = $rest->get_item( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * For a store an admin can manage, the balance breakdown reflects the
	 * store's latest transaction row, and lifetime_earning is the running
	 * total minus the locking balance.
	 *
	 * @return void
	 */
	public function test_get_item_returns_balance_breakdown_for_manageable_store() {
		// MultiVendorX()->setting is a request-lifetime singleton - reset
		// wallet_threshold_amount explicitly rather than relying on no other
		// test file in this run having set it (Transaction's own test does).
		MultiVendorX()->setting->update_setting( 'wallet_threshold_amount', 0 );

		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$store = $this->create_store();

		$this->create_transaction(
			array(
				'store_id'        => $store->get_id(),
				'amount'          => 50,
				'balance'         => 50,
				'locking_balance' => 5,
			)
		);

		$rest    = new \MultiVendorX\RestAPI\Controllers\Transactions();
		$request = new \WP_REST_Request();
		$request->set_param( 'id', $store->get_id() );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$response = $rest->get_item( $request );
		$data     = $response->get_data();

		$this->assertSame( '50.00', $data['balance'] );
		$this->assertSame( 45.0, $data['lifetime_earning'] );
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

	/**
	 * Running counter so repeated calls within one test don't collide on
	 * store_id.
	 *
	 * @var int
	 */
	private static $transaction_sequence = 0;

	/**
	 * Insert a transaction row directly, with sensible defaults for every
	 * NOT NULL column that has no database default.
	 *
	 * @param array $overrides Columns to override.
	 * @return int Inserted row ID.
	 */
	private function create_transaction( array $overrides = array() ): int {
		global $wpdb;

		++self::$transaction_sequence;

		$row = wp_parse_args(
			$overrides,
			array(
				'store_id'         => self::$transaction_sequence,
				'entry_type'       => 'Cr',
				'transaction_type' => 'Commission',
				'amount'           => 10,
				'balance'          => 10,
				'locking_balance'  => 0,
				'currency'         => 'USD',
				'narration'        => 'Test transaction',
				'status'           => 'Completed',
			)
		);

		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['transaction'];
		$wpdb->insert( $table, $row ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		return (int) $wpdb->insert_id;
	}
}
