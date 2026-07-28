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
     * Custom $wpdb table names, keyed by short entity id. Only 'asset'
     * lives here — Asset is the plugin's always-on core entity. Cart and
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
        'asset' => 'vulocart_assets',
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
     * VuloPilot\Utill::VULOPILOT_SETTINGS_DEFAULTS.
     *
     * `default_asset_status` is not yet read anywhere else in this
     * codebase (Application\AssetService::create_asset() still hardcodes
     * `'draft'`) — documented here rather than silently wired, the same
     * "real setting, not yet consumed" gap VuloPilot\Utill's own
     * `scan_frequency` documents until its Automation module exists.
     *
     * @var array
     */
    const SETTINGS_DEFAULTS = array(
        'default_currency'     => 'USD',
        'default_asset_status' => 'draft',
    );

    /**
     * Records an unexpected exception — Modules::load_active_modules()'s
     * catch-and-skip path calls this so one broken module's constructor
     * (a third party's, or vulocart-pro's) doesn't take the whole site
     * down. Always writes to PHP's own error log — VuloCart has no
     * settings screen/debug-logging toggle yet to gate this behind (unlike
     * VuloPilot\Utill::log()), so this stays unconditional until one exists.
     *
     * @param \Throwable $exception The exception to record.
     * @return void
     */
    public function log( \Throwable $exception ): void {
        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- no settings screen to gate this behind yet; see docblock.
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
