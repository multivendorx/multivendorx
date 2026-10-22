<?php
/**
 * Tests for MooWoodle\Util's pure-logic helpers.
 *
 * @package MooWoodle
 */

use MooWoodle\Util;

/**
 * MooWoodle_Tests_Util class.
 */
class MooWoodle_Tests_Util extends MooWoodle_Unit_Test_Case {

	/**
	 * Wp_to_react_date_format() should translate every documented PHP token.
	 *
	 * @return void
	 */
	public function test_wp_to_react_date_format_translates_known_tokens() {
		$this->assertSame( 'YYYY-MM-DD', Util::wp_to_react_date_format( 'Y-m-d' ) );
		$this->assertSame( 'DD/MM/YYYY', Util::wp_to_react_date_format( 'd/m/Y' ) );
		$this->assertSame( 'YYYY-MM-DD HH:mm:ss', Util::wp_to_react_date_format( 'Y-m-d H:i:s' ) );
		$this->assertSame( 'dddd, MMMM D, YYYY', Util::wp_to_react_date_format( 'l, F j, Y' ) );
	}

	/**
	 * Characters outside the token map (separators, punctuation) must pass through untouched.
	 *
	 * @return void
	 */
	public function test_wp_to_react_date_format_preserves_unmapped_characters() {
		$this->assertSame( 'YYYY.MM.DD', Util::wp_to_react_date_format( 'Y.m.d' ) );
		$this->assertSame( '', Util::wp_to_react_date_format( '' ) );
	}

	/**
	 * Current_user_has_capability() should return true when the current user holds
	 * at least one of the listed capabilities/roles.
	 *
	 * @return void
	 */
	public function test_current_user_has_capability_true_for_admin() {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$this->assertTrue( Util::current_user_has_capability( array( 'manage_options' ) ) );
	}

	/**
	 * Current_user_has_capability() should return false for a user lacking every
	 * listed capability/role.
	 *
	 * @return void
	 */
	public function test_current_user_has_capability_false_for_subscriber() {
		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber_id );

		$this->assertFalse( Util::current_user_has_capability( array( 'manage_options' ) ) );
	}
}
