<?php
/**
 * Plugin installation/activation test.
 *
 * @package CatalogX
 */

/**
 * Covers CatalogX's activation hook and Installer's table/option setup.
 */
class CatalogX_Installation_Test extends WP_UnitTestCase {

    /**
     * Activation should mark the plugin as installed.
     *
     * @return void
     */
    public function test_plugin_is_installed() {
        $this->assertNotFalse(
            get_option( \CatalogX\Utill::CATALOGX_OTHER_SETTINGS['installed'] ),
            'Activation hook should set this option'
        );
    }

    /**
     * Installer::run_migration() should record the current plugin version,
     * not just leave the legacy version key empty.
     *
     * @return void
     */
    public function test_installer_records_the_current_plugin_version() {
        $this->assertSame(
            CatalogX()->version,
            get_option( \CatalogX\Installer::VERSION_KEY )
        );
    }

    /**
     * Each custom table CatalogX relies on must actually exist after
     * installation - a missing table here would silently break every
     * enquiry/rule/message query at runtime instead of failing loudly.
     *
     * @return void
     */
    public function test_custom_tables_are_created() {
        global $wpdb;

        foreach ( \CatalogX\Utill::TABLES as $table_name ) {
            $full_table_name = $wpdb->prefix . $table_name;

            $this->assertSame(
                $full_table_name,
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $full_table_name ) ),
                "Expected table {$full_table_name} to exist after installation"
            );
        }
    }
}
