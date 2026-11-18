<?php
/**
 * Tests for MultiVendorX\Order\OrderManager's query/order-detection helpers.
 *
 * Path mirrors the source file under test: classes/Order/OrderManager.php.
 *
 * Uses the real MultiVendorX()->order singleton rather than constructing a
 * second OrderManager, since its constructor instantiates Hooks/Admin/Frontend
 * and registers their hooks - doing that twice would double-register them.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Order\OrderManager::is_multivendorx_order()/set_filter_order_query()/get_suborders().
 */
class MultiVendorX_OrderManager_Test extends WP_UnitTestCase {

	/**
	 * An order with no multivendorx_store_id meta is not a MultiVendorX order.
	 *
	 * @return void
	 */
	public function test_is_multivendorx_order_false_for_plain_order() {
		$order = wc_create_order();

		$this->assertFalse( MultiVendorX()->order->is_multivendorx_order( $order->get_id() ) );
	}

	/**
	 * An order with multivendorx_store_id meta is a MultiVendorX order.
	 *
	 * @return void
	 */
	public function test_is_multivendorx_order_true_when_store_meta_present() {
		$order = wc_create_order();
		$order->update_meta_data( 'multivendorx_store_id', 7 );
		$order->save();

		$this->assertTrue( MultiVendorX()->order->is_multivendorx_order( $order->get_id() ) );
	}

	/**
	 * A falsy/zero ID returns false without attempting an order lookup.
	 *
	 * @return void
	 */
	public function test_is_multivendorx_order_false_for_falsy_id() {
		$this->assertFalse( MultiVendorX()->order->is_multivendorx_order( 0 ) );
	}

	/**
	 * Set_filter_order_query() defaults 'parent' to 0 (only top-level/parent
	 * orders) when the query doesn't already specify one.
	 *
	 * @return void
	 */
	public function test_set_filter_order_query_defaults_parent_to_zero() {
		$result = MultiVendorX()->order->set_filter_order_query( array() );

		$this->assertSame( 0, $result['parent'] );
	}

	/**
	 * Set_filter_order_query() leaves an explicitly-set 'parent' untouched.
	 *
	 * @return void
	 */
	public function test_set_filter_order_query_leaves_explicit_parent_untouched() {
		$result = MultiVendorX()->order->set_filter_order_query( array( 'parent' => 42 ) );

		$this->assertSame( 42, $result['parent'] );
	}

	/**
	 * Get_suborders() returns the child orders of a given parent order, as objects by default.
	 *
	 * @return void
	 */
	public function test_get_suborders_returns_child_orders_as_objects() {
		$parent = wc_create_order();
		$child  = wc_create_order();
		$child->set_parent_id( $parent->get_id() );
		$child->save();

		$suborders = MultiVendorX()->order->get_suborders( $parent->get_id() );

		$this->assertCount( 1, $suborders );
		$this->assertInstanceOf( \WC_Order::class, $suborders[0] );
		$this->assertSame( $child->get_id(), $suborders[0]->get_id() );
	}

	/**
	 * Get_suborders() accepts a WC_Order object (not just an ID) for the parent.
	 *
	 * @return void
	 */
	public function test_get_suborders_accepts_order_object_as_parent() {
		$parent = wc_create_order();
		$child  = wc_create_order();
		$child->set_parent_id( $parent->get_id() );
		$child->save();

		$suborders = MultiVendorX()->order->get_suborders( $parent );

		$this->assertCount( 1, $suborders );
	}

	/**
	 * Get_suborders() with return_objects=false returns plain IDs.
	 *
	 * @return void
	 */
	public function test_get_suborders_returns_ids_when_requested() {
		$parent = wc_create_order();
		$child  = wc_create_order();
		$child->set_parent_id( $parent->get_id() );
		$child->save();

		$suborders = MultiVendorX()->order->get_suborders( $parent->get_id(), array(), false );

		$this->assertSame( array( $child->get_id() ), $suborders );
	}
}
