<?php
/**
 * Plugin Name: CatalogX
 * Plugin URI: https://multivendorx.com/
 * Description: An AI-powered WooCommerce multivendor marketplace solution to build, manage, and scale your platform.
 * Author: MultiVendorX
 * Version: 6.0.9
 * Author URI: https://multivendorx.com/
 * Requires at least: 6.3
 * Tested up to: 6.9.4
 * WC requires at least: 8.2.0
 * WC tested up to: 10.7.0
 *
 * Text Domain: multivendorx
 * Requires Plugins: woocommerce
 * Domain Path: /languages/
 *
 * @package CatalogX
 */

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

require_once __DIR__ . '/vendor/autoload.php';

/**
 * Main MultiVendorX Class
 */
function CatalogX() {
    return \CatalogX\CatalogX::init( __FILE__ );
}

CatalogX();
