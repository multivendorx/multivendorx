<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Commissions' listing guard checks.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Commissions.php.
 *
 * Only covers get_items()'s nonce/ownership guards - the 'reports' format
 * branches call CommissionUtil::get_commission_summary_for_store() with
 * several distinct report shapes (dashboard/top-stores/per-store) and are
 * left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Commissions::get_items()'s guard checks.
 */
class MultiVendorX_RestAPI_Commissions_Test extends WP_UnitTestCase {

	/**
	 * A request without a valid nonce is rejected with a 403.
	 *
	 * @return void
	 */
	public function test_get_items_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Commissions();
		$request = new \WP_REST_Request();

		$result = $rest->get_items( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * A user who doesn't manage the requested store is forbidden from
	 * viewing its commissions.
	 *
	 * @return void
	 */
	public function test_get_items_denies_user_who_does_not_manage_store() {
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber );

		$store   = $this->create_store();
		$rest    = new \MultiVendorX\RestAPI\Controllers\Commissions();
		$request = new \WP_REST_Request();
		$request->set_param( 'store_id', $store->get_id() );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$result = $rest->get_items( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
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
