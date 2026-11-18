<?php
/**
 * Tests for MooWoodle\Core\Category's custom-table query/write logic.
 *
 * @package MooWoodle
 */

use MooWoodle\Core\Category;

/**
 * MooWoodle_Tests_Category class.
 */
class MooWoodle_Tests_Category extends MooWoodle_Unit_Test_Case {

	/**
	 * Update_course_category() should reject data with a missing 'id'.
	 *
	 * @return void
	 */
	public function test_update_course_category_rejects_missing_id() {
		$result = Category::update_course_category( array( 'name' => 'No ID' ) );

		$this->assertFalse( $result );
	}

	/**
	 * Update_course_category() should insert a row retrievable via get_course_categories().
	 *
	 * @return void
	 */
	public function test_update_course_category_inserts_row() {
		MooWoodle_Helper_Category::create_category(
			array(
				'id'   => 11,
				'name' => 'Science',
			)
		);

		$found = Category::get_course_categories( 11 );

		$this->assertCount( 1, $found );
		$this->assertSame( 'Science', $found[0]['name'] );
	}

	/**
	 * Update_course_category() called twice with the same 'id' should replace
	 * the row in place (via $wpdb->replace()), not create a duplicate.
	 *
	 * @return void
	 */
	public function test_update_course_category_replaces_existing_row() {
		MooWoodle_Helper_Category::create_category(
			array(
				'id'   => 22,
				'name' => 'Old Name',
			)
		);
		MooWoodle_Helper_Category::create_category(
			array(
				'id'   => 22,
				'name' => 'New Name',
			)
		);

		$found = Category::get_course_categories( 22 );

		$this->assertCount( 1, $found );
		$this->assertSame( 'New Name', $found[0]['name'] );
	}

	/**
	 * Get_course_categories() with no arguments should return every category row,
	 * exercising the %i-only (no WHERE clause) prepared-query path.
	 *
	 * @return void
	 */
	public function test_get_course_categories_returns_all_when_no_ids_given() {
		MooWoodle_Helper_Category::create_category( array( 'id' => 31 ) );
		MooWoodle_Helper_Category::create_category( array( 'id' => 32 ) );

		$found = Category::get_course_categories();

		$this->assertCount( 2, $found );
	}

	/**
	 * Get_course_categories() should accept an array of IDs, exercising the
	 * multi-placeholder IN(...) prepared-query path.
	 *
	 * @return void
	 */
	public function test_get_course_categories_filters_by_id_array() {
		MooWoodle_Helper_Category::create_category( array( 'id' => 41 ) );
		MooWoodle_Helper_Category::create_category( array( 'id' => 42 ) );
		MooWoodle_Helper_Category::create_category( array( 'id' => 43 ) );

		$found = Category::get_course_categories( array( 41, 43 ) );

		$this->assertCount( 2, $found );
		$found_ids = wp_list_pluck( $found, 'id' );
		$this->assertContains( '41', $found_ids );
		$this->assertContains( '43', $found_ids );
		$this->assertNotContains( '42', $found_ids );
	}

	/**
	 * Get_course_categories() with an unknown ID should return an empty array.
	 *
	 * @return void
	 */
	public function test_get_course_categories_returns_empty_for_unknown_id() {
		$found = Category::get_course_categories( 9999 );

		$this->assertIsArray( $found );
		$this->assertCount( 0, $found );
	}
}
