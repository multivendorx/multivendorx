<?php
/**
 * Tests for MooWoodle\Core\Course's custom-table query/write logic.
 *
 * @package MooWoodle
 */

use MooWoodle\Core\Course;

/**
 * MooWoodle_Tests_Course class.
 */
class MooWoodle_Tests_Course extends MooWoodle_Unit_Test_Case {

	/**
	 * Update_course() should insert a new row when no record with the given
	 * moodle_course_id exists yet, and return the new insert ID.
	 *
	 * @return void
	 */
	public function test_update_course_inserts_new_row() {
		$course_id = MooWoodle_Helper_Course::create_course(
			array(
				'moodle_course_id' => 101,
				'shortname'        => 'cs101',
				'fullname'         => 'Intro to CS',
			)
		);

		$this->assertIsInt( $course_id );
		$this->assertGreaterThan( 0, $course_id );

		$found = Course::get_courses( array( 'moodle_course_id' => 101 ) );
		$this->assertCount( 1, $found );
		$this->assertSame( 'cs101', $found[0]['shortname'] );
	}

	/**
	 * Update_course() should update the existing row (not insert a duplicate)
	 * when a record with the given moodle_course_id already exists.
	 *
	 * @return void
	 */
	public function test_update_course_updates_existing_row() {
		$first_id = MooWoodle_Helper_Course::create_course(
			array(
				'moodle_course_id' => 202,
				'shortname'        => 'old-name',
				'fullname'         => 'Old Fullname',
			)
		);

		$second_id = MooWoodle_Helper_Course::create_course(
			array(
				'moodle_course_id' => 202,
				'shortname'        => 'new-name',
				'fullname'         => 'New Fullname',
			)
		);

		$this->assertSame( $first_id, $second_id );

		$found = Course::get_courses( array( 'moodle_course_id' => 202 ) );
		$this->assertCount( 1, $found );
		$this->assertSame( 'new-name', $found[0]['shortname'] );
	}

	/**
	 * Update_course() must reject data with a missing/zero moodle_course_id
	 * rather than inserting a malformed row.
	 *
	 * @return void
	 */
	public function test_update_course_rejects_missing_moodle_course_id() {
		$result = Course::update_course(
			array(
				'shortname' => 'no-course-id',
				'fullname'  => 'Missing ID',
			)
		);

		$this->assertFalse( $result );
	}

	/**
	 * Get_courses() should filter by the shortname/fullname LIKE filters,
	 * exercising the %i-table + %s-LIKE prepared-query path.
	 *
	 * @return void
	 */
	public function test_get_courses_filters_by_fullname_like() {
		MooWoodle_Helper_Course::create_course(
			array(
				'moodle_course_id' => 301,
				'fullname'         => 'Calculus Basics',
			)
		);
		MooWoodle_Helper_Course::create_course(
			array(
				'moodle_course_id' => 302,
				'fullname'         => 'Biology Basics',
			)
		);

		$found = Course::get_courses( array( 'fullname' => 'Calculus' ) );

		$this->assertCount( 1, $found );
		$this->assertSame( 301, (int) $found[0]['moodle_course_id'] );
	}

	/**
	 * Get_courses() with 'count' set should return an integer count rather
	 * than the row list, exercising the COUNT(*) branch of the query builder.
	 *
	 * @return void
	 */
	public function test_get_courses_count_mode_returns_integer() {
		MooWoodle_Helper_Course::create_course( array( 'moodle_course_id' => 401 ) );
		MooWoodle_Helper_Course::create_course( array( 'moodle_course_id' => 402 ) );

		$count = Course::get_courses( array( 'count' => true ) );

		$this->assertSame( 2, (int) $count );
	}

	/**
	 * Get_courses() should honor 'limit'/'offset' for pagination.
	 *
	 * @return void
	 */
	public function test_get_courses_respects_limit_and_offset() {
		for ( $i = 1; $i <= 3; $i++ ) {
			MooWoodle_Helper_Course::create_course( array( 'moodle_course_id' => 500 + $i ) );
		}

		$page = Course::get_courses(
			array(
				'limit'  => 1,
				'offset' => 1,
			)
		);

		$this->assertCount( 1, $page );
	}

	/**
	 * Get_courses() with no matches should return an empty array, not null/false.
	 *
	 * @return void
	 */
	public function test_get_courses_returns_empty_array_when_no_match() {
		$found = Course::get_courses( array( 'moodle_course_id' => 99999 ) );

		$this->assertIsArray( $found );
		$this->assertCount( 0, $found );
	}

	/**
	 * Cleanup_courses() should delete every course row whose ID isn't in the
	 * exclude list, and leave excluded rows untouched.
	 *
	 * @return void
	 */
	public function test_cleanup_courses_deletes_rows_not_excluded() {
		MooWoodle_Helper_Course::create_course(
			array(
				'moodle_course_id' => 601,
				'shortname'        => 'keep',
			)
		);
		MooWoodle_Helper_Course::create_course(
			array(
				'moodle_course_id' => 602,
				'shortname'        => 'remove',
			)
		);

		$keep_row = Course::get_courses(
			array(
				'moodle_course_id' => 601,
				'fields'           => 'id',
			)
		);
		$keep_id  = (int) $keep_row[0]['id'];

		Course::cleanup_courses( array( $keep_id ) );

		$remaining = Course::get_courses( array() );
		$this->assertCount( 1, $remaining );
		$this->assertSame( 601, (int) $remaining[0]['moodle_course_id'] );
	}

	/**
	 * Cleanup_courses() with an empty exclude list should be a no-op (nothing deleted),
	 * matching the method's own early-return guard.
	 *
	 * @return void
	 */
	public function test_cleanup_courses_noop_when_exclude_list_empty() {
		MooWoodle_Helper_Course::create_course( array( 'moodle_course_id' => 701 ) );

		Course::cleanup_courses( array() );

		$remaining = Course::get_courses( array() );
		$this->assertCount( 1, $remaining );
	}
}
