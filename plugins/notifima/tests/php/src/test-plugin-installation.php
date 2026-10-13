<?php
/**
 * Plugin installation/activation test.
 *
 * @package Notifima
 */

/**
 * Notifima core activation test case.
 */
class Notifima_Core_Test extends WP_UnitTestCase {

    /**
     * Verify the activation hook records that the plugin installed successfully.
     *
     * @return void
     */
    public function test_plugin_is_installed() {
        $this->assertNotFalse(
            get_option( 'notifima_installed' ),
            'Activation hook should set this option'
        );
    }
}
