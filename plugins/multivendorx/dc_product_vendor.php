<?php
/**
 * Plugin Name: MultiVendorX
 * Plugin URI: https://multivendorx.com/
 * Description: A Free Extension That Transforms Your WooCommerce Site into a Marketplace.
 * Author: MultiVendorX
 * Version: 4.2.27
 * Author URI: https://multivendorx.com/
 * Requires at least: 5.4
 * Tested up to: 6.8.1
 * WC requires at least: 8.2.2
 * WC tested up to: 9.9.5
 *
 * Text Domain: multivendorx
 * Requires Plugins: woocommerce
 * Domain Path: /languages/
 */

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

require_once __DIR__ . '/vendor/autoload.php';

function MultiVendorX() {
    return \MultiVendorX\MultiVendorX::init( __FILE__ );
}

MultiVendorX();
