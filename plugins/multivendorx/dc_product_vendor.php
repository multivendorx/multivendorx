<?php
/**
 * Plugin Name: MultiVendorX
 * Plugin URI: https://multivendorx.com/
 * Description: An AI-powered WooCommerce multivendor marketplace solution to build, manage, and scale your platform.
 * Author: MultiVendorX
 * Version: 5.0.9
 * Author URI: https://multivendorx.com/
 * Requires at least: 6.3
 * Tested up to: 7.0.0
 * WC requires at least: 8.2.0
 * WC tested up to: 10.9.1
 *
 * Text Domain: multivendorx
 * Requires Plugins: woocommerce
 * Domain Path: /languages/
 *
 * @package MultiVendorX
 */

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

require_once __DIR__ . '/vendor/autoload.php';

/**
 * Main MultiVendorX Class
 */
function MultiVendorX() {
    return \MultiVendorX\MultiVendorX::init( __FILE__ );
}

MultiVendorX();
