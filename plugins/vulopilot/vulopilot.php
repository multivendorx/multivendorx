<?php
/**
 * Plugin Name: VuloPilot
 * Plugin URI: https://multivendorx.com/vulopilot/
 * Description: An AI Operating System for WordPress — monitor, optimize, secure, and automate your website.
 * Author: MultiVendorX
 * Version: 1.0.0
 * Author URI: https://multivendorx.com/
 * Requires at least: 6.3
 * Tested up to: 7.0.1
 * Text Domain: vulopilot
 * Domain Path: /languages/
 *
 * @package VuloPilot
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/vendor/autoload.php';

/**
 * Returns the main instance of the VuloPilot plugin.
 *
 * @return \VuloPilot\VuloPilot
 */
function VuloPilot() { // phpcs:ignore WordPress.NamingConventions.ValidFunctionName.FunctionNameInvalid -- PascalCase global accessor, same deliberate exception as MultiVendorX()/CatalogXPro() (naming-quality.md).
    return \VuloPilot\VuloPilot::init( __FILE__ );
}

VuloPilot();
