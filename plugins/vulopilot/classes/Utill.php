<?php
/**
 * Utill class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot Utill class.
 *
 * Central registry of custom table names and installation-tracking option
 * keys, mirroring MultiVendorX\Utill's role for the multivendorx family.
 *
 * @class       Utill class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Utill {

    /**
     * Custom $wpdb table names, keyed by short entity id.
     *
     * @var array
     */
    const TABLES = array(
        'scan'                 => 'vulopilot_scans',
        'scan_finding'         => 'vulopilot_scan_findings',
        'rule'                 => 'vulopilot_rules',
        'automation'           => 'vulopilot_automations',
        'automation_run'       => 'vulopilot_automation_runs',
        'ai_job'               => 'vulopilot_ai_jobs',
        'ai_history'           => 'vulopilot_ai_history',
        'ai_provider_config'   => 'vulopilot_ai_provider_configs',
        'report'               => 'vulopilot_reports',
        'scheduled_job'        => 'vulopilot_scheduled_jobs',
        'activity_log'         => 'vulopilot_activity_logs',
        'site_health_snapshot' => 'vulopilot_site_health_snapshots',
        'ai_action_run'        => 'vulopilot_ai_action_runs',
    );

    /**
     * Option keys used by the bootstrap/Install flow.
     *
     * @var array
     */
    const VULOPILOT_OTHER_SETTINGS = array(
        'run_installer'     => 'vulopilot_run_installer',
        'plugin_db_version' => 'vulopilot_version',
    );

    /**
     * Option name for VuloPilot's plain settings — deliberately a single
     * wp_options row (an array), not a custom table, per
     * backward-compatibility.md: "New settings should be added through
     * the existing ... registered-settings-keys mechanism ... rather than
     * a new bespoke get_option() call." VULOPILOT_SETTINGS_DEFAULTS is
     * that registry: every known setting key and its default, so a
     * missing/never-saved key still has a sane value instead of null.
     *
     * @var string
     */
    const VULOPILOT_SETTINGS_KEY = 'vulopilot_settings';

    /**
     * @var array
     */
    const VULOPILOT_SETTINGS_DEFAULTS = array(
        // General.
        'scan_frequency'                => 'daily',
        // Notifications.
        'notification_email'            => '',
        'notify_on_critical_findings'   => false,
        'email_from_name'               => '',
        'email_from_address'            => '',
        // Automation — replaces AutomationEngine's previously-hardcoded
        // COOLDOWN_MINUTES constant (ARCHITECTURE.md's Prompt 12 pass
        // shipped a fixed 60-minute rate limit as a pragmatic v1; this
        // makes it a real, per-site setting instead).
        'automation_cooldown_minutes'   => 60,
        // Reports.
        'default_report_format'         => 'pdf',
        'default_report_period_days'    => 30,
        // Security.
        'enable_rest_api_scanner'       => true,
        // Scanner-category kill switches — each gates every scanner
        // registered under that category string (SCANNERS.md), not just
        // one check, since that's what these settings-page groupings
        // actually correspond to (e.g. disabling "WooCommerce" turns off
        // both the original WooCommerceScanner and the 11 Product*
        // scanners from the WooCommerce AI pass — all category `woocommerce`).
        'enable_seo_scanning'           => true,
        'enable_geo_scanning'           => true,
        'enable_accessibility_scanning' => true,
        'enable_woocommerce_scanning'   => true,
        // Advanced / Debug.
        'enable_debug_logging'          => false,
    );

    /**
     * Canonical widget ids for the Dashboard's drag-and-drop layout
     * (src/dashboard-widgets/registry.ts's DEFAULT_DASHBOARD_WIDGETS,
     * kept in sync with this list by convention — same id-matching
     * convention AI-ACTIONS.md already uses between Rule ids and Action
     * ids). `Controllers\DashboardLayout` validates against this list so
     * a saved layout can never contain an id the client made up; new
     * widgets (Free or, via `vulopilot_dashboard_widgets`, Pro) get added
     * here so an existing user's saved layout doesn't silently drop them.
     *
     * @var string[]
     */
    const DASHBOARD_WIDGET_IDS = array(
        'overall-health',
        'seo',
        'performance',
        'security',
        'woocommerce',
        'accessibility',
        'ai-usage',
        'recent-activity',
        'quick-fixes',
        'health-timeline',
        'latest-reports',
        'pending-approval',
        'automation-status',
    );

    /**
     * User meta key the Dashboard's widget layout (order + enabled flags)
     * is stored under — per-user, like WordPress core's own
     * `meta-box-order_{screen}` dashboard widget layout, since a widget
     * arrangement is a personal UI preference, not site-wide config (so
     * it belongs in user meta, not VULOPILOT_SETTINGS_KEY's shared
     * wp_options row).
     *
     * @var string
     */
    const DASHBOARD_LAYOUT_META_KEY = 'vulopilot_dashboard_widget_layout';

    /**
     * Option name the active-modules list is stored under — mirrors
     * MultiVendorX\Utill::ACTIVE_MODULES_DB_KEY's role for this product
     * line's own `modules/` addon system (module-architecture.md's
     * discovery/loading mechanism, added here for VuloPilot via
     * `Modules::load_active_modules()`).
     *
     * @var string
     */
    const ACTIVE_MODULES_DB_KEY = 'vulopilot_all_active_module_list';
}
