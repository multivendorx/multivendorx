<?php
/**
 * Plugin Name: Product Stock Waitlist Manager for WooCommerce
 * Plugin URI: https://notifima.com/
 * Description: Boost sales with real-time stock alerts! Notify customers instantly when products are back in stock. Simplify data management by exporting and importing stock data with ease.
 * Author: MultiVendorX
 * Version: 3.0.0
 * Requires at least: 5.4
 * Tested up to: 6.7.2
 * WC requires at least: 8.2.2
 * WC tested up to: 9.6.2
 * Author URI: https://multivendorx.com/
 * Text Domain: notifima
 * Requires Plugins: woocommerce
 * Domain Path: /languages/
 *
 * @package Notifima
 */

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

require_once __DIR__ . '/vendor/autoload.php';

/**
 * Returns the main instance of the Notifima plugin.
 *
 * @return \Notifima\Notifima
 */
function Notifima() {
    return \Notifima\Notifima::init( __FILE__ );
}

Notifima();
