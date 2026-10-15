<?php
/**
 * Tests for MultiVendorX\Intelligence\Util's AI-provider response parsing.
 *
 * Path mirrors the source file under test: modules/Intelligence/Util.php.
 *
 * Every call_*_api() method makes a real outbound wp_remote_post() to a
 * third-party AI provider with no mocking layer of its own - these tests
 * short-circuit that call via WordPress's own `pre_http_request` filter
 * (the standard way to test code built on wp_remote_*() without making a
 * real network request), rather than hitting Gemini/OpenAI/OpenRouter directly.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Intelligence\Util::call_gemini_api()/call_openai_api()/call_openrouter_api().
 */
class MultiVendorX_Intelligence_Util_Test extends WP_UnitTestCase {

	/**
	 * Registered pre_http_request filter callback for the current test, so it
	 * can be removed again in tearDown() without leaking into other tests.
	 *
	 * @var callable|null
	 */
	private $http_filter;

	/**
	 * Remove any pre_http_request short-circuit registered by a test.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		if ( $this->http_filter ) {
			remove_filter( 'pre_http_request', $this->http_filter );
			$this->http_filter = null;
		}

		parent::tearDown();
	}

	/**
	 * Short-circuit the next wp_remote_post() call with a canned response body.
	 *
	 * @param array $body Decoded response body to return.
	 * @return void
	 */
	private function mock_http_response( array $body ): void {
		$this->http_filter = function () use ( $body ) {
			return array(
				'response' => array( 'code' => 200 ),
				'body'     => wp_json_encode( $body ),
				'headers'  => array(),
			);
		};

		add_filter( 'pre_http_request', $this->http_filter, 10, 3 );
	}

	/**
	 * Call_gemini_api() extracts the generated text from Gemini's nested
	 * response shape and strips markdown code-fences.
	 *
	 * @return void
	 */
	public function test_call_gemini_api_extracts_and_cleans_text() {
		$this->mock_http_response(
			array(
				'candidates' => array(
					array( 'content' => array( 'parts' => array( array( 'text' => '```json{"ok":true}```' ) ) ) ),
				),
			)
		);

		$result = \MultiVendorX\Intelligence\Util::call_gemini_api( 'fake-key', 'prompt' );

		$this->assertSame( '{"ok":true}', $result );
	}

	/**
	 * Call_gemini_api() falls back to returning the raw decoded response when
	 * the expected text path isn't present (e.g. an API error payload).
	 *
	 * @return void
	 */
	public function test_call_gemini_api_returns_raw_response_when_text_missing() {
		$this->mock_http_response( array( 'error' => array( 'message' => 'Invalid API key' ) ) );

		$result = \MultiVendorX\Intelligence\Util::call_gemini_api( 'fake-key', 'prompt' );

		$this->assertSame( array( 'error' => array( 'message' => 'Invalid API key' ) ), $result );
	}

	/**
	 * Call_openai_api() extracts text from OpenAI's output array shape.
	 *
	 * @return void
	 */
	public function test_call_openai_api_extracts_and_cleans_text() {
		$this->mock_http_response(
			array(
				'output' => array(
					array( 'content' => array( array( 'text' => '```{"ok":true}```' ) ) ),
				),
			)
		);

		$result = \MultiVendorX\Intelligence\Util::call_openai_api( 'fake-key', 'prompt' );

		$this->assertSame( '{"ok":true}', $result );
	}

	/**
	 * Call_openrouter_api() extracts text from the OpenAI-compatible
	 * choices[0].message.content shape.
	 *
	 * @return void
	 */
	public function test_call_openrouter_api_extracts_and_cleans_text() {
		$this->mock_http_response(
			array(
				'choices' => array(
					array( 'message' => array( 'content' => '```json{"ok":true}```' ) ),
				),
			)
		);

		$result = \MultiVendorX\Intelligence\Util::call_openrouter_api( 'fake-key', 'prompt' );

		$this->assertSame( '{"ok":true}', $result );
	}
	// NOTE: a transport failure (wp_remote_post() returning a WP_Error) is not
	// covered here. Tracing the code, request() returns the WP_Error as-is,
	// but every call_*_api() method then does array-offset access directly on
	// that return value (e.g. $api_response['candidates'][0]...) without an
	// is_wp_error() check first - WP_Error doesn't implement ArrayAccess, so
	// this likely throws a PHP Error rather than returning the WP_Error
	// gracefully. Not asserting this without being able to execute and
	// confirm the exact failure mode in this environment - flagging as a
	// likely bug instead of guessing at the right assertion.
}
