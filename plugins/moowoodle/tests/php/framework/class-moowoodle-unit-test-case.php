<?php
/**
 * Base test case for MooWoodle unit tests.
 *
 * Mirrors WooCommerce's own tests/legacy/framework/class-wc-unit-test-case.php:
 * every MooWoodle test extends this instead of WP_UnitTestCase directly, so
 * shared setup/teardown lives in one place.
 *
 * @package MooWoodle
 */

/**
 * MooWoodle_Unit_Test_Case class.
 */
class MooWoodle_Unit_Test_Case extends WP_UnitTestCase {

	/**
	 * Truncate MooWoodle's custom tables before every test so each test starts
	 * from a known, empty state regardless of execution order.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;

		foreach ( \MooWoodle\Util::TABLES as $table_key ) {
			$wpdb->query( $wpdb->prepare( 'DELETE FROM %i', $wpdb->prefix . $table_key ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		}
	}
}
