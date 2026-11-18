<?php
/**
 * Tests for MultiVendorX\Payments\Disbursement's upcoming-transaction release.
 *
 * Path mirrors the source file under test: classes/Payments/Disbursement.php.
 *
 * Only covers transaction_status_update() - multivendorx_payout_cron() needs
 * a real payment processor/gateway wiring and is left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Payments\Disbursement::transaction_status_update().
 */
class MultiVendorX_Disbursement_Test extends WP_UnitTestCase {

	/**
	 * Insert a transaction row directly, with sensible defaults for every
	 * NOT NULL column.
	 *
	 * @param array $overrides Columns to override.
	 * @return int Inserted row ID.
	 */
	private function seed_transaction( array $overrides = array() ): int {
		global $wpdb;

		$row = wp_parse_args(
			$overrides,
			array(
				'store_id'         => 1,
				'entry_type'       => 'Cr',
				'transaction_type' => 'Commission',
				'amount'           => 50,
				'balance'          => 50,
				'locking_balance'  => 0,
				'currency'         => 'USD',
				'narration'        => 'Test transaction',
				'status'           => 'Upcoming',
				'available_at'     => gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS ),
			)
		);

		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['transaction'];
		$wpdb->insert( $table, $row ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		return (int) $wpdb->insert_id;
	}

	/**
	 * A transaction whose available_at has already passed is marked
	 * Processed, and a matching Completed entry is appended.
	 *
	 * @return void
	 */
	public function test_releases_upcoming_transaction_past_its_available_at() {
		$id = $this->seed_transaction( array( 'amount' => 75 ) );

		( new \MultiVendorX\Payments\Disbursement() )->transaction_status_update();

		global $wpdb;
		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['transaction'];

		$original = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $table, $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.
		$this->assertSame( 'Processed', $original->status );

		$completed = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM %i WHERE status = 'Completed' AND amount = %f", $table, 75 ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.
		$this->assertNotNull( $completed );
		$this->assertNull( $completed->available_at );
	}

	/**
	 * A transaction whose available_at is still in the future is left alone.
	 *
	 * @return void
	 */
	public function test_leaves_upcoming_transaction_not_yet_available_untouched() {
		$id = $this->seed_transaction( array( 'available_at' => gmdate( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ) ) );

		( new \MultiVendorX\Payments\Disbursement() )->transaction_status_update();

		global $wpdb;
		$table  = $wpdb->prefix . \MultiVendorX\Utill::TABLES['transaction'];
		$result = $wpdb->get_row( $wpdb->prepare( 'SELECT status FROM %i WHERE id = %d', $table, $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.

		$this->assertSame( 'Upcoming', $result->status );
	}

	/**
	 * A transaction that's already Processed/Completed is left untouched -
	 * only 'Upcoming' rows are ever released.
	 *
	 * @return void
	 */
	public function test_leaves_non_upcoming_transaction_untouched() {
		$id = $this->seed_transaction( array( 'status' => 'Completed' ) );

		( new \MultiVendorX\Payments\Disbursement() )->transaction_status_update();

		global $wpdb;
		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['transaction'];
		$count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.

		// No new row should have been appended for this already-settled transaction.
		$this->assertSame( 1, $count );
	}
}
