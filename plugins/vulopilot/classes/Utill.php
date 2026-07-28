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
        'crawler_visit'        => 'vulopilot_crawler_visits',
        'redirect'             => 'vulopilot_redirects',
        'not_found_log'        => 'vulopilot_not_found_logs',
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
        'scan_frequency'                  => 'daily',
        // Notifications.
        'notification_email'              => '',
        'notify_on_critical_findings'     => array(),
        // Read by GeoAnalysis\GeoAnalyzer::analyze() — compares the fresh
        // overall_score against the previously-stored one and emails when
        // it falls by at least Scanning → GEO's `geo_drop_threshold`.
        'email_on_geo_score_drop'         => array(),
        'email_from_name'                 => '',
        'email_from_address'              => '',
        // Automation — replaces AutomationEngine's previously-hardcoded
        // COOLDOWN_MINUTES constant (ARCHITECTURE.md's Prompt 12 pass
        // shipped a fixed 60-minute rate limit as a pragmatic v1; this
        // makes it a real, per-site setting instead).
        'automation_cooldown_minutes'     => 60,
        // Reports.
        'default_report_format'           => 'pdf',
        'default_report_period_days'      => 30,
        // Security. Checkbox-type defaults are zyra's own wire shape (an
        // array containing the field's own key when on, or an empty array
        // when off — matches every checkbox option's own `key`/`value` in
        // the *.ts settings configs) rather than a PHP boolean — every PHP
        // consumer already reads these with empty()/!empty(), which is
        // true for a non-empty array and false for an empty one, so this
        // shape works everywhere a boolean did.
        'enable_rest_api_scanner'         => array( 'enable_rest_api_scanner' ),
        'enable_xmlrpc_scanner'           => array( 'enable_xmlrpc_scanner' ),
        'enable_security_headers_scanner' => array( 'enable_security_headers_scanner' ),
        'enable_exposed_files_scanner'    => array( 'enable_exposed_files_scanner' ),
        // Scanner-category kill switches — each gates every scanner
        // registered under that category string (SCANNERS.md), not just
        // one check, since that's what these settings-page groupings
        // actually correspond to (e.g. disabling "WooCommerce" turns off
        // both the original WooCommerceScanner and the 11 Product*
        // scanners from the WooCommerce AI pass — all category `woocommerce`).
        // SEO no longer has one of these — see the granular
        // flag_*/Scanning/Seo.ts entries below, same "no whole-category
        // switch, only granular ones" posture GEO already uses.
        'enable_accessibility_scanning'   => array( 'enable_accessibility_scanning' ),
        'enable_woocommerce_scanning'     => array( 'enable_woocommerce_scanning' ),
        // Scanning > SEO — granular, per-check toggles (readme's SEO
        // Optimization pillar), replacing the old whole-category
        // enable_seo_scanning switch. Each is read directly by the one
        // scanner it corresponds to; there's no "seo" category kill
        // switch to fall back on above, same posture GEO's scanners
        // already use.
        'flag_missing_meta_description'   => array( 'flag_missing_meta_description' ),
        'flag_duplicate_titles'           => array( 'flag_duplicate_titles' ),
        'flag_orphan_pages'               => array( 'flag_orphan_pages' ),
        // Read by Scanners\Basic\ThinContentScanner as its minimum word
        // count instead of a hardcoded constant.
        'thin_content_word_threshold'     => 300,
        'flag_missing_featured_image'     => array( 'flag_missing_featured_image' ),
        'flag_missing_alt_text'           => array( 'flag_missing_alt_text' ),
        'flag_broken_links'               => array( 'flag_broken_links' ),
        // Read by Scanners\Basic\BrokenLinksScanner to self-rate-limit —
        // 'daily'/'weekly', since this codebase's scan scheduling is one
        // global cadence (`scan_frequency` above), not a per-scanner cron;
        // this setting doesn't change *when* the shared scan runs, only
        // whether this specific scanner's own check actually re-runs that
        // time or skips (based on when it last genuinely ran).
        'broken_link_check_frequency'     => 'daily',
        // Covers both SchemaScanner (presence) and
        // StructuredDataValidationScanner (validity) — the mockup this
        // was built from has one "Flag missing structured data" toggle
        // for both, not two.
        'flag_missing_schema'             => array( 'flag_missing_schema' ),
        // Read by Services\SitemapManager — a real toggle over WordPress
        // core's own `/wp-sitemap.xml` (via the `wp_sitemaps_enabled`
        // filter), not a from-scratch sitemap generator; see that class's
        // own docblock.
        'sitemap_enabled'                 => array( 'sitemap_enabled' ),
        'sitemap_ping_search_engines'     => array( 'sitemap_ping_search_engines' ),
        // Read by Services\RobotsTxtManager — appends a `Sitemap:` line to
        // WordPress core's own virtual robots.txt via the `robots_txt`
        // filter; see that class's own docblock for why this isn't a
        // from-scratch robots.txt file generator.
        'robots_auto_generate'            => array( 'robots_auto_generate' ),
        // Read by Services\CanonicalUrlManager — WordPress core already
        // outputs a canonical tag by default (rel_canonical() on wp_head),
        // so this defaults OFF; it exists as a safety net a site owner (or
        // vulopilot-pro's OneClickFix "Fix" action) can turn on when a
        // theme/caching plugin is found to be stripping it, per
        // Scanners\Basic\CanonicalUrlScanner's own finding.
        'canonical_url_enabled'           => array(),
        // Read by Services\SocialMetaTagsManager — outputs Open Graph +
        // Twitter Card meta tags. Defaults OFF since many sites already
        // have another plugin/theme outputting these; exists so
        // vulopilot-pro's OneClickFix "Fix" action has something real to
        // turn on for Scanners\Basic\OpenGraphScanner/TwitterCardScanner's
        // findings.
        'social_meta_tags_enabled'        => array(),
        // Read by Services\RedirectManager (the first two) and
        // Services\NotFoundLogger (the third) — a real 301 redirect
        // manager (a user-managed old-path -> new-path table, applied at
        // request time via `vulopilot_redirects`) and a real 404-visit log
        // (distinct from Scanners\Basic\NotFoundScanner, which only checks
        // this site's OWN published permalinks for 404s, not visitor
        // traffic to missing URLs), backed by `vulopilot_not_found_logs`.
        'enable_redirect_manager'         => array( 'enable_redirect_manager' ),
        'auto_redirect_on_slug_change'    => array( 'auto_redirect_on_slug_change' ),
        'log_404s'                        => array( 'log_404s' ),
        // AI Visibility / GEO.
        'enable_llms_txt'                 => array( 'enable_llms_txt' ),
        // Empty means "not customized yet" — Controllers\Settings::get_stored_settings()
        // fills this with GeoAnalysis\LlmsTxtGenerator::generate()'s live
        // output for display until an admin edits and saves their own.
        'llms_txt_content'                => '',
        // Read by modules/Geo/Module.php's save_post hook — regenerates
        // and re-writes llms.txt automatically on publish/update, only
        // while the Geo module (Modules page) is active.
        'llms_auto_regen'                 => array( 'llms_auto_regen' ),
        // Read by GeoAnalysis\LlmsTxtGenerator::generate() to decide which
        // sections to build at all.
        'llms_include_types'              => array( 'pages', 'posts' ),
        // Read by Scanners\Basic\GeoSummaryBlockScanner — GEO scanning has
        // no whole-category kill switch (unlike SEO/Accessibility/
        // WooCommerce above), so this is that scanner's only on/off switch.
        'flag_missing_ai_summary'         => array( 'flag_missing_ai_summary' ),
        // Read by Scanners\Basic\GeoSummaryBlockScanner — how many words
        // from the top of a page/post its summary marker must appear
        // within.
        'answer_first_words'              => 200,
        // Read by GeoAnalysis\GeoAnalyzer::calculate_evidence_density() —
        // stats/citations per 500 words a page needs to score well on
        // "Data Point & Evidence Density".
        'min_data_points'                 => 3,
        // Read by GeoAnalysis\GeoAnalyzer::calculate_content_freshness() —
        // the "flag as stale" boundary its tiering scales against.
        'stale_content_months'            => 12,
        // Read by GeoAnalysis\GeoAnalyzer::analyze() — the minimum-points
        // drop in overall_score, since the last analysis, that triggers
        // Notifications' `email_on_geo_score_drop`.
        'geo_drop_threshold'              => 5,
        // AI Crawler Traffic Monitoring.
        'enable_crawler_tracking'         => array( 'enable_crawler_tracking' ),
        // Advanced / Debug.
        'enable_debug_logging'            => array(),
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
        'geo',
        'recent-activity',
        'quick-fixes',
        'health-timeline',
        'latest-reports',
        'pending-approval',
        'automation-status',
        'crawler-traffic',
        'health-pillars',
        'recent-issues',
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

    /**
     * Records an unexpected exception — Modules::load_active_modules()'s
     * catch-and-skip path calls this so one broken module's constructor
     * (Free's own, vulopilot-pro's, or a third party's) doesn't take the
     * whole site down. Writes to PHP's own error log only when the
     * Advanced tab's debug-logging setting is on — the same opt-in gate
     * Reports\ReportGenerator::maybe_log_debug() already uses, kept
     * consistent rather than introducing a second logging convention.
     *
     * @param \Throwable $exception The exception to record.
     * @return void
     */
    public function log( \Throwable $exception ): void {
        $settings = wp_parse_args( get_option( self::VULOPILOT_SETTINGS_KEY, array() ), self::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['enable_debug_logging'] ) ) {
            return;
        }

        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- gated behind an explicit, opt-in admin setting (Advanced tab), matching Reports\ReportGenerator::maybe_log_debug()'s existing pattern.
        error_log( sprintf( '[VuloPilot] %s', $exception->getMessage() ) );
    }

    /**
     * Whether VuloPilot Pro is installed, active, and license-active —
     * mirrors MultiVendorX\Utill::is_khali_dabba()'s role for this product
     * line. VuloPilotPro::check_pro_active() is the only thing that ever
     * hooks `kothay_dabba_vulopilot` (default false when Pro isn't
     * present), same filter-based "ask Pro, don't check for it directly"
     * pattern the multivendorx family uses.
     *
     * @return bool
     */
    public function is_khali_dabba(): bool {
        return (bool) apply_filters( 'kothay_dabba_vulopilot', false );
    }
}
