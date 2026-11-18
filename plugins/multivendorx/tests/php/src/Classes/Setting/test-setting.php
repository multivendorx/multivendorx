<?php
/**
 * Tests for MultiVendorX\Setting's option read/write round-trip.
 *
 * Path mirrors the source file under test: classes/Setting.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Setting::get_setting()/update_setting()/get_option()/update_option().
 *
 * Load_settings() used to call an undefined get_options() (plural) at
 * construction time - fixed to loop get_option() per key instead. This blocked
 * the entire free-plugin test suite from booting at all (init_classes() runs
 * on `init`, constructing a Setting unconditionally), not just this file.
 * test_constructing_setting_does_not_fatal_on_get_options() pins the fix down.
 */
class MultiVendorX_Setting_Test extends WP_UnitTestCase {

	/**
	 * Constructing a Setting object must not fatal - regression test for the
	 * get_options() bug described above.
	 *
	 * @return void
	 */
	public function test_constructing_setting_does_not_fatal_on_get_options() {
		$setting = new \MultiVendorX\Setting();

		$this->assertInstanceOf( \MultiVendorX\Setting::class, $setting );
	}

	/**
	 * Get_setting() returns the given default when the key was never set.
	 *
	 * @return void
	 */
	public function test_get_setting_returns_default_for_unset_key() {
		$setting = new \MultiVendorX\Setting();

		$this->assertSame( 'fallback', $setting->get_setting( 'a_key_that_was_never_set', 'fallback' ) );
	}

	/**
	 * Update_setting() persists through to get_setting() on the same instance.
	 *
	 * @return void
	 */
	public function test_update_setting_then_get_setting_round_trips() {
		$setting = new \MultiVendorX\Setting();

		$setting->update_setting( 'commission_type', 'per_item', 'multivendorx_extra_settings' );

		$this->assertSame( 'per_item', $setting->get_setting( 'commission_type', '', 'multivendorx_extra_settings' ) );
	}

	/**
	 * Update_setting() actually writes to wp_options, not just the in-memory
	 * container, so a freshly constructed Setting instance sees the same value.
	 *
	 * @return void
	 */
	public function test_update_setting_persists_to_wp_options_for_a_new_instance() {
		$first = new \MultiVendorX\Setting();
		$first->update_setting( 'commission_type', 'store_order', 'multivendorx_extra_settings' );

		$second = new \MultiVendorX\Setting();
		$this->assertSame( 'store_order', $second->get_setting( 'commission_type', '', 'multivendorx_extra_settings' ) );
	}

	/**
	 * Update_option() refuses to persist a key that isn't a registered setting -
	 * it must not fall through to writing an arbitrary wp_options row.
	 *
	 * @return void
	 */
	public function test_update_option_refuses_unregistered_key() {
		$setting = new \MultiVendorX\Setting();

		$setting->update_option( 'not_a_registered_settings_key', array( 'anything' ) );

		$this->assertFalse( get_option( 'not_a_registered_settings_key' ) );
	}

	/**
	 * Get_option() falls back to the real get_option() for a key that isn't
	 * one of the registered settings keys.
	 *
	 * @return void
	 */
	public function test_get_option_falls_back_to_wp_get_option_for_unregistered_key() {
		update_option( 'an_unrelated_option_multivendorx_test', 'raw-value' );

		$setting = new \MultiVendorX\Setting();

		$this->assertSame( 'raw-value', $setting->get_option( 'an_unrelated_option_multivendorx_test' ) );
	}
}
