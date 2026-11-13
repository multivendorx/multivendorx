<?php
/**
 * Tests for MultiVendorX\StoreReview\Util's rating sanitization.
 *
 * Path mirrors the source file under test: modules/StoreReview/Util.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\StoreReview\Util::sanitize_rating_values().
 */
class MultiVendorX_StoreReview_Util_Test extends WP_UnitTestCase {

	/**
	 * Valid ratings (1-5) pass through, keyed by their sanitized parameter name.
	 *
	 * @return void
	 */
	public function test_sanitize_rating_values_keeps_valid_ratings() {
		$result = \MultiVendorX\StoreReview\Util::sanitize_rating_values(
			array(
				'quality'  => 5,
				'shipping' => 1,
			)
		);

		$this->assertSame(
			array(
				'quality'  => 5,
				'shipping' => 1,
			),
			$result
		);
	}

	/**
	 * Ratings outside the 1-5 range are dropped, not clamped.
	 *
	 * @return void
	 */
	public function test_sanitize_rating_values_drops_out_of_range_ratings() {
		$result = \MultiVendorX\StoreReview\Util::sanitize_rating_values(
			array(
				'too_low'  => 0,
				'too_high' => 6,
				'valid'    => 3,
			)
		);

		$this->assertSame( array( 'valid' => 3 ), $result );
	}

	/**
	 * A negative rating is dropped, not turned into a valid positive one by absint().
	 *
	 * @return void
	 */
	public function test_sanitize_rating_values_drops_negative_rating() {
		$result = \MultiVendorX\StoreReview\Util::sanitize_rating_values( array( 'quality' => -3 ) );

		$this->assertSame( array(), $result );
	}

	/**
	 * A non-numeric rating value is coerced to 0 by absint() and then dropped
	 * as out of range, rather than causing a type error.
	 *
	 * @return void
	 */
	public function test_sanitize_rating_values_drops_non_numeric_rating() {
		$result = \MultiVendorX\StoreReview\Util::sanitize_rating_values( array( 'quality' => 'not-a-number' ) );

		$this->assertSame( array(), $result );
	}

	/**
	 * A non-array input is cast to an array rather than throwing.
	 *
	 * @return void
	 */
	public function test_sanitize_rating_values_handles_non_array_input() {
		$this->assertSame( array(), \MultiVendorX\StoreReview\Util::sanitize_rating_values( null ) );
		$this->assertSame( array(), \MultiVendorX\StoreReview\Util::sanitize_rating_values( '' ) );
	}

	/**
	 * An empty-string parameter name is dropped even if the rating itself is valid.
	 *
	 * @return void
	 */
	public function test_sanitize_rating_values_drops_empty_parameter_name() {
		$result = \MultiVendorX\StoreReview\Util::sanitize_rating_values( array( '' => 4 ) );

		$this->assertSame( array(), $result );
	}
}
