<?php
/**
 * WordPress test-suite config for MooWoodle's PHPUnit run.
 *
 * @package MooWoodle
 */

$wordpress_dir = dirname( __DIR__, 2 ) . '/wordpress/';
if ( ! is_dir( $wordpress_dir ) ) {
	$wordpress_dir = dirname( __DIR__, 5 ) . '/';
}

/* Path to the WordPress codebase to test against. Trailing slash required. */
define( 'ABSPATH', $wordpress_dir );

/*
 * Path to the theme to test with.
 *
 * The 'default' theme is symlinked from test/phpunit/data/themedir1/default into
 * the themes directory of the WordPress installation defined above.
 */
define( 'WP_DEFAULT_THEME', 'default' );

// Test with WordPress debug mode (default).
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );

// ** MySQL settings ** //

// This configuration file is used by the copy of WordPress being tested.
// wordpress/wp-config.php will be ignored.

// WARNING WARNING WARNING!
// These tests will DROP ALL TABLES in the database with the prefix named below.
// DO NOT use a production database or one shared with something else.

$wp_db_name = getenv( 'WP_DB_NAME' );
define( 'DB_NAME', $wp_db_name ? $wp_db_name : 'wordpress_test' );

$wp_db_user = getenv( 'WP_DB_USER' );
define( 'DB_USER', $wp_db_user ? $wp_db_user : 'root' );

$wp_db_pass = getenv( 'WP_DB_PASS' );
define( 'DB_PASSWORD', $wp_db_pass ? $wp_db_pass : '' );

$wp_db_host = getenv( 'WP_DB_HOST' );
define( 'DB_HOST', $wp_db_host ? $wp_db_host : 'localhost' );

define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

// This is a dedicated test-suite config file (not a real wp-config.php), so overriding
// the $table_prefix global here is the documented, intended mechanism, not a bug.
$table_prefix = 'unit_'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Only numbers, letters, and underscores please!

define( 'WP_TESTS_DOMAIN', 'example.org' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'Test Blog' );

define( 'WP_PHP_BINARY', 'php' );

define( 'WPLANG', '' );
