<?php
/**
 * Tests for MultiVendorX\Commission\Commission's dual int/object constructor.
 *
 * Path mirrors the source file under test: classes/Commission/Commission.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Commission\Commission::get_id()/get_data() under both
 * constructor forms (an int ID that gets looked up, and an already-fetched row object).
 */
class MultiVendorX_Commission_Test extends WP_UnitTestCase {

	/**
	 * Constructing with an int ID looks the row up via CommissionUtil and
	 * exposes it through get_id()/get_data().
	 *
	 * @return void
	 */
	public function test_constructing_with_int_id_loads_the_row_from_the_database() {
		$id = $this->create_commission(
			array(
				'order_id' => 123,
				'status'   => 'paid',
			)
		);

		$commission = new \MultiVendorX\Commission\Commission( $id );

		$this->assertSame( $id, $commission->get_id() );
		$this->assertSame( '123', $commission->get_data( 'order_id' ) );
		$this->assertSame( 'paid', $commission->get_data( 'status' ) );
	}

	/**
	 * Constructing with an already-fetched row object uses it directly,
	 * without a second database lookup, and derives the ID from its ->ID field.
	 *
	 * @return void
	 */
	public function test_constructing_with_a_row_object_uses_it_directly() {
		$row         = new \stdClass();
		$row->ID     = 999;
		$row->status = 'unpaid';

		$commission = new \MultiVendorX\Commission\Commission( $row );

		$this->assertSame( 999, $commission->get_id() );
		$this->assertSame( 'unpaid', $commission->get_data( 'status' ) );
	}

	/**
	 * An int ID that doesn't exist in the database still constructs - get_data()
	 * on the resulting empty stdClass triggers a PHP warning for an undefined
	 * property, not a fatal error.
	 *
	 * @return void
	 */
	public function test_constructing_with_a_nonexistent_int_id_does_not_fatal() {
		$commission = new \MultiVendorX\Commission\Commission( 999999 );

		$this->assertSame( 999999, $commission->get_id() );
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
