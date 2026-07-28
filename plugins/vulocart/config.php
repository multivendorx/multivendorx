<?php
/**
 * VuloCart config file.
 *
 * @package VuloCart
 */

defined( 'ABSPATH' ) || exit;

define( 'VULOCART_PLUGIN_TEXTDOMAIN', 'vulocart' );
define( 'VULOCART_PLUGIN_VERSION', '1.2.0' );
define( 'VULOCART_PLUGIN_SLUG', 'vulocart' );
// Defined free-side (not by vulocart-pro) — same "where to buy Pro" pattern
// as VULOPILOT_PRO_SHOP_URL in multivendorx/plugins/vulopilot/config.php:
// the default `manage_plan_url` fallback for the "Pro not installed" case,
// overridden by vulocart-pro's own VULOCART_MY_ACCOUNT_URL once Pro
// registers via the `vulocart_update_pro_data` filter.
define( 'VULOCART_PRO_SHOP_URL', 'https://vulocart.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=vulocart' );
