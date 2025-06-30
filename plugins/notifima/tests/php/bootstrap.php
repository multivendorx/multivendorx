<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package Notifima
 */

define( 'NOTIFIMA_PLUGIN_DIR', dirname( __DIR__, 2 ) );
define( 'TEST_WC_DIR', dirname( NOTIFIMA_PLUGIN_DIR, 3 ) . '/woocommerce' );

echo 'Notifima plugin dir : ' . NOTIFIMA_PLUGIN_DIR . "\n";
echo 'test wc dir : ' . TEST_WC_DIR;

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
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
	require TEST_WC_DIR . '/woocommerce.php';
	require NOTIFIMA_PLUGIN_DIR . '/product_stock_alert.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

function notifima_truncate_table_data(): void {
	$tables = array(
		'notifima_subscribers',
    );
    global $wpdb;
    foreach ( $tables as $table_name ) {
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}{$table_name}" );
    }
}

function install_wc() {
	define( 'WP_UNINSTALL_PLUGIN', true );
	define( 'WC_REMOVE_ALL_DATA', true );

	include TEST_WC_DIR . '/uninstall.php';

	WC_Install::install();

	// WC()->init();

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
 * Placeholder for activation function
 *
 * Nothing being called here yet.
 */
function install_notifima() {
	echo 'Installing Notifima...' . PHP_EOL;
    notifima_truncate_table_data();

	Notifima()->activate();
}

// install WC and Notifima
tests_add_filter( 'setup_theme', 'install_wc' );
tests_add_filter( 'setup_theme', 'install_notifima' );


// Start up the WP testing environment.
require "{$_tests_dir}/includes/bootstrap.php";
