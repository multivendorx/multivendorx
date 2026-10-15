<?php
/**
 * Tests for MultiVendorX\Announcement\Rest's GET /announcements listing.
 *
 * Path mirrors the source file under test: modules/Announcement/Rest.php.
 *
 * Registers this controller's routes directly against a fresh WP_REST_Server
 * rather than relying on the module-activation system, matching the pattern
 * already used for the other REST controller tests in this suite.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Announcement\Rest::get_items()'s permission/filtering/status-count behavior.
 */
class MultiVendorX_Announcement_Rest_Test extends WP_UnitTestCase {

	/**
	 * The REST server this test registers the controller's routes against.
	 *
	 * @var \WP_REST_Server
	 */
	private $server;

	/**
	 * Register the Announcement controller's routes on a fresh REST server.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$this->server   = new \WP_REST_Server();
		$wp_rest_server = $this->server; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- required to make rest_do_request() route through our test server.

		( new \MultiVendorX\Announcement\Rest() )->register_routes();
	}

	/**
	 * Build a GET request for the endpoint, with a valid REST nonce attached.
	 *
	 * @param array $params Query params to attach.
	 * @return \WP_REST_Request
	 */
	private function build_request( array $params = array() ): \WP_REST_Request {
		$request = new \WP_REST_Request( 'GET', '/multivendorx/v1/announcements' );
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		return $request;
	}

	/**
	 * A request without a valid nonce is rejected with 403.
	 *
	 * @return void
	 */
	public function test_get_items_rejects_request_without_valid_nonce() {
		$request  = new \WP_REST_Request( 'GET', '/multivendorx/v1/announcements' );
		$response = $this->server->dispatch( $request );

		$this->assertSame( 403, $response->get_status() );
	}

	/**
	 * An admin sees announcements regardless of status, and the response
	 * carries per-status count headers.
	 *
	 * @return void
	 */
	public function test_get_items_as_admin_returns_status_count_headers() {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		self::factory()->post->create(
			array(
				'post_type'   => \MultiVendorX\Utill::POST_TYPES['announcement'],
				'post_status' => 'publish',
			)
		);
		self::factory()->post->create(
			array(
				'post_type'   => \MultiVendorX\Utill::POST_TYPES['announcement'],
				'post_status' => 'draft',
			)
		);

		$response = $this->server->dispatch( $this->build_request() );
		$headers  = $response->get_headers();

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 2, (int) $headers['X-WP-Total'] );
		$this->assertSame( 1, (int) $headers['X-WP-Status-Publish'] );
		$this->assertSame( 1, (int) $headers['X-WP-Status-Draft'] );
	}

	/**
	 * A non-admin (store owner) only ever sees published announcements,
	 * regardless of what status filter they pass - the controller forces
	 * status_param to 'publish' for non-admins.
	 *
	 * @return void
	 */
	public function test_get_items_as_non_admin_only_returns_published() {
		$store_owner_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $store_owner_id );

		self::factory()->post->create(
			array(
				'post_type'   => \MultiVendorX\Utill::POST_TYPES['announcement'],
				'post_status' => 'publish',
			)
		);
		self::factory()->post->create(
			array(
				'post_type'   => \MultiVendorX\Utill::POST_TYPES['announcement'],
				'post_status' => 'draft',
			)
		);

		// Non-admin status filter is ignored - forced to 'publish' internally.
		$response = $this->server->dispatch( $this->build_request( array( 'status' => 'draft' ) ) );
		$data     = $response->get_data();

		$this->assertSame( 200, $response->get_status() );
		$this->assertCount( 1, $data );
	}

	/**
	 * The page size floor of 10 applies even when a smaller "row" param is requested.
	 *
	 * @return void
	 */
	public function test_get_items_enforces_minimum_page_size_of_ten() {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		for ( $i = 0; $i < 12; $i++ ) {
			self::factory()->post->create(
				array(
					'post_type'   => \MultiVendorX\Utill::POST_TYPES['announcement'],
					'post_status' => 'publish',
				)
			);
		}

		// Request row=2 - should still get 10 back (the enforced floor), not 2.
		$response = $this->server->dispatch( $this->build_request( array( 'row' => 2 ) ) );

		$this->assertCount( 10, $response->get_data() );
	}
}
