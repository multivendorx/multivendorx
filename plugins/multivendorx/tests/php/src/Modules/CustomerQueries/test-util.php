<?php
/**
 * Tests for MultiVendorX\CustomerQueries\Util's question CRUD/query helpers.
 *
 * Path mirrors the source file under test: modules/CustomerQueries/Util.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\CustomerQueries\Util::insert_question()/update_question()/delete_question()/query_questions().
 */
class MultiVendorX_CustomerQueries_Util_Test extends WP_UnitTestCase {

	/**
	 * Insert_question() rejects a question missing any required field.
	 *
	 * @return void
	 */
	public function test_insert_question_rejects_missing_required_fields() {
		$result = \MultiVendorX\CustomerQueries\Util::insert_question(
			array(
				'product_id' => 1,
				// question_text and question_by are missing.
			)
		);

		$this->assertFalse( $result );
	}

	/**
	 * Insert_question() with all required fields inserts a row and returns its ID.
	 *
	 * @return void
	 */
	public function test_insert_question_inserts_a_row() {
		$id = \MultiVendorX\CustomerQueries\Util::insert_question(
			array(
				'product_id'    => 5,
				'question_text' => 'Does this fit size M?',
				'question_by'   => 1,
			)
		);

		$this->assertIsInt( $id );
		$this->assertGreaterThan( 0, $id );
	}

	/**
	 * Query_questions() filters by product_ids.
	 *
	 * @return void
	 */
	public function test_query_questions_filters_by_product_ids() {
		$this->create_question( array( 'product_id' => 10 ) );
		$this->create_question( array( 'product_id' => 20 ) );

		$results = \MultiVendorX\CustomerQueries\Util::query_questions( array( 'product_ids' => array( 10 ) ) );

		$this->assertCount( 1, $results );
		$this->assertSame( '10', $results[0]['product_id'] );
	}

	/**
	 * Query_questions() has_answer only returns questions with a non-empty answer.
	 *
	 * @return void
	 */
	public function test_query_questions_has_answer_filters_to_answered_questions() {
		$this->create_question( array( 'answer_text' => 'Yes it does.' ) );
		$this->create_question( array( 'answer_text' => '' ) );

		$results = \MultiVendorX\CustomerQueries\Util::query_questions( array( 'has_answer' => true ) );

		$this->assertCount( 1, $results );
		$this->assertSame( 'Yes it does.', $results[0]['answer_text'] );
	}

	/**
	 * Query_questions() no_answer only returns questions without an answer.
	 *
	 * @return void
	 */
	public function test_query_questions_no_answer_filters_to_unanswered_questions() {
		$this->create_question( array( 'answer_text' => 'Answered.' ) );
		$this->create_question( array( 'answer_text' => '' ) );

		$results = \MultiVendorX\CustomerQueries\Util::query_questions( array( 'no_answer' => true ) );

		$this->assertCount( 1, $results );
		$this->assertSame( '', $results[0]['answer_text'] );
	}

	/**
	 * Query_questions() search matches against question_text.
	 *
	 * @return void
	 */
	public function test_query_questions_search_matches_question_text() {
		$this->create_question( array( 'question_text' => 'Is this waterproof?' ) );
		$this->create_question( array( 'question_text' => 'What colors are available?' ) );

		$results = \MultiVendorX\CustomerQueries\Util::query_questions( array( 'search' => 'waterproof' ) );

		$this->assertCount( 1, $results );
	}

	/**
	 * Query_questions() count mode returns an integer total.
	 *
	 * @return void
	 */
	public function test_query_questions_count_mode_returns_integer() {
		$this->create_question( array( 'store_id' => 30 ) );
		$this->create_question( array( 'store_id' => 30 ) );

		$count = \MultiVendorX\CustomerQueries\Util::query_questions(
			array(
				'store_id' => 30,
				'count'    => true,
			)
		);

		$this->assertSame( 2, $count );
	}

	/**
	 * Update_question() updates the given fields and returns true.
	 *
	 * @return void
	 */
	public function test_update_question_updates_fields() {
		$id = $this->create_question();

		$result = \MultiVendorX\CustomerQueries\Util::update_question(
			$id,
			array(
				'answer_text' => 'Here is the answer.',
				'answer_by'   => 2,
			)
		);

		$this->assertTrue( $result );

		$rows = \MultiVendorX\CustomerQueries\Util::query_questions( array( 'id' => $id ) );
		$this->assertSame( 'Here is the answer.', $rows[0]['answer_text'] );
	}

	/**
	 * Update_question() with no fields to update returns false rather than
	 * running a no-op query.
	 *
	 * @return void
	 */
	public function test_update_question_returns_false_for_empty_update() {
		$id = $this->create_question();

		$result = \MultiVendorX\CustomerQueries\Util::update_question( $id, array() );

		$this->assertFalse( $result );
	}

	/**
	 * Delete_question() removes the row and returns true.
	 *
	 * @return void
	 */
	public function test_delete_question_removes_the_row() {
		$id = $this->create_question();

		$result = \MultiVendorX\CustomerQueries\Util::delete_question( $id );

		$this->assertTrue( $result );
		$this->assertSame( array(), \MultiVendorX\CustomerQueries\Util::query_questions( array( 'id' => $id ) ) );
	}

	/**
	 * Delete_question() with an invalid/zero ID returns false without
	 * touching the database.
	 *
	 * @return void
	 */
	public function test_delete_question_rejects_invalid_id() {
		$this->assertFalse( \MultiVendorX\CustomerQueries\Util::delete_question( 0 ) );
	}

	/**
	 * Running counter so repeated calls within one test don't collide on
	 * product_id/store_id.
	 *
	 * @var int
	 */
	private static $question_sequence = 0;

	/**
	 * Insert a customer query (question) row directly, with sensible
	 * defaults for every NOT NULL column that has no database default.
	 *
	 * @param array $overrides Columns to override.
	 * @return int Inserted row ID.
	 */
	private function create_question( array $overrides = array() ): int {
		global $wpdb;

		++self::$question_sequence;

		$row = wp_parse_args(
			$overrides,
			array(
				'product_id'          => self::$question_sequence,
				'store_id'            => self::$question_sequence,
				'question_text'       => 'Test question ' . self::$question_sequence,
				'question_by'         => self::$question_sequence,
				'total_votes'         => 0,
				'voters'              => maybe_serialize( array() ),
				'answer_text'         => '',
				'question_visibility' => 'private',
				'question_date'       => current_time( 'mysql' ),
			)
		);

		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['customer_queries'];
		$wpdb->insert( $table, $row ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		return (int) $wpdb->insert_id;
	}
}
