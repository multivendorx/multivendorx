<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Logs' log listing/download.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Logs.php.
 *
 * download_log()'s success path calls exit() after streaming the file, which
 * would halt the whole PHPUnit process if actually reached - only its
 * nonce-rejection and file-not-found paths (both return cleanly) are covered.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Logs::get_items()/download_log().
 */
class MultiVendorX_RestAPI_Logs_Test extends WP_UnitTestCase {

	/**
	 * Get_items() rejects a request without a valid nonce.
	 *
	 * @return void
	 */
	public function test_get_items_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Logs();
		$request = new \WP_REST_Request();

		$result = $rest->get_items( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * With no log file on disk, the default listing returns an empty array
	 * rather than a fatal error.
	 *
	 * @return void
	 */
	public function test_get_items_returns_empty_array_when_no_log_file_exists() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Logs();
		$request = new \WP_REST_Request();
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$response = $rest->get_items( $request );

		$this->assertSame( array(), $response->get_data() );
	}

	/**
	 * Download_log() rejects a request without a valid nonce.
	 *
	 * @return void
	 */
	public function test_download_log_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Logs();
		$request = new \WP_REST_Request();

		$result = $rest->download_log( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * Download_log() returns a 404 when the referenced log file doesn't exist
	 * on disk - it never reaches the exit()-calling success path in that case.
	 *
	 * @return void
	 */
	public function test_download_log_returns_404_when_file_missing() {
		update_option( \MultiVendorX\Utill::MULTIVENDORX_OTHER_SETTINGS['log_file'], 'this-log-file-does-not-exist.log' );

		$rest    = new \MultiVendorX\RestAPI\Controllers\Logs();
		$request = new \WP_REST_Request();
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$result = $rest->download_log( $request );

		$this->assertWPError( $result );
		$this->assertSame( 404, $result->get_error_data()['status'] );
	}
}
