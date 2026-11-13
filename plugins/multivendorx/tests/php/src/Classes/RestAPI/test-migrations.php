<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Migrations' action dispatch.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Migrations.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Migrations::process_action()/import_stores()/import_products().
 */
class MultiVendorX_RestAPI_Migrations_Test extends WP_UnitTestCase {

	/**
	 * Build a POST request with a valid nonce and the given action.
	 *
	 * @param mixed $action Action name or array of names.
	 * @return \WP_REST_Request
	 */
	private function build_request( $action ): \WP_REST_Request {
		$request = new \WP_REST_Request( 'POST', '/multivendorx/v1/migrations' );
		$request->set_param( 'action', $action );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		return $request;
	}

	/**
	 * A request without a valid nonce is rejected with 403.
	 *
	 * @return void
	 */
	public function test_process_action_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Migrations();
		$request = new \WP_REST_Request( 'POST', '/multivendorx/v1/migrations' );
		$request->set_param( 'action', 'import_stores' );

		$result = $rest->process_action( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * An action not on the allowlist returns a clean "unknown action"
	 * payload rather than attempting to call an arbitrary method.
	 *
	 * @return void
	 */
	public function test_process_action_rejects_unknown_action() {
		$rest   = new \MultiVendorX\RestAPI\Controllers\Migrations();
		$result = $rest->process_action( $this->build_request( 'delete_everything' ) );

		$this->assertFalse( $result['success'] );
		$this->assertSame( 'Unknown action', $result['message'] );
	}

	/**
	 * When given an array of actions, the first allowlisted one found is dispatched.
	 *
	 * @return void
	 */
	public function test_process_action_dispatches_first_allowed_action_in_array() {
		$rest     = new \MultiVendorX\RestAPI\Controllers\Migrations();
		$response = $rest->process_action( $this->build_request( array( 'not_allowed', 'import_stores' ) ) );

		// import_stores() with no active legacy plugin returns success=false
		// with a specific message - proves it was actually dispatched, not
		// the generic "Unknown action" fallback.
		$data = $response->get_data();
		$this->assertSame( 'No active plugin found.', $data['message'] );
	}

	/**
	 * Import_stores() with no active legacy multivendor plugin returns a
	 * clean failure response rather than attempting to instantiate an
	 * unknown migrator class.
	 *
	 * @return void
	 */
	public function test_import_stores_returns_failure_when_no_legacy_plugin_active() {
		$rest     = new \MultiVendorX\RestAPI\Controllers\Migrations();
		$response = $rest->import_stores( $this->build_request( 'import_stores' ) );

		$data = $response->get_data();
		$this->assertFalse( $data['success'] );
		$this->assertSame( 'No active plugin found.', $data['message'] );
	}

	/**
	 * Import_products() with no active legacy multivendor plugin returns a
	 * clean failure response.
	 *
	 * @return void
	 */
	public function test_import_products_returns_failure_when_no_legacy_plugin_active() {
		$rest     = new \MultiVendorX\RestAPI\Controllers\Migrations();
		$response = $rest->import_products( $this->build_request( 'import_products' ) );

		$data = $response->get_data();
		$this->assertFalse( $data['success'] );
		$this->assertSame( 'No active plugin found.', $data['message'] );
	}
}
