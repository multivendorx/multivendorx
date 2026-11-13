<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package MooWoodle
 */

define( 'MOOWOODLE_PLUGIN_DIR', dirname( __DIR__, 2 ) );

/**
 * Locate a WooCommerce checkout to load alongside MooWoodle during tests.
 *
 * Checked in order: WC_DIR env var, the common wp-env sibling-plugin layout,
 * then this sandbox's known checkout path as a last-resort fallback.
 *
 * @return string|false Path to woocommerce.php, or false if none found.
 */
function moowoodle_locate_woocommerce_main_file() {
	$candidates = array(
		getenv( 'WC_DIR' ) ? rtrim( getenv( 'WC_DIR' ), '/\\' ) . '/woocommerce.php' : null,
		dirname( MOOWOODLE_PLUGIN_DIR, 3 ) . '/woocommerce/woocommerce.php',
		dirname( MOOWOODLE_PLUGIN_DIR, 5 ) . '/woocommerce/woocommerce.php',
	);

	foreach ( $candidates as $candidate ) {
		if ( $candidate && file_exists( $candidate ) ) {
			return $candidate;
		}
	}

	return false;
}

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

// Forward custom PHPUnit Polyfills configuration to PHPUnit bootstrap file.
$_phpunit_polyfills_path = getenv( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' );
if ( false !== $_phpunit_polyfills_path ) {
	define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', $_phpunit_polyfills_path );
}

if ( ! file_exists( "{$_tests_dir}/includes/functions.php" ) ) {
	echo "Could not find {$_tests_dir}/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	exit( 1 );
}

// Give access to tests_add_filter() function.
require_once "{$_tests_dir}/includes/functions.php";

/**
 * Manually load WooCommerce (if found) and the plugin being tested.
 *
 * @return void
 */
function _manually_load_plugin() {
	$woocommerce_main_file = moowoodle_locate_woocommerce_main_file();
	if ( $woocommerce_main_file ) {
		require $woocommerce_main_file;
	}

	require MOOWOODLE_PLUGIN_DIR . '/moowoodle.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

/**
 * Ensure MooWoodle's custom tables exist for the test run.
 *
 * Constructing Installer runs create_tables() when 'moowoodle_version' isn't
 * set yet, which is always true on the fresh test database WP spins up.
 *
 * @return void
 */
function install_moowoodle() {
	new \MooWoodle\Installer();
}

tests_add_filter( 'setup_theme', 'install_moowoodle' );

// Start up the WP testing environment.
require "{$_tests_dir}/includes/bootstrap.php";

// Test framework: base test case + fixture helpers (mirrors WooCommerce's tests/legacy/framework/).
require __DIR__ . '/framework/class-moowoodle-unit-test-case.php';

foreach ( glob( __DIR__ . '/framework/helpers/class-moowoodle-helper-*.php' ) as $helper_file ) {
	require $helper_file;
}
