<?php
/**
 * Tests for MultiVendorX\Order\Frontend's My-Account query/email gating.
 *
 * Path mirrors the source file under test: classes/Order/Frontend.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Order\Frontend::woocommerce_my_account_my_orders_query()/
 * woocommerce_customer_available_downloads()/disable_new_order_email_conditionally().
 */
class MultiVendorX_Order_Frontend_Test extends WP_UnitTestCase {

	/**
	 * With display_customer_order = 'mainorder', the My Account orders query
	 * is scoped to orders with no store_id meta (true main/parent orders).
	 *
	 * @return void
	 */
	public function test_my_orders_query_scopes_to_main_orders_only() {
		MultiVendorX()->setting->update_setting( 'display_customer_order', 'mainorder' );

		$frontend = new \MultiVendorX\Order\Frontend();
		$result   = $frontend->woocommerce_my_account_my_orders_query( array() );

		$this->assertSame( 'multivendorx_store_id', $result['meta_query'][0]['key'] );
		$this->assertSame( 'NOT EXISTS', $result['meta_query'][0]['compare'] );
	}

	/**
	 * With display_customer_order = 'suborders', the query is scoped to
	 * orders that do have store_id meta.
	 *
	 * @return void
	 */
	public function test_my_orders_query_scopes_to_suborders_only() {
		MultiVendorX()->setting->update_setting( 'display_customer_order', 'suborders' );

		$frontend = new \MultiVendorX\Order\Frontend();
		$result   = $frontend->woocommerce_my_account_my_orders_query( array() );

		$this->assertSame( 'EXISTS', $result['meta_query'][0]['compare'] );
	}

	/**
	 * With any other display setting (e.g. 'main_sub', meaning "show both"),
	 * the query is left untouched - no meta_query filter is added.
	 *
	 * @return void
	 */
	public function test_my_orders_query_untouched_for_other_display_settings() {
		MultiVendorX()->setting->update_setting( 'display_customer_order', 'main_sub' );

		$frontend = new \MultiVendorX\Order\Frontend();
		$result   = $frontend->woocommerce_my_account_my_orders_query( array( 'existing' => 'value' ) );

		$this->assertArrayNotHasKey( 'meta_query', $result );
	}

	/**
	 * Downloads tied to a suborder (its order has a parent) are removed -
	 * only downloads from a true parent order are kept.
	 *
	 * @return void
	 */
	public function test_available_downloads_removes_suborder_downloads() {
		$parent_order = wc_create_order();
		$sub_order    = wc_create_order();
		$sub_order->set_parent_id( $parent_order->get_id() );
		$sub_order->save();

		$frontend  = new \MultiVendorX\Order\Frontend();
		$downloads = array(
			array( 'order_id' => $parent_order->get_id() ),
			array( 'order_id' => $sub_order->get_id() ),
		);

		$result = $frontend->woocommerce_customer_available_downloads( $downloads );

		$this->assertCount( 1, $result );
		$this->assertSame( $parent_order->get_id(), $result[0]['order_id'] );
	}

	/**
	 * A non-WC_Order value (e.g. null) leaves the email-enabled flag
	 * untouched rather than being treated as a main order.
	 *
	 * @return void
	 */
	public function test_disable_new_order_email_leaves_enabled_flag_untouched_for_non_order() {
		$frontend = new \MultiVendorX\Order\Frontend();

		$this->assertTrue( $frontend->disable_new_order_email_conditionally( true, null ) );
		$this->assertFalse( $frontend->disable_new_order_email_conditionally( false, null ) );
	}

	/**
	 * A main (parent) order's email stays enabled only when the display
	 * setting includes main orders ('mainorder' or 'main_sub').
	 *
	 * @return void
	 */
	public function test_disable_new_order_email_for_main_order() {
		MultiVendorX()->setting->update_setting( 'display_customer_order', 'suborders' );

		$order    = wc_create_order();
		$frontend = new \MultiVendorX\Order\Frontend();

		$this->assertFalse( $frontend->disable_new_order_email_conditionally( true, $order ) );
	}

	/**
	 * A suborder's email stays enabled only when the display setting
	 * includes suborders ('suborders' or 'main_sub').
	 *
	 * @return void
	 */
	public function test_disable_new_order_email_for_suborder() {
		MultiVendorX()->setting->update_setting( 'display_customer_order', 'mainorder' );

		$parent = wc_create_order();
		$child  = wc_create_order();
		$child->set_parent_id( $parent->get_id() );
		$child->save();

		$frontend = new \MultiVendorX\Order\Frontend();

		$this->assertFalse( $frontend->disable_new_order_email_conditionally( true, $child ) );
	}
}
