<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Dashboard's menu/endpoint listing.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Dashboard.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Dashboard::get_items()'s menuOnly gating.
 */
class MultiVendorX_RestAPI_Dashboard_Test extends WP_UnitTestCase {

	/**
	 * With menuOnly=true, only the core navigation endpoints are returned -
	 * the non-menu "other" endpoints (profile, notifications, setup-wizard)
	 * are excluded.
	 *
	 * @return void
	 */
	public function test_get_items_menu_only_excludes_other_endpoints() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Dashboard();
		$request = new \WP_REST_Request();
		$request->set_param( 'menuOnly', true );

		$response = $rest->get_items( $request );
		$data     = $response->get_data();

		$this->assertArrayHasKey( 'dashboard', $data );
		$this->assertArrayNotHasKey( 'profile', $data );
		$this->assertArrayNotHasKey( 'view-notifications', $data );
	}

	/**
	 * Without menuOnly, the "other" endpoints are merged in alongside the
	 * core navigation endpoints.
	 *
	 * @return void
	 */
	public function test_get_items_without_menu_only_includes_other_endpoints() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Dashboard();
		$request = new \WP_REST_Request();

		$response = $rest->get_items( $request );
		$data     = $response->get_data();

		$this->assertArrayHasKey( 'dashboard', $data );
		$this->assertArrayHasKey( 'profile', $data );
		$this->assertArrayHasKey( 'view-notifications', $data );
		$this->assertArrayHasKey( 'setup-wizard', $data );
	}
}
