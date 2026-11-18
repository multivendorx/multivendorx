<?php
/**
 * Tests for MultiVendorX\StoreShipping\Util's per-store shipping-method CRUD.
 *
 * Path mirrors the source file under test: modules/StoreShipping/Util.php.
 *
 * Only covers the store-meta-backed methods (get/update/delete_shipping_method) -
 * get_zones()/get_shipping_methods() depend on real WC_Shipping_Zone data and
 * are left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\StoreShipping\Util::get_shipping_method()/update_shipping_method()/delete_shipping_method().
 */
class MultiVendorX_StoreShipping_Util_Test extends WP_UnitTestCase {

	/**
	 * Get_shipping_method() returns a WP_Error for a method that was never configured.
	 *
	 * @return void
	 */
	public function test_get_shipping_method_returns_wp_error_when_not_found() {
		$store = $this->create_store();

		$result = \MultiVendorX\StoreShipping\Util::get_shipping_method( $store->get_id(), 'flat_rate', 1 );

		$this->assertWPError( $result );
	}

	/**
	 * Update_shipping_method() writes settings, and get_shipping_method()
	 * reads the same settings back.
	 *
	 * @return void
	 */
	public function test_update_shipping_method_then_get_shipping_method_round_trips() {
		$store = $this->create_store();

		\MultiVendorX\StoreShipping\Util::update_shipping_method(
			array(
				'store_id'  => $store->get_id(),
				'method_id' => 'flat_rate',
				'zone_id'   => 1,
				'settings'  => array(
					'title' => 'Flat Rate',
					'cost'  => '10',
				),
			)
		);

		$result = \MultiVendorX\StoreShipping\Util::get_shipping_method( $store->get_id(), 'flat_rate', 1 );

		$this->assertSame( 'flat_rate', $result['method_id'] );
		$this->assertSame( '10', $result['settings']['cost'] );
	}

	/**
	 * Delete_shipping_method() returns a WP_Error when nothing exists to delete.
	 *
	 * @return void
	 */
	public function test_delete_shipping_method_returns_wp_error_when_not_found() {
		$store = $this->create_store();

		$result = \MultiVendorX\StoreShipping\Util::delete_shipping_method( $store->get_id(), 1, 'flat_rate' );

		$this->assertWPError( $result );
	}

	/**
	 * Delete_shipping_method() removes a previously configured method -
	 * a subsequent get_shipping_method() no longer finds it.
	 *
	 * @return void
	 */
	public function test_delete_shipping_method_removes_configured_method() {
		$store = $this->create_store();

		\MultiVendorX\StoreShipping\Util::update_shipping_method(
			array(
				'store_id'  => $store->get_id(),
				'method_id' => 'local_pickup',
				'zone_id'   => 2,
				'settings'  => array( 'title' => 'Local Pickup' ),
			)
		);

		$result = \MultiVendorX\StoreShipping\Util::delete_shipping_method( $store->get_id(), 2, 'local_pickup' );
		$this->assertTrue( $result );

		$after = \MultiVendorX\StoreShipping\Util::get_shipping_method( $store->get_id(), 'local_pickup', 2 );
		$this->assertWPError( $after );
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
