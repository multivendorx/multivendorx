<?php
/**
 * Tests for MultiVendorX\Order\StoreOrder's WC_Order wrapper.
 *
 * Path mirrors the source file under test: classes/Order/StoreOrder.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Order\StoreOrder's constructor forms, is_store_order(),
 * get_prop(), and the lazily-cached get_commission().
 */
class MultiVendorX_StoreOrder_Test extends WP_UnitTestCase {

	/**
	 * Constructing with an order ID looks the order up via wc_get_order().
	 *
	 * @return void
	 */
	public function test_constructing_with_id_loads_the_order() {
		$order = wc_create_order();

		$store_order = new \MultiVendorX\Order\StoreOrder( $order->get_id() );

		$this->assertSame( $order->get_id(), $store_order->get_order()->get_id() );
	}

	/**
	 * Constructing with a WC_Order object uses it directly, without a
	 * second wc_get_order() lookup.
	 *
	 * @return void
	 */
	public function test_constructing_with_order_object_uses_it_directly() {
		$order = wc_create_order();

		$store_order = new \MultiVendorX\Order\StoreOrder( $order );

		$this->assertSame( $order, $store_order->get_order() );
	}

	/**
	 * An order with no multivendorx_store_id meta is not a store order.
	 *
	 * @return void
	 */
	public function test_is_store_order_false_when_no_store_meta() {
		$order = wc_create_order();

		$store_order = new \MultiVendorX\Order\StoreOrder( $order );

		$this->assertFalse( $store_order->is_store_order() );
	}

	/**
	 * An order with multivendorx_store_id meta is a store order.
	 *
	 * @return void
	 */
	public function test_is_store_order_true_when_store_meta_present() {
		$order = wc_create_order();
		$order->update_meta_data( 'multivendorx_store_id', 42 );
		$order->save();

		$store_order = new \MultiVendorX\Order\StoreOrder( $order );

		$this->assertTrue( $store_order->is_store_order() );
	}

	/**
	 * Get_prop() reads the given key straight from the order's own meta.
	 *
	 * @return void
	 */
	public function test_get_prop_reads_order_meta() {
		$order = wc_create_order();
		$order->update_meta_data( 'some_custom_prop', 'custom-value' );
		$order->save();

		$store_order = new \MultiVendorX\Order\StoreOrder( $order );

		$this->assertSame( 'custom-value', $store_order->get_prop( 'some_custom_prop' ) );
	}

	/**
	 * Get_commission() is lazily constructed and cached - calling it twice
	 * returns the exact same Commission instance, not a fresh lookup each time.
	 *
	 * @return void
	 */
	public function test_get_commission_is_lazily_cached() {
		$order = wc_create_order();

		$store_order = new \MultiVendorX\Order\StoreOrder( $order );

		$first  = $store_order->get_commission();
		$second = $store_order->get_commission();

		$this->assertInstanceOf( \MultiVendorX\Commission\Commission::class, $first );
		$this->assertSame( $first, $second );
	}
}
