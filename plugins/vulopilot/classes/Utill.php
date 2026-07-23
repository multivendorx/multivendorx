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
        'scan'                => 'vulopilot_scans',
        'scan_finding'        => 'vulopilot_scan_findings',
        'rule'                => 'vulopilot_rules',
        'automation'          => 'vulopilot_automations',
        'automation_run'      => 'vulopilot_automation_runs',
        'ai_job'              => 'vulopilot_ai_jobs',
        'ai_history'          => 'vulopilot_ai_history',
        'ai_provider_config'  => 'vulopilot_ai_provider_configs',
        'report'              => 'vulopilot_reports',
        'scheduled_job'       => 'vulopilot_scheduled_jobs',
        'activity_log'        => 'vulopilot_activity_logs',
        'site_health_snapshot' => 'vulopilot_site_health_snapshots',
        'ai_action_run'       => 'vulopilot_ai_action_runs',
    );

    /**
     * Option keys used by the bootstrap/Install flow.
     *
     * @var array
     */
    const VULOPILOT_OTHER_SETTINGS = array(
        'run_installer'      => 'vulopilot_run_installer',
        'plugin_db_version'  => 'vulopilot_version',
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
        'scan_frequency'      => 'daily',
        'notification_email'  => '',
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
}
