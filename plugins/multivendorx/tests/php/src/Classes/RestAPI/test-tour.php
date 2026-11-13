<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Tour's store/admin tour status.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Tour.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Tour::get_items()/create_item() in
 * both store and admin context.
 */
class MultiVendorX_RestAPI_Tour_Test extends WP_UnitTestCase {

	/**
	 * Build a request with a valid nonce and the given params.
	 *
	 * @param array $params Params to attach.
	 * @return \WP_REST_Request
	 */
	private function build_request( array $params = array() ): \WP_REST_Request {
		$request = new \WP_REST_Request();
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		return $request;
	}

	/**
	 * Get_items() rejects a request without a valid nonce.
	 *
	 * @return void
	 */
	public function test_get_items_rejects_request_without_valid_nonce() {
		$rest   = new \MultiVendorX\RestAPI\Controllers\Tour();
		$result = $rest->get_items( new \WP_REST_Request() );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * A non-admin user is forbidden from reading the admin-context tour status.
	 *
	 * @return void
	 */
	public function test_get_items_denies_non_admin_for_admin_context() {
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber );

		$rest   = new \MultiVendorX\RestAPI\Controllers\Tour();
		$result = $rest->get_items( $this->build_request() );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * Admin context reflects the real tour_completed option.
	 *
	 * @return void
	 */
	public function test_get_items_admin_context_reflects_option() {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		update_option( \MultiVendorX\Utill::MULTIVENDORX_OTHER_SETTINGS['tour_completed'], true );

		$rest   = new \MultiVendorX\RestAPI\Controllers\Tour();
		$result = $rest->get_items( $this->build_request() );

		$this->assertTrue( $result['completed'] );
	}

	/**
	 * Store context reflects that specific store's own tour-completed meta.
	 *
	 * @return void
	 */
	public function test_get_items_store_context_reflects_store_meta() {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$store = $this->create_store();
		$store->update_meta( \MultiVendorX\Utill::STORE_SETTINGS_KEYS['store_tour_completed'], true );

		$rest   = new \MultiVendorX\RestAPI\Controllers\Tour();
		$result = $rest->get_items( $this->build_request( array( 'store_id' => $store->get_id() ) ) );

		$this->assertTrue( $result['completed'] );
	}

	/**
	 * A user who doesn't manage the given store is forbidden from reading
	 * its tour status.
	 *
	 * @return void
	 */
	public function test_get_items_denies_user_who_does_not_manage_store() {
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber );

		$store  = $this->create_store();
		$rest   = new \MultiVendorX\RestAPI\Controllers\Tour();
		$result = $rest->get_items( $this->build_request( array( 'store_id' => $store->get_id() ) ) );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * Create_item() in admin context persists to the tour_completed option.
	 *
	 * @return void
	 */
	public function test_create_item_admin_context_updates_option() {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$rest   = new \MultiVendorX\RestAPI\Controllers\Tour();
		$result = $rest->create_item( $this->build_request( array( 'completed' => true ) ) );

		$this->assertTrue( $result['success'] );
		$this->assertTrue( get_option( \MultiVendorX\Utill::MULTIVENDORX_OTHER_SETTINGS['tour_completed'] ) );
	}

	/**
	 * Create_item() in store context persists to that store's own meta.
	 *
	 * @return void
	 */
	public function test_create_item_store_context_updates_store_meta() {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$store = $this->create_store();
		$rest  = new \MultiVendorX\RestAPI\Controllers\Tour();

		$result = $rest->create_item(
			$this->build_request(
				array(
					'store_id'  => $store->get_id(),
					'completed' => true,
				)
			)
		);

		$this->assertTrue( $result['success'] );

		// Store::update_meta() writes straight to the DB without refreshing
		// any in-memory/static Store cache, and Store::load() has its own
		// static cache that a fresh "new Store($id)" would hit too - query
		// the store_meta table directly rather than fighting either cache.
		global $wpdb;
		$value = $wpdb->get_var(
			$wpdb->prepare(
				'SELECT meta_value FROM %i WHERE store_id = %d AND meta_key = %s',
				$wpdb->prefix . \MultiVendorX\Utill::TABLES['store_meta'],
				$store->get_id(),
				\MultiVendorX\Utill::STORE_SETTINGS_KEYS['store_tour_completed']
			)
		); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.

		$this->assertSame( '1', $value );
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
