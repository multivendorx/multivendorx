<?php
/**
 * Tests for MultiVendorX\FollowStore\Rest's GET /follow-stores listing.
 *
 * Path mirrors the source file under test: modules/FollowStore/Rest.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\FollowStore\Rest::get_items()'s validation/permission/sorting behavior.
 */
class MultiVendorX_FollowStore_Rest_Test extends WP_UnitTestCase {

	/**
	 * Build a GET request with a valid nonce and the given params.
	 *
	 * @param array $params Params to attach.
	 * @return \WP_REST_Request
	 */
	private function build_request( array $params = array() ): \WP_REST_Request {
		$request = new \WP_REST_Request( 'GET', '/multivendorx/v1/follow-stores' );
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		return $request;
	}

	/**
	 * A request without a valid nonce is rejected with a 403.
	 *
	 * @return void
	 */
	public function test_get_items_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\FollowStore\Rest();
		$request = new \WP_REST_Request( 'GET', '/multivendorx/v1/follow-stores' );

		$result = $rest->get_items( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * A missing/zero store_id returns a soft error payload (200 with an
	 * "error" key), not a WP_Error - this endpoint's documented contract.
	 *
	 * @return void
	 */
	public function test_get_items_returns_soft_error_for_missing_store_id() {
		$rest     = new \MultiVendorX\FollowStore\Rest();
		$response = $rest->get_items( $this->build_request() );

		$this->assertSame( array( 'error' => 'Invalid store ID' ), $response->get_data() );
	}

	/**
	 * A store_id that doesn't correspond to any real store also returns the
	 * soft error payload.
	 *
	 * @return void
	 */
	public function test_get_items_returns_soft_error_for_nonexistent_store() {
		$rest     = new \MultiVendorX\FollowStore\Rest();
		$response = $rest->get_items( $this->build_request( array( 'store_id' => 999999 ) ) );

		$this->assertSame( array( 'error' => 'Store does not exists' ), $response->get_data() );
	}

	/**
	 * A user who doesn't manage the store is forbidden from viewing its followers.
	 *
	 * @return void
	 */
	public function test_get_items_denies_user_who_does_not_manage_the_store() {
		$store      = $this->create_store();
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber );

		$rest   = new \MultiVendorX\FollowStore\Rest();
		$result = $rest->get_items( $this->build_request( array( 'store_id' => $store->get_id() ) ) );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * For a store the admin manages, followers are returned newest-first by
	 * their recorded follow date, with a total-count header.
	 *
	 * @return void
	 */
	public function test_get_items_returns_followers_sorted_newest_first() {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$store = $this->create_store();
		$store->update_meta(
			\MultiVendorX\Utill::STORE_SETTINGS_KEYS['followers'],
			array(
				array(
					'email' => 'older@example.com',
					'date'  => '2024-01-01 00:00:00',
				),
				array(
					'email' => 'newer@example.com',
					'date'  => '2024-06-01 00:00:00',
				),
			)
		);

		$rest     = new \MultiVendorX\FollowStore\Rest();
		$response = $rest->get_items( $this->build_request( array( 'store_id' => $store->get_id() ) ) );

		$this->assertSame( 2, (int) $response->get_headers()['X-WP-Total'] );
	}

	/**
	 * Running counter so repeated calls within one test don't collide on
	 * name/slug.
	 *
	 * @var int
	 */
	private static $store_sequence = 0;

	/**
	 * Create and save a store with sensible defaults, overridable per call.
	 *
	 * @param array $overrides Store data to override the defaults with.
	 * @return \MultiVendorX\Store\Store
	 */
	private function create_store( array $overrides = array() ): \MultiVendorX\Store\Store {
		++self::$store_sequence;

		$data = wp_parse_args(
			$overrides,
			array(
				'name'   => 'Test Store ' . self::$store_sequence,
				'status' => 'active',
			)
		);

		$store = new \MultiVendorX\Store\Store();
		foreach ( $data as $key => $value ) {
			$store->set( $key, $value );
		}
		$store->save();

		return $store;
	}
}
