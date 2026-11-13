<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Tracking's add-tracking guard checks.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Tracking.php.
 *
 * Only covers create_item()'s validation/ownership guards - the happy path
 * depends on MultiVendorX()->notifications->send_notification_helper() and
 * is left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Tracking::create_item()'s guard checks.
 */
class MultiVendorX_RestAPI_Tracking_Test extends WP_UnitTestCase {

	/**
	 * A missing/invalid order_id is rejected before any ownership check.
	 *
	 * @return void
	 */
	public function test_create_item_rejects_invalid_order() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Tracking();
		$request = new \WP_REST_Request();
		$request->set_param( 'order_id', 999999 );

		$result = $rest->create_item( $request );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_order', $result->get_error_code() );
	}

	/**
	 * An order belonging to a different store than the caller's active
	 * store is forbidden.
	 *
	 * @return void
	 */
	public function test_create_item_rejects_order_from_another_store() {
		$order = wc_create_order();
		$order->update_meta_data( \MultiVendorX\Utill::POST_META_SETTINGS['store_id'], 999 );
		$order->save();

		$rest    = new \MultiVendorX\RestAPI\Controllers\Tracking();
		$request = new \WP_REST_Request();
		$request->set_param( 'order_id', $order->get_id() );

		$result = $rest->create_item( $request );

		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
	}
}
