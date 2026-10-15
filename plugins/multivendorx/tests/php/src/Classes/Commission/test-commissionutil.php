<?php
/**
 * Tests for MultiVendorX\Commission\CommissionUtil's query-building helpers.
 *
 * Path mirrors the source file under test: classes/Commission/CommissionUtil.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Commission\CommissionUtil::get_commission_information()'s
 * filtering/count/pagination behavior and the single-row lookup helpers.
 */
class MultiVendorX_CommissionUtil_Test extends WP_UnitTestCase {

	/**
	 * Filtering by store_id returns only the rows belonging to that store.
	 *
	 * @return void
	 */
	public function test_get_commission_information_filters_by_store_id() {
		$this->create_commission( array( 'store_id' => 10 ) );
		$this->create_commission( array( 'store_id' => 10 ) );
		$this->create_commission( array( 'store_id' => 20 ) );

		$results = \MultiVendorX\Commission\CommissionUtil::get_commission_information( array( 'store_id' => 10 ) );

		$this->assertCount( 2, $results );
		foreach ( $results as $row ) {
			$this->assertSame( '10', $row['store_id'] );
		}
	}

	/**
	 * Filtering by status returns only rows with that exact status.
	 *
	 * @return void
	 */
	public function test_get_commission_information_filters_by_status() {
		$this->create_commission( array( 'status' => 'paid' ) );
		$this->create_commission( array( 'status' => 'unpaid' ) );

		$results = \MultiVendorX\Commission\CommissionUtil::get_commission_information( array( 'status' => 'paid' ) );

		$this->assertCount( 1, $results );
		$this->assertSame( 'paid', $results[0]['status'] );
	}

	/**
	 * Filtering by an array of IDs returns every matching row via the OR clause.
	 *
	 * @return void
	 */
	public function test_get_commission_information_filters_by_id_array() {
		$id_one = $this->create_commission();
		$id_two = $this->create_commission();
		$this->create_commission(); // A third row that should be excluded.

		$results = \MultiVendorX\Commission\CommissionUtil::get_commission_information( array( 'ID' => array( $id_one, $id_two ) ) );

		$this->assertCount( 2, $results );
	}

	/**
	 * Count mode (args['count']) returns an integer total rather than row data.
	 *
	 * @return void
	 */
	public function test_get_commission_information_count_mode_returns_integer_total() {
		$this->create_commission( array( 'store_id' => 30 ) );
		$this->create_commission( array( 'store_id' => 30 ) );
		$this->create_commission( array( 'store_id' => 40 ) );

		$count = \MultiVendorX\Commission\CommissionUtil::get_commission_information(
			array(
				'store_id' => 30,
				'count'    => true,
			)
		);

		$this->assertIsInt( $count );
		$this->assertSame( 2, $count );
	}

	/**
	 * Limit/offset paginate the result set rather than returning every row.
	 *
	 * @return void
	 */
	public function test_get_commission_information_paginates_with_limit_and_offset() {
		for ( $i = 0; $i < 5; $i++ ) {
			$this->create_commission( array( 'store_id' => 50 ) );
		}

		$page_one = \MultiVendorX\Commission\CommissionUtil::get_commission_information(
			array(
				'store_id' => 50,
				'limit'    => 2,
				'offset'   => 0,
			)
		);
		$page_two = \MultiVendorX\Commission\CommissionUtil::get_commission_information(
			array(
				'store_id' => 50,
				'limit'    => 2,
				'offset'   => 2,
			)
		);

		$this->assertCount( 2, $page_one );
		$this->assertCount( 2, $page_two );
		$this->assertNotSame(
			array_column( $page_one, 'ID' ),
			array_column( $page_two, 'ID' )
		);
	}

	/**
	 * No filters at all returns every row in the table.
	 *
	 * @return void
	 */
	public function test_get_commission_information_with_no_filters_returns_all_rows() {
		$this->create_commission();
		$this->create_commission();

		$results = \MultiVendorX\Commission\CommissionUtil::get_commission_information();

		$this->assertCount( 2, $results );
	}

	/**
	 * Get_commission_by_store_and_order_id() returns the matching row.
	 *
	 * @return void
	 */
	public function test_get_commission_by_store_and_order_id_returns_matching_row() {
		$id = $this->create_commission(
			array(
				'store_id' => 60,
				'order_id' => 600,
			)
		);

		$row = \MultiVendorX\Commission\CommissionUtil::get_commission_by_store_and_order_id( 60, 600 );

		$this->assertSame( $id, (int) $row->ID );
	}

	/**
	 * Get_commission_by_store_and_order_id() returns an empty stdClass, not
	 * null or a database error, when no row matches.
	 *
	 * @return void
	 */
	public function test_get_commission_by_store_and_order_id_returns_empty_stdclass_when_not_found() {
		$row = \MultiVendorX\Commission\CommissionUtil::get_commission_by_store_and_order_id( 999, 999 );

		$this->assertInstanceOf( \stdClass::class, $row );
		$this->assertSame( array(), (array) $row );
	}

	/**
	 * Get_commission_db() returns an empty stdClass for an ID that doesn't exist.
	 *
	 * @return void
	 */
	public function test_get_commission_db_returns_empty_stdclass_for_missing_id() {
		$row = \MultiVendorX\Commission\CommissionUtil::get_commission_db( 999999 );

		$this->assertInstanceOf( \stdClass::class, $row );
		$this->assertSame( array(), (array) $row );
	}

	/**
	 * Get_commission_db() returns the actual row object for a real ID.
	 *
	 * @return void
	 */
	public function test_get_commission_db_returns_the_row_for_a_real_id() {
		$id = $this->create_commission( array( 'order_id' => 700 ) );

		$row = \MultiVendorX\Commission\CommissionUtil::get_commission_db( $id );

		$this->assertSame( '700', $row->order_id );
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
