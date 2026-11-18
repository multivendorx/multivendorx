<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Stores' states/products/withdraw lookups.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Stores.php.
 *
 * This is the plugin's largest REST controller (1695 lines) - only a few of
 * its self-contained, independently-callable methods are covered here;
 * get_items()/create_item()/update_item() need a much larger fixture chain
 * and are left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Stores::get_states_by_country(),
 * get_store_products_and_category(), and get_stores_with_pending_withdraw()
 * (private, via reflection).
 */
class MultiVendorX_Stores_Test extends WP_UnitTestCase {

	/**
	 * Running counter so repeated calls within one test don't collide.
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

	/**
	 * Call the private get_stores_with_pending_withdraw() method via reflection.
	 *
	 * @return array
	 */
	private function call_get_stores_with_pending_withdraw() {
		$rest       = new \MultiVendorX\RestAPI\Controllers\Stores();
		$reflection = new \ReflectionMethod( $rest, 'get_stores_with_pending_withdraw' );
		$reflection->setAccessible( true );

		return $reflection->invoke( $rest, new \WP_REST_Request() );
	}

	/**
	 * Get_states_by_country() returns a label/value pair list for a real country.
	 *
	 * @return void
	 */
	public function test_get_states_by_country_returns_label_value_pairs() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Stores();
		$request = new \WP_REST_Request();
		$request->set_param( 'country', 'US' );

		$response = $rest->get_states_by_country( $request );
		$data     = $response->get_data();

		$this->assertNotEmpty( $data );
		$this->assertArrayHasKey( 'label', $data[0] );
		$this->assertArrayHasKey( 'value', $data[0] );
	}

	/**
	 * Get_states_by_country() returns an empty list for a country with no
	 * WooCommerce-defined states, rather than a fatal error.
	 *
	 * @return void
	 */
	public function test_get_states_by_country_returns_empty_list_for_unknown_country() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Stores();
		$request = new \WP_REST_Request();
		$request->set_param( 'country', 'ZZ' );

		$response = $rest->get_states_by_country( $request );

		$this->assertSame( array(), $response->get_data() );
	}

	/**
	 * Get_store_products_and_category() rejects a missing/zero store ID.
	 *
	 * @return void
	 */
	public function test_get_store_products_and_category_rejects_invalid_id() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Stores();
		$request = new \WP_REST_Request();

		$result = $rest->get_store_products_and_category( $request );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_store_id', $result->get_error_code() );
	}

	/**
	 * Get_stores_with_pending_withdraw() only lists stores with a non-zero
	 * pending withdrawal amount.
	 *
	 * @return void
	 */
	public function test_get_stores_with_pending_withdraw_filters_to_stores_with_a_request() {
		$store_with_request = $this->create_store( array( 'name' => 'Withdrawing Store' ) );
		$store_with_request->update_meta( \MultiVendorX\Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'], 50 );

		$store_without_request = $this->create_store( array( 'name' => 'Quiet Store' ) );

		$result = $this->call_get_stores_with_pending_withdraw();
		$ids    = array_column( $result, 'id' );

		$this->assertContains( $store_with_request->get_id(), $ids );
		$this->assertNotContains( $store_without_request->get_id(), $ids );
	}
}
