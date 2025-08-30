<?php
/**
 * Plugin Name: CatalogX - Product Catalog Mode For WooCommerce
 * Plugin URI: https://catalogx.com/
 * Description: Convert your WooCommerce store into a catalog website in a click
 * Author: MultiVendorX
 * Version: 6.0.8
 * Author URI: https://catalogx.com/
 * WC requires at least: 8.2
 * WC tested up to: 9.8.5
 * Text Domain: catalogx
 * Domain Path: /languages/
 *
 * @package CatalogX
 */

// Exit if accessed directly.
if (!defined( 'ABSPATH' )) {
    exit;
}

require_once trailingslashit( __DIR__ ) . 'config.php';
require_once __DIR__ . '/vendor/autoload.php';

/**
 * Returns the main instance of the CatalogX plugin.
 *
 * @return \CatalogX\CatalogX
 */
function CatalogX() {
    return \CatalogX\CatalogX::init( __FILE__ );
}

CatalogX();
