<?php
/**
 * Tests for MultiVendorX\WPML\Rest's nonce/availability gating.
 *
 * Path mirrors the source file under test: modules/WPML/Rest.php.
 *
 * Only covers the two checks reachable without the real WPML plugin
 * installed (nonce verification, and the ICL_SITEPRESS_VERSION guard that
 * every call falls through to) - the actual translation-listing logic needs
 * WPML's $sitepress/$wpml_post_translations globals and is left for later.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\WPML\Rest::get_items()'s nonce check and WPML-not-active handling.
 */
class MultiVendorX_WPML_Rest_Test extends WP_UnitTestCase {

	/**
	 * A request without a valid nonce is rejected with a 403 before WPML is
	 * even checked.
	 *
	 * @return void
	 */
	public function test_get_items_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\WPML\Rest();
		$request = new \WP_REST_Request( 'GET', '/multivendorx/v1/wpml' );

		$result = $rest->get_items( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * With a valid nonce but WPML not installed (ICL_SITEPRESS_VERSION
	 * undefined, as in this test environment), get_items() returns a 400
	 * WP_Error rather than a fatal error on undefined globals.
	 *
	 * @return void
	 */
	public function test_get_items_returns_wp_error_when_wpml_not_active() {
		$rest    = new \MultiVendorX\WPML\Rest();
		$request = new \WP_REST_Request( 'GET', '/multivendorx/v1/wpml' );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$result = $rest->get_items( $request );

		$this->assertWPError( $result );
		$this->assertSame( 'WPML_failed', $result->get_error_code() );
	}
}
