<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package MultiVendorX
 */

define( 'MULTIVENDORX_PLUGIN_DIR', dirname( __DIR__, 2 ) );

// Load this machine's local test env (WP_TESTS_DIR, TEST_WC_DIR, ...) if present.
// One shared file at the monorepo root (multivendorx-pro/.env.testing) covers
// every plugin's bootstrap.php, parent repo and submodule alike. Gitignored -
// holds developer-machine-specific paths, never committed - so
// `pnpm run test:php` works standalone without exporting anything by hand first.
$local_test_env_file = dirname( MULTIVENDORX_PLUGIN_DIR, 3 ) . '/.env.testing';

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
 * Resolve a usable WooCommerce checkout for the test suite, same recipe on
 * every machine: an explicit override wins, then a copy already sitting next
 * to this repo, and otherwise it's downloaded straight from wordpress.org
 * into the system temp dir (mirroring how install-wp-tests.sh fetches WP
 * core/the test library) - so a fresh clone of this repo can run the test
 * suite with no manual WooCommerce setup step at all.
 *
 * @return string Path to a directory containing woocommerce.php.
 */
function multivendorx_locate_or_download_woocommerce_for_tests() {
	$candidates = array(
		getenv( 'TEST_WC_DIR' ),
		dirname( MULTIVENDORX_PLUGIN_DIR, 3 ) . '/woocommerce',
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

	// The zip's top-level folder is always "woocommerce" - rename it to our
	// cache dir name so repeat runs recognise it without re-downloading.
	rename( $extract_to . '/woocommerce', $cache_dir );

	return $cache_dir;
}

// TEST_WC_DIR defaults to a WooCommerce checkout living inside this repo, falls
// back to an explicit TEST_WC_DIR env var, and otherwise auto-downloads one -
// avoids needing a symlink/clone inside the repo tree itself, and avoids any
// manual setup step on a machine that has neither.
define( 'TEST_WC_DIR', multivendorx_locate_or_download_woocommerce_for_tests() );

error_log( 'MultiVendorX plugin dir : ' . MULTIVENDORX_PLUGIN_DIR );
error_log( 'test wc dir : ' . TEST_WC_DIR );

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
	require MULTIVENDORX_PLUGIN_DIR . '/dc_product_vendor.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

/**
 * Truncate the plugin's custom tables between test runs.
 *
 * @return void
 */
function multivendorx_truncate_table_data(): void {
	$tables = array(
		'multivendorx_commissions',
		'multivendorx_stores',
		'multivendorx_store_users',
		'multivendorx_store_meta',
		'multivendorx_transactions',
		'multivendorx_customer_queries',
		'multivendorx_report_abuse',
		'multivendorx_store_reviews',
		'multivendorx_store_review_ratings',
		'multivendorx_shared_listing_mapping',
		'multivendorx_store_activity_notifications',
		'multivendorx_system_events',
		'multivendorx_visitors_stats',
		'multivendorx_activity_logs',
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
 * Install MultiVendorX into the test environment (creates custom tables, default options).
 *
 * @return void
 */
function install_multivendorx() {
	echo 'Installing MultiVendorX...' . PHP_EOL;
	multivendorx_truncate_table_data();

	MultiVendorX()->activate();
}

// Install WC and MultiVendorX.
tests_add_filter( 'setup_theme', 'install_wc' );
tests_add_filter( 'setup_theme', 'install_multivendorx' );

// Start up the WP testing environment.
require "{$_tests_dir}/includes/bootstrap.php";
