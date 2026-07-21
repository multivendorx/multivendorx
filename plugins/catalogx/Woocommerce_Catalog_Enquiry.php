<?php
/**
 * Plugin Name: CatalogX — Catalog Mode, Enquiry & Quotes for WooCommerce
 * Plugin URI: https://catalogx.com/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx
 * Description: Convert your WooCommerce store into a catalog website in a click.
 * Author: MultiVendorX
 * Version: 6.1.1
 * Author URI: https://multivendorx.com/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx
 * Requires at least: 6.3
 * Tested up to: 7.0.2
 * WC requires at least: 8.2.0
 * WC tested up to: 10.9.4
 *
 * Text Domain: catalogx
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
