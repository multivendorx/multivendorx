<?php
/**
 * Tests for MultiVendorX\Order\Hooks' analytics scoping and meta-display helpers.
 *
 * Path mirrors the source file under test: classes/Order/Hooks.php.
 *
 * Only covers exclude_suborders_analytics()/get_formatted_meta_data()/
 * skip_suborder_sales() - the checkout-time metadata/order-status-sync
 * methods need a full cart/checkout fixture chain and are left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Order\Hooks::exclude_suborders_analytics()/get_formatted_meta_data()/skip_suborder_sales().
 */
class MultiVendorX_Order_Hooks_Test extends WP_UnitTestCase {

	/**
	 * Exclude_suborders_analytics() appends a parent_id = 0 clause, so
	 * WooCommerce Analytics reports never double-count suborder rows.
	 *
	 * @return void
	 */
	public function test_exclude_suborders_analytics_appends_parent_id_zero_clause() {
		$hooks   = new \MultiVendorX\Order\Hooks();
		$clauses = $hooks->exclude_suborders_analytics( array( 'existing clause' ) );

		$this->assertCount( 2, $clauses );
		$this->assertStringContainsString( 'parent_id = 0', $clauses[1] );
	}

	/**
	 * The internal "sold by" meta key gets a human-readable display label.
	 *
	 * @return void
	 */
	public function test_get_formatted_meta_data_relabels_sold_by_key() {
		$meta        = new \stdClass();
		$meta->key   = 'multivendorx_sold_by';
		$meta->value = 'Some Store';

		$hooks  = new \MultiVendorX\Order\Hooks();
		$result = $hooks->get_formatted_meta_data( array( $meta ), null );

		$this->assertSame( 'Sold by', $result[0]->display_key );
	}

	/**
	 * The internal store-order-item-id meta key gets a human-readable display label.
	 *
	 * @return void
	 */
	public function test_get_formatted_meta_data_relabels_store_order_item_id_key() {
		$meta      = new \stdClass();
		$meta->key = 'store_order_item_id';

		$hooks  = new \MultiVendorX\Order\Hooks();
		$result = $hooks->get_formatted_meta_data( array( $meta ), null );

		$this->assertSame( 'Item id', $result[0]->display_key );
	}

	/**
	 * An unrelated meta key is left completely untouched.
	 *
	 * @return void
	 */
	public function test_get_formatted_meta_data_leaves_unrelated_keys_untouched() {
		$meta              = new \stdClass();
		$meta->key         = 'some_unrelated_key';
		$meta->display_key = 'Original Label';

		$hooks  = new \MultiVendorX\Order\Hooks();
		$result = $hooks->get_formatted_meta_data( array( $meta ), null );

		$this->assertSame( 'Original Label', $result[0]->display_key );
	}

	/**
	 * Skip_suborder_sales() is a no-op for a top-level (parent) order - it
	 * only ever acts on suborders.
	 *
	 * @return void
	 */
	public function test_skip_suborder_sales_is_noop_for_parent_order() {
		$order = wc_create_order();

		$hooks = new \MultiVendorX\Order\Hooks();
		// Must not throw/crash - a parent order's get_parent_id() is 0,
		// so the data-store calls inside the method are never reached.
		$hooks->skip_suborder_sales( $order->get_id() );

		$this->assertTrue( true );
	}

	/**
	 * Skip_suborder_sales() with an invalid order ID is a safe no-op.
	 *
	 * @return void
	 */
	public function test_skip_suborder_sales_is_noop_for_invalid_order_id() {
		$hooks = new \MultiVendorX\Order\Hooks();
		$hooks->skip_suborder_sales( 999999 );

		$this->assertTrue( true );
	}
}
