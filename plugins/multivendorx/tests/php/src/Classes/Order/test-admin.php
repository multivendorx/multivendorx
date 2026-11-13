<?php
/**
 * Tests for MultiVendorX\Order\Admin's order-list column/action additions.
 *
 * Path mirrors the source file under test: classes/Order/Admin.php.
 *
 * shop_order_columns()'s trash-exclusion branch depends on
 * filter_input(INPUT_GET, 'post_status', ...), which doesn't reliably
 * reflect $_GET under the PHPUnit CLI SAPI (same caveat as StoreAnalytics\Rest
 * and MarketplaceRefund\Admin) - only the default (non-trash) path is covered.
 * regenerate_order_commissions()/regenerate_suborders() need a full
 * commission-recalculation/suborder-creation fixture chain and are left for
 * a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Order\Admin::shop_order_columns()/woocommerce_order_actions().
 */
class MultiVendorX_Order_Admin_Test extends WP_UnitTestCase {

	/**
	 * The "Suborders" column is inserted immediately after "order_number",
	 * leaving every other column and its order untouched.
	 *
	 * @return void
	 */
	public function test_shop_order_columns_inserts_suborders_column_after_order_number() {
		$admin = new \MultiVendorX\Order\Admin();

		$columns = array(
			'order_number' => 'Order',
			'order_date'   => 'Date',
			'order_status' => 'Status',
		);

		$result = $admin->shop_order_columns( $columns );

		$this->assertSame(
			array( 'order_number', 'multivendorx_suborder', 'order_date', 'order_status' ),
			array_keys( $result )
		);
	}

	/**
	 * A suborder (has a parent) gets the "regenerate order commissions" action.
	 *
	 * @return void
	 */
	public function test_woocommerce_order_actions_adds_regenerate_commissions_for_suborder() {
		$parent = wc_create_order();
		$child  = wc_create_order();
		$child->set_parent_id( $parent->get_id() );
		$child->save();

		$admin   = new \MultiVendorX\Order\Admin();
		$actions = $admin->woocommerce_order_actions( array(), $child );

		$this->assertArrayHasKey( 'regenerate_order_commissions', $actions );
		$this->assertArrayNotHasKey( 'regenerate_suborders', $actions );
	}

	/**
	 * A top-level order (no parent) gets the "regenerate suborders" action instead.
	 *
	 * @return void
	 */
	public function test_woocommerce_order_actions_adds_regenerate_suborders_for_parent_order() {
		$order = wc_create_order();

		$admin   = new \MultiVendorX\Order\Admin();
		$actions = $admin->woocommerce_order_actions( array(), $order );

		$this->assertArrayHasKey( 'regenerate_suborders', $actions );
		$this->assertArrayNotHasKey( 'regenerate_order_commissions', $actions );
	}

	/**
	 * A null order (no order context) leaves the actions list untouched.
	 *
	 * @return void
	 */
	public function test_woocommerce_order_actions_leaves_actions_untouched_for_null_order() {
		$admin   = new \MultiVendorX\Order\Admin();
		$actions = $admin->woocommerce_order_actions( array( 'existing' => 'Existing Action' ), null );

		$this->assertSame( array( 'existing' => 'Existing Action' ), $actions );
	}
}
