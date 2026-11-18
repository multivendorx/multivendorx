<?php
/**
 * Course test-fixture helper.
 *
 * Mirrors WooCommerce's tests/legacy/framework/helpers/class-wc-helper-product.php
 * pattern: a static factory other tests call to get a ready-made fixture,
 * instead of repeating the same course array in every test.
 *
 * @package MooWoodle
 */

use MooWoodle\Core\Course;

/**
 * MooWoodle_Helper_Course class.
 */
class MooWoodle_Helper_Course {

	/**
	 * Create a course row and return its insert ID.
	 *
	 * @param array $args Overrides for the default course fields.
	 * @return int Insert ID of the created course row.
	 */
	public static function create_course( $args = array() ) {
		static $sequence = 0;
		++$sequence;

		$course_data = wp_parse_args(
			$args,
			array(
				'moodle_course_id' => 100000 + $sequence,
				'shortname'        => "course-{$sequence}",
				'fullname'         => "Test Course {$sequence}",
				'category_id'      => 1,
				'startdate'        => 1000,
				'enddate'          => 2000,
			)
		);

		return Course::update_course( $course_data );
	}
}
