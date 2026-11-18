<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package CatalogX
 */

define( 'CATALOGX_PLUGIN_DIR', dirname( __DIR__, 2 ) );

$local_test_env_file = dirname( CATALOGX_PLUGIN_DIR, 3 ) . '/.env.testing';

if ( file_exists( $local_test_env_file ) ) {
	foreach ( file( $local_test_env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES ) as $line ) {
		$line = trim( $line );

		if ( '' === $line || '#' === $line[0] || false === strpos( $line, '=' ) ) {
			continue;
		}

		list( $env_key, $env_value ) = explode( '=', $line, 2 );

		if ( false === getenv( trim( $env_key ) ) ) {
			putenv( trim( $env_key ) . '=' . trim( $env_value ) );
		}
	}
}

/**
 * Locates a WooCommerce checkout for tests, downloading one if needed.
 *
 * @return string Path to a directory containing woocommerce.php.
 */
function catalogx_locate_or_download_woocommerce_for_tests() {
	$candidates = array(
		getenv( 'TEST_WC_DIR' ),
		dirname( CATALOGX_PLUGIN_DIR, 3 ) . '/woocommerce',
	);

	foreach ( $candidates as $candidate ) {
		if ( $candidate && file_exists( $candidate . '/woocommerce.php' ) ) {
			return $candidate;
		}
	}

	$cache_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/woocommerce-latest-stable';

	if ( file_exists( $cache_dir . '/woocommerce.php' ) ) {
		return $cache_dir;
	}

	error_log( 'No WooCommerce checkout found - downloading the latest stable release for the test suite...' );

	$zip_path = rtrim( sys_get_temp_dir(), '/\\' ) . '/woocommerce-latest-stable.zip';
	$zip_data = file_get_contents( 'https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip' );

	if ( false === $zip_data ) {
		error_log( 'Could not download WooCommerce - check your network connection or set TEST_WC_DIR to an existing checkout.' );
		exit( 1 );
	}

	file_put_contents( $zip_path, $zip_data );

	$zip = new ZipArchive();

	if ( true !== $zip->open( $zip_path ) ) {
		error_log( "Could not open downloaded WooCommerce archive at {$zip_path}." );
		exit( 1 );
	}

	$extract_to = rtrim( sys_get_temp_dir(), '/\\' );
	$zip->extractTo( $extract_to );
	$zip->close();
	unlink( $zip_path );

	// Rename to the cache dir name so repeat runs skip re-downloading.
	rename( $extract_to . '/woocommerce', $cache_dir );

	return $cache_dir;
}

define( 'TEST_WC_DIR', catalogx_locate_or_download_woocommerce_for_tests() );

error_log( 'CatalogX plugin dir : ' . CATALOGX_PLUGIN_DIR );
error_log( 'test wc dir : ' . TEST_WC_DIR );

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

$_phpunit_polyfills_path = getenv( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' );
if ( false !== $_phpunit_polyfills_path ) {
	define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', $_phpunit_polyfills_path );
}

if ( ! file_exists( "{$_tests_dir}/includes/functions.php" ) ) {
	error_log( "Could not find {$_tests_dir}/includes/functions.php, have you run tools/bin/install-wp-tests.sh from the monorepo root?" );
	exit( 1 );
}

// Give access to tests_add_filter() function.
require_once "{$_tests_dir}/includes/functions.php";

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
	require TEST_WC_DIR . '/woocommerce.php';
	require CATALOGX_PLUGIN_DIR . '/Woocommerce_Catalog_Enquiry.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

/**
 * Truncate the plugin's custom tables between test runs.
 *
 * @return void
 */
function catalogx_truncate_table_data(): void {
	$tables = array(
		'catalogx_enquiry',
		'catalogx_rules',
		'catalogx_messages',
	);
	global $wpdb;
	foreach ( $tables as $table_name ) {
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
		$wpdb->query( $wpdb->prepare( 'TRUNCATE TABLE %i', $wpdb->prefix . $table_name ) );
	}
}

/**
 * Install WooCommerce into the test environment.
 *
 * @return void
 */
function install_wc() {
	define( 'WP_UNINSTALL_PLUGIN', true );
	define( 'WC_REMOVE_ALL_DATA', true );

	include TEST_WC_DIR . '/uninstall.php';

	WC_Install::install();

	// Reload capabilities after install, see https://core.trac.wordpress.org/ticket/28374.
	if ( version_compare( $GLOBALS['wp_version'], '4.7', '<' ) ) {
		$GLOBALS['wp_roles']->reinit();
	} else {
		$GLOBALS['wp_roles'] = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		wp_roles();
	}

	echo esc_html( 'Installing WooCommerce...' . PHP_EOL );
}

/**
 * Runs CatalogX's activation + installer routine before tests start.
 *
 * @return void
 */
function install_catalogx() {
	echo 'Installing CatalogX...' . PHP_EOL;
	catalogx_truncate_table_data();

	CatalogX()->activate();

	// Avoids the setup-wizard redirect+exit() the 'init' hook fires on activation.
	delete_option( \CatalogX\Utill::CATALOGX_OTHER_SETTINGS['plugin_activated'] );

	new \CatalogX\Installer();
}

tests_add_filter( 'setup_theme', 'install_wc' );
tests_add_filter( 'setup_theme', 'install_catalogx' );

require "{$_tests_dir}/includes/bootstrap.php";
