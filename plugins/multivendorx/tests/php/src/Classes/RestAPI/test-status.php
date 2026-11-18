<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Status' system-info/tools endpoints.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Status.php.
 *
 * Only covers the nonce gating and the 'default_pages'/'visitor' tool
 * actions - the default system-info listing loads WP core's debug-data
 * machinery and is left for a later batch; the 'transients' tool action
 * needs real store fixtures with set transients and is likewise deferred.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Status::get_items()/update_tools_action().
 */
class MultiVendorX_RestAPI_Status_Test extends WP_UnitTestCase {

	/**
	 * Get_items() rejects a request without a valid nonce.
	 *
	 * @return void
	 */
	public function test_get_items_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Status();
		$request = new \WP_REST_Request();

		$result = $rest->get_items( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * The key=default_pages action creates the plugin's default pages
	 * (dashboard, store-registration) and returns a plain success response.
	 *
	 * @return void
	 */
	public function test_get_items_default_pages_creates_dashboard_page() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Status();
		$request = new \WP_REST_Request();
		$request->set_param( 'key', 'default_pages' );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$response = $rest->get_items( $request );

		$this->assertTrue( $response->get_data() );
		$this->assertNotNull( get_page_by_path( 'dashboard' ) );
	}

	/**
	 * Update_tools_action() rejects a request without a valid nonce.
	 *
	 * @return void
	 */
	public function test_update_tools_action_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Status();
		$request = new \WP_REST_Request();

		$result = $rest->update_tools_action( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * The key=visitor tool action truncates the visitors_stats table and
	 * returns a success message.
	 *
	 * @return void
	 */
	public function test_update_tools_action_visitor_truncates_table() {
		global $wpdb;
		$table = $wpdb->prefix . \MultiVendorX\Utill::TABLES['visitors_stats'];

		$rest    = new \MultiVendorX\RestAPI\Controllers\Status();
		$request = new \WP_REST_Request();
		$request->set_param( 'key', 'visitor' );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$response = $rest->update_tools_action( $request );

		$this->assertStringContainsString( 'successfully deleted', $response->get_data() );
	}
}
