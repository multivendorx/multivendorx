<?php
/**
 * Tests for Notifima\Setting's get/update logic.
 *
 * @package Notifima
 */

/**
 * Covers Notifima\Setting's get/update logic, including its fallback to a
 * caller-supplied default and its automatic option-key lookup.
 */
class Notifima_Setting_Test extends WP_UnitTestCase {

    /**
     * The Setting instance under test.
     *
     * @var \Notifima\Setting
     */
    private $setting;

    /**
     * Set up a fresh Setting instance before each test.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();
        $this->setting = new \Notifima\Setting();
    }

    /**
     * A key that was never set should fall back to the caller-supplied default.
     *
     * @return void
     */
    public function test_get_setting_returns_default_when_key_was_never_set() {
        $value = $this->setting->get_setting( 'this_key_does_not_exist', 'fallback-value' );

        $this->assertSame( 'fallback-value', $value );
    }

    /**
     * Calling update_setting() followed by get_setting() should round-trip the value.
     *
     * @return void
     */
    public function test_update_setting_then_get_setting_round_trips_the_value() {
        $this->setting->update_setting( 'lead_time_format', 'dynamic' );

        $this->assertSame( 'dynamic', $this->setting->get_setting( 'lead_time_format' ) );
    }

    /**
     * Calling update_setting() should persist to wp_options, not just the in-memory cache.
     *
     * @return void
     */
    public function test_update_setting_persists_to_the_options_table() {
        $this->setting->update_setting( 'is_enable_backorders', 'out_of_stock_and_backorder' );

        // A fresh instance has its own cache, so this proves the value was
        // actually written to wp_options, not just held in memory.
        $fresh_setting = new \Notifima\Setting();

        $this->assertSame(
            'out_of_stock_and_backorder',
            $fresh_setting->get_setting( 'is_enable_backorders' )
        );
    }

    /**
     * Calling update_option() should update the cache for a registered settings key.
     *
     * @return void
     */
    public function test_update_option_only_updates_the_cache_for_a_registered_key() {
        $option_name = \Notifima\Utill::NOTIFIMA_SETTINGS['automation'];

        $this->setting->update_option( $option_name, array( 'is_double_optin' => 'subscribe_immediately' ) );

        $this->assertSame(
            'subscribe_immediately',
            $this->setting->get_option( $option_name )['is_double_optin']
        );
    }
}
