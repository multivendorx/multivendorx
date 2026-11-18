<?php
/**
 * Tests for MultiVendorX\Transaction\Transaction's query/balance/creation helpers.
 *
 * Path mirrors the source file under test: classes/Transaction/Transaction.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Transaction\Transaction::get_transaction_information()/
 * get_transaction_db()/get_balances_for_store()/create_transaction().
 */
class MultiVendorX_Transaction_Test extends WP_UnitTestCase {

	/**
	 * Filtering by store_id returns only that store's rows.
	 *
	 * @return void
	 */
	public function test_get_transaction_information_filters_by_store_id() {
		$this->create_transaction( array( 'store_id' => 10 ) );
		$this->create_transaction( array( 'store_id' => 20 ) );

		$results = \MultiVendorX\Transaction\Transaction::get_transaction_information( array( 'store_id' => 10 ) );

		$this->assertCount( 1, $results );
		$this->assertSame( '10', $results[0]['store_id'] );
	}

	/**
	 * Count mode returns an integer total rather than row data.
	 *
	 * @return void
	 */
	public function test_get_transaction_information_count_mode_returns_integer() {
		$this->create_transaction( array( 'store_id' => 30 ) );
		$this->create_transaction( array( 'store_id' => 30 ) );

		$count = \MultiVendorX\Transaction\Transaction::get_transaction_information(
			array(
				'store_id' => 30,
				'count'    => true,
			)
		);

		$this->assertSame( 2, $count );
	}

	/**
	 * Limit/offset paginate the result set.
	 *
	 * @return void
	 */
	public function test_get_transaction_information_paginates() {
		for ( $i = 0; $i < 4; $i++ ) {
			$this->create_transaction( array( 'store_id' => 40 ) );
		}

		$page = \MultiVendorX\Transaction\Transaction::get_transaction_information(
			array(
				'store_id' => 40,
				'limit'    => 2,
				'offset'   => 0,
			)
		);

		$this->assertCount( 2, $page );
	}

	/**
	 * Get_transaction_db() returns the row for a commission ID that has a
	 * matching transaction.
	 *
	 * @return void
	 */
	public function test_get_transaction_db_returns_matching_row() {
		$id = $this->create_transaction( array( 'commission_id' => 77 ) );

		$row = \MultiVendorX\Transaction\Transaction::get_transaction_db( 77 );

		$this->assertSame( (string) $id, $row['id'] );
	}

	/**
	 * Get_transaction_db() returns an empty array, not null, for a
	 * commission ID with no transaction yet.
	 *
	 * @return void
	 */
	public function test_get_transaction_db_returns_empty_array_when_none_exists() {
		$this->assertSame( array(), \MultiVendorX\Transaction\Transaction::get_transaction_db( 999999 ) );
	}

	/**
	 * Get_balances_for_store() returns zeroed balances for a store with no transactions.
	 *
	 * @return void
	 */
	public function test_get_balances_for_store_returns_zero_for_no_transactions() {
		$balances = \MultiVendorX\Transaction\Transaction::get_balances_for_store( 999999 );

		$this->assertSame( 0.00, $balances['balance'] );
		$this->assertSame( 0.00, $balances['locking_balance'] );
	}

	/**
	 * Get_balances_for_store() returns the most recent balance row, with the
	 * wallet-threshold amount subtracted.
	 *
	 * @return void
	 */
	public function test_get_balances_for_store_subtracts_wallet_threshold() {
		MultiVendorX()->setting->update_setting( 'wallet_threshold_amount', 20 );

		$this->create_transaction(
			array(
				'store_id' => 50,
				'balance'  => 100,
			)
		);

		$balances = \MultiVendorX\Transaction\Transaction::get_balances_for_store( 50 );

		$this->assertSame( 80.0, $balances['balance'] );
	}

	/**
	 * Get_balances_for_store() with $total=true sums every transaction's
	 * amount for that store (lifetime earnings), ignoring the wallet threshold.
	 *
	 * @return void
	 */
	public function test_get_balances_for_store_total_mode_sums_amounts() {
		$this->create_transaction(
			array(
				'store_id' => 60,
				'amount'   => 30,
			)
		);
		$this->create_transaction(
			array(
				'store_id' => 60,
				'amount'   => 70,
			)
		);

		$total = \MultiVendorX\Transaction\Transaction::get_balances_for_store( 60, true );

		$this->assertSame( '100.00', $total );
	}

	/**
	 * Create_transaction() with no commission lock period marks the
	 * transaction Completed immediately, not Upcoming.
	 *
	 * @return void
	 */
	public function test_create_transaction_marks_completed_when_no_lock_period() {
		MultiVendorX()->setting->update_setting( 'commission_lock_period', 0 );

		$commission_id = $this->create_commission(
			array(
				'store_id'      => 70,
				'store_payable' => 25,
			)
		);

		$order       = wc_create_order();
		$transaction = new \MultiVendorX\Transaction\Transaction();
		$transaction->create_transaction( $commission_id, $order );

		$row = \MultiVendorX\Transaction\Transaction::get_transaction_db( $commission_id );
		$this->assertSame( 'Completed', $row['status'] );
	}

	/**
	 * Create_transaction() is a no-op when a transaction for this commission
	 * already exists - it must never double-pay the same commission.
	 *
	 * @return void
	 */
	public function test_create_transaction_is_noop_when_already_exists() {
		$commission_id = $this->create_commission( array( 'store_id' => 80 ) );
		$this->create_transaction( array( 'commission_id' => $commission_id ) );

		global $wpdb;
		$table        = $wpdb->prefix . \MultiVendorX\Utill::TABLES['transaction'];
		$count_before = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.

		$order       = wc_create_order();
		$transaction = new \MultiVendorX\Transaction\Transaction();
		$transaction->create_transaction( $commission_id, $order );

		$count_after = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.

		$this->assertSame( $count_before, $count_after );
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

	/**
	 * Running counter so repeated calls within one test don't collide on
	 * order_id/customer_id.
	 *
	 * @var int
	 */
	private static $commission_sequence = 0;

	/**
	 * Insert a commission row directly, with sensible defaults for every
	 * NOT NULL column that has no database default.
	 *
	 * @param array $overrides Columns to override.
	 * @return int Inserted row ID.
	 */
	private function create_commission( array $overrides = array() ): int {
		global $wpdb;

		++self::$commission_sequence;

		$row = wp_parse_args(
			$overrides,
			array(
				'order_id'    => self::$commission_sequence,
				'store_id'    => self::$commission_sequence,
				'customer_id' => self::$commission_sequence,
				'currency'    => 'USD',
				'status'      => 'unpaid',
			)
		);

		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['commission'];
		$wpdb->insert( $table, $row ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		return (int) $wpdb->insert_id;
	}
}
