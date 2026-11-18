<?php
/**
 * Tests for MultiVendorX\Utill's date-formatting and plugin-state helpers.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Utill's pure date-formatting/normalization helpers and
 * its active-plugin check.
 */
class MultiVendorX_Utill_Test extends WP_UnitTestCase {

	/**
	 * Wp_to_react_date_format() should translate every PHP date token it maps,
	 * leaving separators and unmapped characters untouched.
	 *
	 * @return void
	 */
	public function test_wp_to_react_date_format_translates_known_tokens() {
		$this->assertSame( 'YYYY-MM-DD', \MultiVendorX\Utill::wp_to_react_date_format( 'Y-m-d' ) );
		$this->assertSame( 'DD/MM/YYYY', \MultiVendorX\Utill::wp_to_react_date_format( 'd/m/Y' ) );
		$this->assertSame( 'YYYY-MM-DD HH:mm:ss', \MultiVendorX\Utill::wp_to_react_date_format( 'Y-m-d H:i:s' ) );
	}

	/**
	 * Characters with no entry in the token map must pass through unchanged.
	 *
	 * @return void
	 */
	public function test_wp_to_react_date_format_leaves_unmapped_characters_untouched() {
		$this->assertSame( ', YYYY', \MultiVendorX\Utill::wp_to_react_date_format( ', Y' ) );
	}

	/**
	 * A valid start/end pair is normalized to a full-day range: 00:00:00 through 23:59:59.
	 *
	 * @return void
	 */
	public function test_normalize_date_range_expands_to_full_day_bounds() {
		$range = \MultiVendorX\Utill::normalize_date_range( '2024-01-01', '2024-01-31' );

		$this->assertSame( '2024-01-01 00:00:00', $range['start_date'] );
		$this->assertSame( '2024-01-31 23:59:59', $range['end_date'] );
	}

	/**
	 * Missing either bound returns an empty range rather than a partial one.
	 *
	 * @return void
	 */
	public function test_normalize_date_range_returns_empty_strings_when_either_bound_missing() {
		$this->assertSame(
			array(
				'start_date' => '',
				'end_date'   => '',
			),
			\MultiVendorX\Utill::normalize_date_range( '', '2024-01-31' )
		);

		$this->assertSame(
			array(
				'start_date' => '',
				'end_date'   => '',
			),
			\MultiVendorX\Utill::normalize_date_range( '2024-01-01', '' )
		);
	}

	/**
	 * An unparseable date string must not throw - it should fall back to an empty range.
	 *
	 * @return void
	 */
	public function test_normalize_date_range_returns_empty_strings_on_invalid_date() {
		$range = \MultiVendorX\Utill::normalize_date_range( 'not-a-date', '2024-01-31' );

		$this->assertSame( '', $range['start_date'] );
		$this->assertSame( '', $range['end_date'] );
	}

	/**
	 * Empty/zero-value dates are rendered as the placeholder dash, not a formatted date.
	 *
	 * @return void
	 */
	public function test_multivendorx_rest_prepare_date_response_returns_dash_for_empty_or_zero_dates() {
		$this->assertSame( '-', \MultiVendorX\Utill::multivendorx_rest_prepare_date_response( '' ) );
		$this->assertSame( '-', \MultiVendorX\Utill::multivendorx_rest_prepare_date_response( '0000-00-00 00:00:00' ) );
		$this->assertSame( '-', \MultiVendorX\Utill::multivendorx_rest_prepare_date_response( '0000-00-00' ) );
	}

	/**
	 * An unparseable, non-empty date string returns null rather than a bogus timestamp.
	 *
	 * @return void
	 */
	public function test_multivendorx_rest_prepare_date_response_returns_null_for_unparseable_date() {
		$this->assertNull( \MultiVendorX\Utill::multivendorx_rest_prepare_date_response( 'not-a-date' ) );
	}

	/**
	 * A valid date string is formatted to ISO 8601 (no offset) in UTC when requested.
	 *
	 * @return void
	 */
	public function test_multivendorx_rest_prepare_date_response_formats_utc() {
		$this->assertSame(
			'2024-01-01T12:00:00',
			\MultiVendorX\Utill::multivendorx_rest_prepare_date_response( '2024-01-01 12:00:00', true )
		);
	}

	/**
	 * Is_active_plugin() reflects the real WordPress active-plugins list.
	 *
	 * @return void
	 */
	public function test_is_active_plugin_returns_false_for_a_plugin_that_is_not_active() {
		$this->assertFalse( \MultiVendorX\Utill::is_active_plugin( 'this-plugin-does-not-exist/this-plugin-does-not-exist.php' ) );
	}
}
