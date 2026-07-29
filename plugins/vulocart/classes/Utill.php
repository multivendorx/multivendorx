<?php
/**
 * Utill class file.
 *
 * @package VuloCart
 */

namespace VuloCart;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Utill class.
 *
 * Central registry of custom table names and installation-tracking option
 * keys, mirroring MultiVendorX\Utill's and VuloPilot\Utill's role for their
 * own product families.
 *
 * @class       Utill class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Utill {

    /**
     * Custom $wpdb table names, keyed by short entity id. Only 'offering'
     * lives here — Offering is the plugin's always-on core entity. Cart and
     * Order own their own tables directly (`modules/Cart/Install.php`,
     * `modules/Order/Install.php`), not registered in this shared
     * registry, since they're real toggleable modules now — same
     * "module owns its own table names" convention `vulocart-pro`'s
     * Passport module already establishes (`Passport\Util::get_table()`
     * hardcodes its own table name rather than adding to the free
     * plugin's registry).
     *
     * @var array
     */
    const TABLES = array(
        'offering' => 'vulocart_offerings',
    );

    /**
     * Option keys used by the bootstrap/Install flow.
     *
     * @var array
     */
    const OTHER_SETTINGS = array(
        'run_installer'     => 'vulocart_run_installer',
        'plugin_db_version' => 'vulocart_version',
    );

    /**
     * Option name the active-modules list is stored under — mirrors
     * MultiVendorX\Utill::ACTIVE_MODULES_DB_KEY's/VuloPilot\Utill's role
     * for this product line's own `modules/` addon system
     * (module-architecture.md's discovery/loading mechanism, added here
     * for VuloCart via `Modules::load_active_modules()`).
     *
     * @var string
     */
    const ACTIVE_MODULES_DB_KEY = 'vulocart_all_active_module_list';

    /**
     * Option name VuloCart's settings screen reads/writes — a single flat
     * `wp_options` row, mirroring VuloPilot\Utill::VULOPILOT_SETTINGS_KEY
     * (not multivendorx's per-tab-namespaced `admin_settings` shape,
     * which doesn't apply here since VuloCart has exactly one settings
     * tab so far).
     *
     * @var string
     */
    const SETTINGS_KEY = 'vulocart_settings';

    /**
     * Every known setting key and its default, so a missing/never-saved
     * key still has a sane value instead of null — same role as
     * VuloPilot\Utill::VULOPILOT_SETTINGS_DEFAULTS. Grouped by the
     * Settings screen's 12 tabs (src/settings/*.ts), one section per tab.
     *
     * Boolean-style toggle fields (`type: 'checkbox', look: 'toggle'`)
     * store an array, not a literal bool — zyra's InputRenderer/
     * MultiCheckboxInput persists a toggle as the array of its one
     * selected option's value when on, `array()` when off (verified
     * against @zyra/inputs' MultiCheckboxInput.tsx and
     * VuloPilot\Utill::VULOPILOT_SETTINGS_DEFAULTS's own
     * `enable_debug_logging => array()` default for the identical
     * pattern) — every toggle default below follows that shape.
     *
     * `enable_debug_logging` (Utill::log()), the three Email tab keys
     * (Notifications\OrderEmails), `cart_expiry_days`
     * (Cart\Application\CartCleanupScheduler's daily cron), and
     * `guest_checkout_enabled`/`require_terms_acceptance`/
     * `checkout_terms_url`/`enable_offerings_listing`/
     * `enable_cart_checkout` (Block.php's `print_frontend_config()` →
     * src/blocks/checkout/Checkout.tsx, plus Order\Rest::create_item()'s
     * own server-side guest-checkout re-check) are actually read by
     * business logic today. Every other key here is a genuine, saved,
     * reloadable setting with no consumer yet — the same "real setting,
     * not yet consumed" gap this class already documented for
     * `default_offering_status` (Application\OfferingService::create_offering()
     * still hardcodes `'draft'`) and VuloPilot\Utill's own
     * `scan_frequency` (inert without its Automation module) — Payments/
     * Shipping/Taxes/API/MCP/AI have no backing gateway/calculation/
     * integration module in this plugin yet (Order\Domain\Order's own
     * docblock: "`total` === `subtotal` today — no tax/
     * shipping module yet"), so these fields exist to give the Settings
     * UI its full, promised tab structure honestly rather than silently
     * omitting tabs the admin-UX brief asked for.
     *
     * Deliberately no `enable_mcp_server`/`enable_ai_recommendations` keys
     * (removed after MCP/AI were built) — both were a Settings-tab
     * toggle duplicating what module activation on the Modules page
     * already does once MCP/AI ship as their own modules
     * (module-architecture.md), two sources of truth for one on/off
     * state. src/settings/Mcp.ts's/Ai.ts's own docblocks explain the same
     * reasoning; only their *configuration* fields (`mcp_api_key`,
     * `ai_provider`) remain here.
     *
     * @var array
     */
    const SETTINGS_DEFAULTS = array(
        // General.
        'default_currency'              => 'USD',
        'default_offering_status'       => 'draft',

        // Frontend.
        'enable_offerings_listing'      => array( 'enable_offerings_listing' ),
        'enable_cart_checkout'          => array( 'enable_cart_checkout' ),

        // Catalog.
        'default_offering_type'         => 'physical',
        'default_catalog_visibility'    => 'shop_and_search',
        'low_stock_threshold'           => 5,

        // Cart.
        'allow_guest_cart'              => array( 'allow_guest_cart' ),
        'cart_expiry_days'              => 14,

        // Checkout.
        'guest_checkout_enabled'        => array( 'guest_checkout_enabled' ),
        'require_terms_acceptance'      => array(),
        'checkout_terms_url'            => '',

        // Payments.
        'enable_manual_payment'         => array( 'enable_manual_payment' ),
        'default_payment_status'        => 'pending',

        // Shipping.
        'enable_shipping'               => array( 'enable_shipping' ),
        'default_shipping_class'        => 'standard',
        'flat_rate_shipping_cost'       => 0,

        // Taxes.
        'enable_tax_calculation'        => array(),
        'default_tax_rate_percent'      => 0,
        'prices_include_tax'            => array(),

        // Email.
        'send_order_confirmation_email' => array( 'send_order_confirmation_email' ),
        'send_status_update_email'      => array( 'send_status_update_email' ),
        'notification_from_email'       => '',

        // API.
        'enable_public_rest_api'        => array( 'enable_public_rest_api' ),
        'api_rate_limit_per_minute'     => 60,

        // MCP.
        'mcp_api_key'                   => '',

        // AI.
        'ai_provider'                   => 'none',

        // Advanced.
        'enable_debug_logging'          => array(),
    );

    /**
     * Records an unexpected exception — Modules::load_active_modules()'s
     * catch-and-skip path calls this so one broken module's constructor
     * (a third party's, or vulocart-pro's) doesn't take the whole site
     * down. Gated behind the Advanced tab's `enable_debug_logging` toggle
     * now that a Settings screen exists to hold it — mirrors
     * VuloPilot\Utill::log()'s identical pattern exactly.
     *
     * @param \Throwable $exception The exception to record.
     * @return void
     */
    public function log( \Throwable $exception ): void {
        $settings = wp_parse_args( get_option( self::SETTINGS_KEY, array() ), self::SETTINGS_DEFAULTS );

        if ( empty( $settings['enable_debug_logging'] ) ) {
            return;
        }

        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- gated behind an explicit, opt-in admin setting (Advanced tab), matching VuloPilot\Utill::log()'s identical pattern.
        error_log( sprintf( '[VuloCart] %s', $exception->getMessage() ) );
    }

    /**
     * Whether VuloCart Pro is installed, active, and license-active —
     * mirrors MultiVendorX\Utill::is_khali_dabba()'s/VuloPilot\Utill's role
     * for this product line. VuloCartPro::check_pro_active() is the only
     * thing that ever hooks `kothay_dabba_vulocart` (default false when
     * Pro isn't present), same filter-based "ask Pro, don't check for it
     * directly" pattern the other product families use.
     *
     * @return bool
     */
    public function is_khali_dabba(): bool {
        return (bool) apply_filters( 'kothay_dabba_vulocart', false );
    }
}
