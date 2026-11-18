<?php
/**
 * Enrollment test-fixture helper.
 *
 * Mirrors WooCommerce's tests/legacy/framework/helpers/ pattern — a static
 * factory for the fixture, instead of repeating the same enrollment array in
 * every test.
 *
 * @package MooWoodle
 */

use MooWoodle\Enrollment;

/**
 * MooWoodle_Helper_Enrollment class.
 */
class MooWoodle_Helper_Enrollment {

	/**
	 * Create an enrollment row and return its insert ID.
	 *
	 * @param array $args Overrides for the default enrollment fields.
	 * @return int|false Insert ID of the created enrollment row, or false on failure.
	 */
	public static function create_enrollment( $args = array() ) {
		static $sequence = 0;
		++$sequence;

		$enrollment_data = wp_parse_args(
			$args,
			array(
				'user_id'    => $sequence,
				'user_email' => "student{$sequence}@example.org",
				'course_id'  => 300000 + $sequence,
				'status'     => 'enrolled',
			)
		);

		return Enrollment::update_enrollment( $enrollment_data );
	}
}
