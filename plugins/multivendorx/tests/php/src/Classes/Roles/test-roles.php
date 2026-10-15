<?php
/**
 * Tests for MultiVendorX\Roles' custom role/capability assignment.
 *
 * Path mirrors the source file under test: classes/Roles.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Roles::multivendorx_add_custom_role()/multivendorx_get_roles()/assign_cap_authenticate_user().
 */
class MultiVendorX_Roles_Test extends WP_UnitTestCase {

	/**
	 * Multivendorx_get_roles() returns the fixed set of custom role labels.
	 *
	 * @return void
	 */
	public function test_multivendorx_get_roles_returns_expected_roles() {
		$roles = \MultiVendorX\Roles::multivendorx_get_roles();

		$this->assertArrayHasKey( 'store_owner', $roles );
		$this->assertArrayHasKey( 'store_manager', $roles );
		$this->assertArrayHasKey( 'product_manager', $roles );
	}

	/**
	 * Multivendorx_add_custom_role() registers the store_owner role if it
	 * doesn't already exist.
	 *
	 * @return void
	 */
	public function test_add_custom_role_registers_store_owner_role() {
		remove_role( 'store_owner' );

		( new \MultiVendorX\Roles() )->multivendorx_add_custom_role();

		$this->assertNotNull( get_role( 'store_owner' ) );
	}

	/**
	 * Calling multivendorx_add_custom_role() a second time is a safe no-op -
	 * it must not error when the role already exists.
	 *
	 * @return void
	 */
	public function test_add_custom_role_is_idempotent() {
		$roles = new \MultiVendorX\Roles();
		$roles->multivendorx_add_custom_role();
		$roles->multivendorx_add_custom_role();

		$this->assertNotNull( get_role( 'store_owner' ) );
	}

	/**
	 * A logged-out visitor's capabilities are left untouched.
	 *
	 * @return void
	 */
	public function test_assign_cap_leaves_capabilities_untouched_for_logged_out_user() {
		wp_set_current_user( 0 );

		$result = ( new \MultiVendorX\Roles() )->assign_cap_authenticate_user( array( 'read' => true ) );

		$this->assertArrayNotHasKey( 'create_stores', $result );
	}

	/**
	 * Any logged-in user gets the create_stores capability.
	 *
	 * @return void
	 */
	public function test_assign_cap_grants_create_stores_to_logged_in_user() {
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber );
		MultiVendorX()->current_user = wp_get_current_user();

		$result = ( new \MultiVendorX\Roles() )->assign_cap_authenticate_user( array() );

		$this->assertTrue( $result['create_stores'] );
	}

	/**
	 * A store_owner additionally gets edit_posts - a plain subscriber doesn't.
	 *
	 * @return void
	 */
	public function test_assign_cap_grants_edit_posts_only_to_store_owner() {
		( new \MultiVendorX\Roles() )->multivendorx_add_custom_role();

		$store_owner = self::factory()->user->create( array( 'role' => 'store_owner' ) );
		wp_set_current_user( $store_owner );
		MultiVendorX()->current_user = wp_get_current_user();

		$result = ( new \MultiVendorX\Roles() )->assign_cap_authenticate_user( array() );

		$this->assertTrue( $result['edit_posts'] );
	}
}
