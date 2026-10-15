<?php
/**
 * Tests for MultiVendorX\MarketplaceCompliance\Util's report-abuse CRUD/query helpers.
 *
 * Path mirrors the source file under test: modules/MarketplaceCompliance/Util.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\MarketplaceCompliance\Util::create_report_abuse()/get_report_abuse_information()/delete_report_abuse().
 */
class MultiVendorX_MarketplaceCompliance_Util_Test extends WP_UnitTestCase {

	/**
	 * Create_report_abuse() inserts a row and returns its ID.
	 *
	 * @return void
	 */
	public function test_create_report_abuse_inserts_a_row() {
		$id = $this->create_report( array( 'name' => 'Jane Reporter' ) );

		$this->assertGreaterThan( 0, $id );
	}

	/**
	 * Get_report_abuse_information() filters by store_ids.
	 *
	 * @return void
	 */
	public function test_get_report_abuse_information_filters_by_store_ids() {
		$this->create_report( array( 'store_id' => 10 ) );
		$this->create_report( array( 'store_id' => 20 ) );

		$results = \MultiVendorX\MarketplaceCompliance\Util::get_report_abuse_information( array( 'store_ids' => array( 10 ) ) );

		$this->assertCount( 1, $results );
		$this->assertSame( '10', $results[0]['store_id'] );
	}

	/**
	 * Get_report_abuse_information() filters by email.
	 *
	 * @return void
	 */
	public function test_get_report_abuse_information_filters_by_email() {
		$this->create_report( array( 'email' => 'match@example.com' ) );
		$this->create_report( array( 'email' => 'other@example.com' ) );

		$results = \MultiVendorX\MarketplaceCompliance\Util::get_report_abuse_information( array( 'email' => 'match@example.com' ) );

		$this->assertCount( 1, $results );
	}

	/**
	 * Get_report_abuse_information() filters by product_id.
	 *
	 * @return void
	 */
	public function test_get_report_abuse_information_filters_by_product_id() {
		$this->create_report( array( 'product_id' => 30 ) );
		$this->create_report( array( 'product_id' => 40 ) );

		$results = \MultiVendorX\MarketplaceCompliance\Util::get_report_abuse_information( array( 'product_id' => 30 ) );

		$this->assertCount( 1, $results );
	}

	/**
	 * Count mode returns an integer total rather than row data.
	 *
	 * @return void
	 */
	public function test_get_report_abuse_information_count_mode_returns_integer() {
		$this->create_report( array( 'store_id' => 50 ) );
		$this->create_report( array( 'store_id' => 50 ) );

		$count = \MultiVendorX\MarketplaceCompliance\Util::get_report_abuse_information(
			array(
				'store_id' => 50,
				'count'    => true,
			)
		);

		$this->assertSame( 2, $count );
	}

	/**
	 * With no filters at all, every report row is returned.
	 *
	 * @return void
	 */
	public function test_get_report_abuse_information_with_no_filters_returns_all_rows() {
		$this->create_report();
		$this->create_report();

		$results = \MultiVendorX\MarketplaceCompliance\Util::get_report_abuse_information();

		$this->assertCount( 2, $results );
	}

	/**
	 * Delete_report_abuse() removes the row and returns true.
	 *
	 * @return void
	 */
	public function test_delete_report_abuse_removes_the_row() {
		$id = $this->create_report( array( 'store_id' => 90 ) );

		$result = \MultiVendorX\MarketplaceCompliance\Util::delete_report_abuse( $id );

		$this->assertTrue( $result );
		// get_report_abuse_information() has no "id" filter, so verify via
		// a filter it does support (store_id) rather than relying on one it doesn't.
		$this->assertSame( array(), \MultiVendorX\MarketplaceCompliance\Util::get_report_abuse_information( array( 'store_ids' => array( 90 ) ) ) );
	}

	/**
	 * Delete_report_abuse() rejects an invalid/zero ID without touching the database.
	 *
	 * @return void
	 */
	public function test_delete_report_abuse_rejects_invalid_id() {
		$this->assertFalse( \MultiVendorX\MarketplaceCompliance\Util::delete_report_abuse( 0 ) );
	}

	/**
	 * Running counter so repeated calls within one test don't collide on
	 * store_id/product_id.
	 *
	 * @var int
	 */
	private static $report_sequence = 0;

	/**
	 * Create a report-abuse record via Util::create_report_abuse(), with
	 * sensible defaults for every field.
	 *
	 * @param array $overrides Fields to override.
	 * @return int Inserted record ID.
	 */
	private function create_report( array $overrides = array() ): int {
		++self::$report_sequence;

		$args = wp_parse_args(
			$overrides,
			array(
				'store_id'   => self::$report_sequence,
				'product_id' => self::$report_sequence,
				'name'       => 'Test Reporter',
				'email'      => 'reporter' . self::$report_sequence . '@example.com',
				'message'    => 'This listing violates policy.',
			)
		);

		return \MultiVendorX\MarketplaceCompliance\Util::create_report_abuse( $args );
	}
}
