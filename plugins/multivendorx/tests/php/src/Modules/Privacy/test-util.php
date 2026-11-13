<?php
/**
 * Tests for MultiVendorX\Privacy\Util's store-info disclosure gating.
 *
 * Path mirrors the source file under test: modules/Privacy/Util.php.
 *
 * Only covers the two early-exit branches - the full happy path needs a real
 * product/store/review fixture chain and is left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Privacy\Util::show_store_info()'s setting/store-existence gates.
 */
class MultiVendorX_Privacy_Util_Test extends WP_UnitTestCase {

	/**
	 * When "show_store_name" isn't in the store_branding_details setting,
	 * show_store_info() returns null (no explicit return reached) rather
	 * than an empty array - callers checking for falsy still work, but this
	 * pins the actual return type down.
	 *
	 * @return void
	 */
	public function test_show_store_info_returns_null_when_setting_not_enabled() {
		// show_store_info() reads MultiVendorX()->setting directly, so the
		// write must go through that same singleton instance - a separately
		// constructed Setting() wouldn't be seen by it (each instance snapshots
		// its own settings from the database once, at construction time).
		MultiVendorX()->setting->update_setting( 'store_branding_details', array(), 'multivendorx_extra_settings' );

		$result = \MultiVendorX\Privacy\Util::show_store_info( 1 );

		$this->assertNull( $result );
	}

	/**
	 * When the setting is enabled but the product isn't linked to any store,
	 * show_store_info() returns an empty array rather than a fatal error on
	 * a missing Store object.
	 *
	 * @return void
	 */
	public function test_show_store_info_returns_empty_array_when_product_has_no_store() {
		MultiVendorX()->setting->update_setting( 'store_branding_details', array( 'show_store_name' ), 'multivendorx_extra_settings' );

		$result = \MultiVendorX\Privacy\Util::show_store_info( 999999 );

		$this->assertSame( array(), $result );
	}
}
