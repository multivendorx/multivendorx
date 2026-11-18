<?php
/**
 * Category test-fixture helper.
 *
 * Mirrors WooCommerce's tests/legacy/framework/helpers/ pattern — a static
 * factory for the fixture, instead of repeating the same category array in
 * every test.
 *
 * @package MooWoodle
 */

use MooWoodle\Core\Category;

/**
 * MooWoodle_Helper_Category class.
 */
class MooWoodle_Helper_Category {

	/**
	 * Create a category row.
	 *
	 * @param array $args Overrides for the default category fields.
	 * @return array The arguments the row was created with (includes 'id').
	 */
	public static function create_category( $args = array() ) {
		static $sequence = 0;
		++$sequence;

		$category_data = wp_parse_args(
			$args,
			array(
				'id'        => 200000 + $sequence,
				'name'      => "Category {$sequence}",
				'parent_id' => 0,
			)
		);

		Category::update_course_category( $category_data );

		return $category_data;
	}
}
