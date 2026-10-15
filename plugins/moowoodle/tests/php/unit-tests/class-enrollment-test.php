<?php
/**
 * Tests for MooWoodle\Enrollment's custom-table query/write logic.
 *
 * @package MooWoodle
 */

use MooWoodle\Enrollment;

/**
 * MooWoodle_Tests_Enrollment class.
 */
class MooWoodle_Tests_Enrollment extends MooWoodle_Unit_Test_Case {

	/**
	 * Update_enrollment() with no 'id' should insert a new row and return its insert ID.
	 *
	 * @return void
	 */
	public function test_update_enrollment_inserts_new_row() {
		$enrollment_id = MooWoodle_Helper_Enrollment::create_enrollment( array( 'status' => 'enrolled' ) );

		$this->assertIsInt( $enrollment_id );
		$this->assertGreaterThan( 0, $enrollment_id );

		$found = Enrollment::get_enrollments( array( 'id' => $enrollment_id ) );
		$this->assertCount( 1, $found );
		$this->assertSame( 'enrolled', $found[0]['status'] );
	}

	/**
	 * Update_enrollment() with an 'id' should update that row in place rather
	 * than inserting a new one.
	 *
	 * @return void
	 */
	public function test_update_enrollment_updates_existing_row_by_id() {
		$enrollment_id = MooWoodle_Helper_Enrollment::create_enrollment( array( 'status' => 'enrolled' ) );

		$result = Enrollment::update_enrollment(
			array(
				'id'     => $enrollment_id,
				'status' => 'completed',
			)
		);

		$this->assertSame( $enrollment_id, $result );

		$found = Enrollment::get_enrollments( array( 'id' => $enrollment_id ) );
		$this->assertSame( 'completed', $found[0]['status'] );
	}

	/**
	 * Get_enrollments() should filter by user_email case-insensitively, exercising
	 * the LOWER(user_email) = %s prepared-query fragment.
	 *
	 * @return void
	 */
	public function test_get_enrollments_filters_by_email_case_insensitively() {
		MooWoodle_Helper_Enrollment::create_enrollment( array( 'user_email' => 'Student3@Example.org' ) );

		$found = Enrollment::get_enrollments( array( 'user_email' => 'student3@example.org' ) );

		$this->assertCount( 1, $found );
	}

	/**
	 * Get_enrollments() should filter by a plain integer field (course_id),
	 * exercising the single %d placeholder prepared-query fragment.
	 *
	 * @return void
	 */
	public function test_get_enrollments_filters_by_course_id() {
		MooWoodle_Helper_Enrollment::create_enrollment(
			array(
				'user_id'   => 4,
				'course_id' => 40,
			)
		);
		MooWoodle_Helper_Enrollment::create_enrollment(
			array(
				'user_id'   => 5,
				'course_id' => 41,
			)
		);

		$found = Enrollment::get_enrollments( array( 'course_id' => 40 ) );

		$this->assertCount( 1, $found );
		$this->assertSame( 4, (int) $found[0]['user_id'] );
	}

	/**
	 * Get_enrollments() should accept an array of IDs for the 'id' filter,
	 * exercising the IN(...) list-building path (cast to int, not placeholder-based).
	 *
	 * @return void
	 */
	public function test_get_enrollments_filters_by_id_array() {
		$id_a = MooWoodle_Helper_Enrollment::create_enrollment();
		$id_b = MooWoodle_Helper_Enrollment::create_enrollment();
		MooWoodle_Helper_Enrollment::create_enrollment();

		$found = Enrollment::get_enrollments( array( 'id' => array( $id_a, $id_b ) ) );

		$this->assertCount( 2, $found );
	}

	/**
	 * Get_enrollments() with 'count' set should return an integer count.
	 *
	 * @return void
	 */
	public function test_get_enrollments_count_mode_returns_integer() {
		MooWoodle_Helper_Enrollment::create_enrollment();
		MooWoodle_Helper_Enrollment::create_enrollment();

		$count = Enrollment::get_enrollments( array( 'count' => true ) );

		$this->assertSame( 2, (int) $count );
	}

	/**
	 * Get_enrollments() with no matches should return an empty array, not null/false.
	 *
	 * @return void
	 */
	public function test_get_enrollments_returns_empty_array_when_no_match() {
		$found = Enrollment::get_enrollments( array( 'course_id' => 999999 ) );

		$this->assertIsArray( $found );
		$this->assertCount( 0, $found );
	}
}
