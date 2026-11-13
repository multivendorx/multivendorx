<?php
/**
 * Tests for MultiVendorX\MarketplaceRefund\Admin's order-status filter.
 *
 * Path mirrors the source file under test: modules/MarketplaceRefund/Admin.php.
 *
 * Only covers add_refund_requested_to_order_statuses() - the save handler
 * depends on $_POST via filter_input() (unreliable under the PHPUnit CLI
 * SAPI, same caveat as StoreAnalytics\Rest) and a real suborder/parent-order
 * hierarchy, left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\MarketplaceRefund\Admin::add_refund_requested_to_order_statuses().
 */
class MultiVendorX_MarketplaceRefund_Admin_Test extends WP_UnitTestCase {

	/**
	 * The three refund statuses are inserted immediately after "wc-on-hold",
	 * preserving every other status and its original order.
	 *
	 * @return void
	 */
	public function test_inserts_refund_statuses_immediately_after_on_hold() {
		$admin = new \MultiVendorX\MarketplaceRefund\Admin();

		$input = array(
			'wc-pending'   => 'Pending payment',
			'wc-on-hold'   => 'On hold',
			'wc-completed' => 'Completed',
		);

		$result = $admin->add_refund_requested_to_order_statuses( $input );

		$this->assertSame(
			array( 'wc-pending', 'wc-on-hold', 'wc-refund-requested', 'wc-refund-accepted', 'wc-refund-rejected', 'wc-completed' ),
			array_keys( $result )
		);
		$this->assertSame( 'Pending payment', $result['wc-pending'] );
		$this->assertSame( 'Completed', $result['wc-completed'] );
	}

	/**
	 * When "wc-on-hold" isn't present at all, no refund statuses are added -
	 * the list passes through unchanged rather than appending them at the end.
	 *
	 * @return void
	 */
	public function test_does_not_add_refund_statuses_when_on_hold_is_absent() {
		$admin = new \MultiVendorX\MarketplaceRefund\Admin();

		$input  = array( 'wc-pending' => 'Pending payment' );
		$result = $admin->add_refund_requested_to_order_statuses( $input );

		$this->assertSame( $input, $result );
	}
}
