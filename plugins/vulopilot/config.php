<?php
/**
 * VuloPilot config file.
 *
 * @package VuloPilot
 */

defined( 'ABSPATH' ) || exit;

define( 'VULOPILOT_PLUGIN_TEXTDOMAIN', 'vulopilot' );
define( 'VULOPILOT_PLUGIN_VERSION', '1.1.0' );
define( 'VULOPILOT_PLUGIN_SLUG', 'vulopilot' );
// Defined free-side (not by vulopilot-pro) — same "where to buy Pro"
// pattern as MULTIVENDORX_PRO_SHOP_URL in multivendorx/plugins/multivendorx/
// config.php: the default `manage_plan_url` fallback for the "Pro not
// installed" case, overridden by vulopilot-pro's own VULOPILOT_MY_ACCOUNT_URL
// once Pro registers via the `vulopilot_update_pro_data` filter.
define( 'VULOPILOT_PRO_SHOP_URL', 'https://vulopilot.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=vulopilot' );
