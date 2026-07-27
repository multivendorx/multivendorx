<?php
/**
 * Install class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot Install class.
 *
 * Creates VuloPilot's custom database tables on first install and runs
 * version-gated incremental migrations on upgrade, following the same
 * dbDelta()-based pattern as MultiVendorX\Install. Schema design and the
 * rationale for every table/index below is documented in
 * multivendorx/plugins/vulopilot/DATABASE.md.
 *
 * @class       Install class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Install {

    /**
     * Class constructor — runs migration immediately.
     *
     * Unlike MultiVendorX\Install (which defers to the 'init' hook because
     * it can be constructed as early as register_activation_hook), this is
     * only ever constructed from VuloPilot::init_classes() and
     * VuloPilot::activate(), both of which already run at/after 'init', so
     * running synchronously here is safe and avoids double-registering the
     * same callback on 'init'.
     */
    public function __construct() {
        $this->run_migration();
    }

    /**
     * Runs the database migration process.
     *
     * @return void
     */
    public function run_migration() {
        $previous_version = get_option( Utill::VULOPILOT_OTHER_SETTINGS['plugin_db_version'], false );

        if ( ! $previous_version ) {
            $this->create_database_tables();
        } else {
            $this->do_migration( $previous_version );
        }

        update_option( Utill::VULOPILOT_OTHER_SETTINGS['plugin_db_version'], VULOPILOT_PLUGIN_VERSION );
        do_action( 'vulopilot_after_installed' );
    }

    /**
     * Creates every VuloPilot custom table for a fresh install (schema
     * version 1.0.0). Additive-only from here on — later schema changes
     * belong in do_migration(), never here.
     *
     * @return void
     */
    private static function create_database_tables() {
        global $wpdb;

        $collate = $wpdb->get_charset_collate();

        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        $sql_scans = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['scan'] . "` (
            `id`            bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `scanner_id`    varchar(100) NOT NULL,
            `scanner_tier`  varchar(20) NOT NULL DEFAULT 'free',
            `status`        varchar(20) NOT NULL DEFAULT 'queued',
            `trigger_type`  varchar(20) NOT NULL DEFAULT 'manual',
            `triggered_by`  bigint(20) unsigned DEFAULT NULL,
            `started_at`    datetime DEFAULT NULL,
            `finished_at`   datetime DEFAULT NULL,
            `duration_ms`   int(10) unsigned DEFAULT NULL,
            `summary`       longtext DEFAULT NULL,
            `error_message` text DEFAULT NULL,
            `created_at`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_scanner` (`scanner_id`),
            KEY `idx_status` (`status`),
            KEY `idx_created` (`created_at`)
        ) $collate;";

        $sql_scan_findings = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['scan_finding'] . "` (
            `id`          bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `scan_id`     bigint(20) unsigned NOT NULL,
            `scanner_id`  varchar(100) NOT NULL,
            `severity`    varchar(20) NOT NULL DEFAULT 'info',
            `category`    varchar(50) NOT NULL,
            `title`       varchar(255) NOT NULL,
            `description` longtext DEFAULT NULL,
            `object_type` varchar(50) DEFAULT NULL,
            `object_ref`  varchar(255) DEFAULT NULL,
            `status`      varchar(20) NOT NULL DEFAULT 'open',
            `resolved_at` datetime DEFAULT NULL,
            `meta`        longtext DEFAULT NULL,
            `created_at`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_scan` (`scan_id`),
            KEY `idx_severity` (`severity`),
            KEY `idx_status` (`status`),
            KEY `idx_category` (`category`)
        ) $collate;";

        $sql_rules = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['rule'] . "` (
            `id`             bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name`           varchar(191) NOT NULL,
            `description`    text DEFAULT NULL,
            `condition_tree` longtext NOT NULL,
            `is_active`      tinyint(1) NOT NULL DEFAULT 1,
            `created_by`     bigint(20) unsigned DEFAULT NULL,
            `created_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_active` (`is_active`)
        ) $collate;";

        $sql_automations = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['automation'] . "` (
            `id`                bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name`              varchar(191) NOT NULL,
            `rule_id`           bigint(20) unsigned DEFAULT NULL,
            `trigger_type`      varchar(50) NOT NULL,
            `trigger_config`    longtext DEFAULT NULL,
            `actions`           longtext NOT NULL,
            `status`            varchar(20) NOT NULL DEFAULT 'enabled',
            `last_triggered_at` datetime DEFAULT NULL,
            `created_by`        bigint(20) unsigned DEFAULT NULL,
            `created_at`        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_rule` (`rule_id`),
            KEY `idx_status` (`status`),
            KEY `idx_trigger_type` (`trigger_type`)
        ) $collate;";

        $sql_automation_runs = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['automation_run'] . "` (
            `id`               bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `automation_id`    bigint(20) unsigned NOT NULL,
            `triggered_by`     varchar(50) NOT NULL,
            `trigger_ref_id`   bigint(20) unsigned DEFAULT NULL,
            `status`           varchar(20) NOT NULL DEFAULT 'running',
            `actions_executed` int(10) unsigned NOT NULL DEFAULT 0,
            `actions_failed`   int(10) unsigned NOT NULL DEFAULT 0,
            `result_log`       longtext DEFAULT NULL,
            `started_at`       datetime NOT NULL,
            `finished_at`      datetime DEFAULT NULL,
            `created_at`       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_automation` (`automation_id`),
            KEY `idx_status` (`status`),
            KEY `idx_started` (`started_at`)
        ) $collate;";

        $sql_ai_jobs = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['ai_job'] . "` (
            `id`              bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `job_type`        varchar(50) NOT NULL,
            `provider`        varchar(50) NOT NULL,
            `model`           varchar(100) DEFAULT NULL,
            `status`          varchar(20) NOT NULL DEFAULT 'queued',
            `priority`        tinyint(3) unsigned NOT NULL DEFAULT 5,
            `object_type`     varchar(50) DEFAULT NULL,
            `object_id`       bigint(20) unsigned DEFAULT NULL,
            `request_payload` longtext NOT NULL,
            `attempts`        tinyint(3) unsigned NOT NULL DEFAULT 0,
            `requested_by`    bigint(20) unsigned DEFAULT NULL,
            `created_at`      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `started_at`      datetime DEFAULT NULL,
            `completed_at`    datetime DEFAULT NULL,
            `error_message`   text DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_status_priority` (`status`, `priority`),
            KEY `idx_object` (`object_type`, `object_id`)
        ) $collate;";

        $sql_ai_history = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['ai_history'] . "` (
            `id`                bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `job_id`            bigint(20) unsigned DEFAULT NULL,
            `provider`          varchar(50) NOT NULL,
            `model`             varchar(100) DEFAULT NULL,
            `object_type`       varchar(50) DEFAULT NULL,
            `object_id`         bigint(20) unsigned DEFAULT NULL,
            `prompt_tokens`     int(10) unsigned DEFAULT NULL,
            `completion_tokens` int(10) unsigned DEFAULT NULL,
            `cost_estimate`     decimal(10,4) DEFAULT NULL,
            `status`            varchar(20) NOT NULL,
            `response_excerpt`  text DEFAULT NULL,
            `requested_by`      bigint(20) unsigned DEFAULT NULL,
            `created_at`        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_provider` (`provider`),
            KEY `idx_created` (`created_at`),
            KEY `idx_object` (`object_type`, `object_id`)
        ) $collate;";

        $sql_ai_provider_configs = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['ai_provider_config'] . "` (
            `id`              bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `provider`        varchar(50) NOT NULL,
            `label`           varchar(191) DEFAULT NULL,
            `credentials`     longtext NOT NULL,
            `default_model`   varchar(100) DEFAULT NULL,
            `is_active`       tinyint(1) NOT NULL DEFAULT 1,
            `quota_limit`     int(10) unsigned DEFAULT NULL,
            `quota_used`      int(10) unsigned NOT NULL DEFAULT 0,
            `quota_reset_at`  datetime DEFAULT NULL,
            `created_at`      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_provider` (`provider`),
            KEY `idx_active` (`is_active`)
        ) $collate;";

        $sql_reports = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['report'] . "` (
            `id`            bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `report_type`   varchar(50) NOT NULL,
            `format`        varchar(10) NOT NULL DEFAULT 'pdf',
            `period_start`  date DEFAULT NULL,
            `period_end`    date DEFAULT NULL,
            `status`        varchar(20) NOT NULL DEFAULT 'generating',
            `file_path`     varchar(255) DEFAULT NULL,
            `generated_by`  bigint(20) unsigned DEFAULT NULL,
            `meta`          longtext DEFAULT NULL,
            `created_at`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_type` (`report_type`),
            KEY `idx_status` (`status`),
            KEY `idx_period` (`period_start`, `period_end`)
        ) $collate;";

        $sql_scheduled_jobs = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['scheduled_job'] . "` (
            `id`               bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `job_key`          varchar(100) NOT NULL,
            `job_type`         varchar(50) NOT NULL,
            `schedule`         varchar(50) NOT NULL,
            `config`           longtext DEFAULT NULL,
            `is_enabled`       tinyint(1) NOT NULL DEFAULT 1,
            `next_run_at`      datetime DEFAULT NULL,
            `last_run_at`      datetime DEFAULT NULL,
            `last_run_status`  varchar(20) DEFAULT NULL,
            `created_at`       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_job_key` (`job_key`),
            KEY `idx_enabled` (`is_enabled`),
            KEY `idx_next_run` (`next_run_at`)
        ) $collate;";

        $sql_activity_logs = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['activity_log'] . "` (
            `id`          bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `event_type`  varchar(100) NOT NULL,
            `object_type` varchar(50) DEFAULT NULL,
            `object_id`   bigint(20) unsigned DEFAULT NULL,
            `actor_type`  varchar(20) NOT NULL DEFAULT 'system',
            `actor_id`    bigint(20) unsigned DEFAULT NULL,
            `message`     text NOT NULL,
            `severity`    varchar(20) NOT NULL DEFAULT 'info',
            `meta`        longtext DEFAULT NULL,
            `created_at`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_event` (`event_type`),
            KEY `idx_object` (`object_type`, `object_id`),
            KEY `idx_created` (`created_at`)
        ) $collate;";

        $sql_site_health_snapshots = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['site_health_snapshot'] . "` (
            `id`                bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `snapshot_date`     date NOT NULL,
            `overall_score`     tinyint(3) unsigned NOT NULL,
            `security_score`    tinyint(3) unsigned DEFAULT NULL,
            `performance_score` tinyint(3) unsigned DEFAULT NULL,
            `seo_score`         tinyint(3) unsigned DEFAULT NULL,
            `uptime_score`      tinyint(3) unsigned DEFAULT NULL,
            `critical_count`    int(10) unsigned NOT NULL DEFAULT 0,
            `high_count`        int(10) unsigned NOT NULL DEFAULT 0,
            `medium_count`      int(10) unsigned NOT NULL DEFAULT 0,
            `low_count`         int(10) unsigned NOT NULL DEFAULT 0,
            `created_at`        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_snapshot_date` (`snapshot_date`)
        ) $collate;";

        $sql_ai_action_runs = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['ai_action_run'] . "` (
            `id`             bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `action_id`      varchar(100) NOT NULL,
            `status`         varchar(20) NOT NULL DEFAULT 'pending_approval',
            `object_type`    varchar(50) DEFAULT NULL,
            `object_ref`     varchar(255) DEFAULT NULL,
            `input`          longtext DEFAULT NULL,
            `output`         longtext DEFAULT NULL,
            `preview`        longtext DEFAULT NULL,
            `snapshot`       longtext DEFAULT NULL,
            `error_message`  text DEFAULT NULL,
            `requested_by`   bigint(20) unsigned DEFAULT NULL,
            `approved_by`    bigint(20) unsigned DEFAULT NULL,
            `created_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `approved_at`    datetime DEFAULT NULL,
            `executed_at`    datetime DEFAULT NULL,
            `rolled_back_at` datetime DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_action` (`action_id`),
            KEY `idx_status` (`status`),
            KEY `idx_object` (`object_type`, `object_ref`)
        ) $collate;";

        dbDelta( $sql_scans );
        dbDelta( $sql_scan_findings );
        dbDelta( $sql_rules );
        dbDelta( $sql_automations );
        dbDelta( $sql_automation_runs );
        dbDelta( $sql_ai_jobs );
        dbDelta( $sql_ai_history );
        dbDelta( $sql_ai_provider_configs );
        dbDelta( $sql_reports );
        dbDelta( $sql_scheduled_jobs );
        dbDelta( $sql_activity_logs );
        dbDelta( $sql_site_health_snapshots );
        dbDelta( $sql_ai_action_runs );

        self::create_crawler_visits_table();
    }

    /**
     * Creates `vulopilot_crawler_visits` — its own method (not inlined into
     * create_database_tables() like the tables above) because, unlike
     * those, this one also needs to run for sites *upgrading* in place
     * (do_migration() calls this too) — added after those fresh-install-only
     * table definitions were already written, per this class's own
     * "additive only, ADD new things in do_migration(), never touch
     * create_database_tables() for an upgrade" convention. No IP address or
     * user column, ever — readme.txt's own FAQ promises AI Crawler Traffic
     * Monitoring "does not track human visitors, IP addresses, or personal
     * data," enforced by the schema itself, not just application code.
     *
     * @return void
     */
    private static function create_crawler_visits_table() {
        global $wpdb;

        // create_database_tables() already guarantees dbDelta() is loaded
        // before its own calls, but do_migration() calls this method
        // directly without going through that guard — confirmed fatal
        // ("Call to undefined function dbDelta()") the moment the
        // migration path actually ran on a real site, since
        // wp-admin/includes/upgrade.php is never autoloaded outside
        // wp-admin. Self-sufficient here so this method is safe to call
        // from either context.
        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        $collate = $wpdb->get_charset_collate();

        $sql_crawler_visits = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['crawler_visit'] . "` (
            `id`             bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `bot_name`       varchar(50) NOT NULL,
            `user_agent`     varchar(255) NOT NULL,
            `requested_url`  varchar(255) NOT NULL,
            `created_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_bot` (`bot_name`),
            KEY `idx_created` (`created_at`)
        ) $collate;";

        dbDelta( $sql_crawler_visits );
    }

    /**
     * Runs incremental, version-gated schema changes for upgrades from an
     * already-installed copy of VuloPilot. Additive only, per
     * .claude/rules/backward-compatibility.md — ADD COLUMN / ADD INDEX,
     * never DROP.
     *
     * @param string $previous_version The version option value before this run.
     * @return void
     */
    public function do_migration( $previous_version ) {
        if ( version_compare( $previous_version, '1.1.0', '<' ) ) {
            $this->relax_automation_rule_id_to_nullable();
        }

        // llms.txt Generation & Management (readme.txt) added its own
        // rewrite rule this version — sites upgrading in place need a
        // flush to pick up '/llms.txt' without waiting for a deactivate/
        // reactivate cycle (VuloPilot::activate() already flushes, but
        // that only runs on a fresh activation). Deliberately OUTSIDE the
        // version_compare gate above, same reasoning as
        // create_crawler_visits_table() below: VULOPILOT_PLUGIN_VERSION
        // was already '1.1.0' before this rewrite rule existed, so a site
        // that had already recorded plugin_db_version=1.1.0 would never
        // satisfy `< 1.1.0` again and would silently never get this flush.
        //
        // Deferred to a late 'init' priority rather than called directly
        // here — confirmed via a real wp-env site that calling it
        // synchronously still 404s on /llms.txt, because both places
        // do_migration() ever runs from (init_plugin()'s plugins_loaded
        // path, and init_classes()'s own 'init' priority 0 path) execute
        // *before* GeoAnalysis\LlmsTxtGenerator's own 'init' (default
        // priority 10) callback has added the rewrite rule this flush is
        // supposed to pick up — flushing before the rule exists just
        // bakes in a rule set without it. Priority 20 guarantees this
        // runs after that priority-10 registration within the same 'init'
        // pass, however do_migration() itself got triggered.
        add_action( 'init', 'flush_rewrite_rules', 20 );

        // AI Crawler Traffic Monitoring (readme.txt) needs its own new
        // table for sites upgrading in place too — create_database_tables()
        // only ever runs for a brand-new install. Deliberately OUTSIDE the
        // version_compare gate above (unlike the two migrations inside it):
        // VULOPILOT_PLUGIN_VERSION was already '1.1.0' before this table's
        // migration code existed, so a site that had already recorded
        // plugin_db_version=1.1.0 (from activating an earlier build still
        // under this same version number) would never satisfy `< 1.1.0`
        // again and would silently never get this table — confirmed via a
        // real wp-env site hitting "Table ... doesn't exist" on every
        // /crawler-traffic request. dbDelta()'s CREATE TABLE IF NOT EXISTS
        // makes this safe to run unconditionally on every upgrade check,
        // the same self-healing shape create_database_tables() already
        // uses for a fresh install.
        self::create_crawler_visits_table();

        // The Geo module (modules/Geo/Module.php) didn't exist before this
        // version either — a site upgrading in place needs it added to
        // its active-module list the same way a fresh install gets it via
        // VuloPilot::activate()'s add_option(), or its "Auto-regenerate on
        // publish" setting would silently do nothing (the module governs
        // that hook; GEO scanning itself and the llms.txt route are core
        // and unaffected either way). Deliberately OUTSIDE the
        // version_compare gate, same reasoning as the two migrations
        // above; self-limiting after the first run since it only adds
        // 'geo' when it isn't already present.
        self::seed_geo_module_active();
    }

    /**
     * @return void
     */
    private static function seed_geo_module_active(): void {
        $active_modules = get_option( Utill::ACTIVE_MODULES_DB_KEY, array() );

        if ( in_array( 'geo', $active_modules, true ) ) {
            return;
        }

        $active_modules[] = 'geo';
        update_option( Utill::ACTIVE_MODULES_DB_KEY, $active_modules );
    }

    /**
     * 1.1.0 (AutomationEngine, ARCHITECTURE.md's Prompt 12): `rule_id` was
     * originally `NOT NULL`, a foreign key to the *separate*,
     * still-unbuilt user-authored-custom-rules table (`vulopilot_rules`,
     * see RULE-ENGINE.md's "What's not here yet") — but AutomationEngine
     * binds an automation to one of the 19 code-defined RuleInterface
     * rules by string id (`trigger_config.rule_key`), not a row in that
     * table. Loosening `NOT NULL` to nullable is additive/non-destructive:
     * this column has never actually been populated by any released
     * version (Automations couldn't be created via REST until this
     * version), so there is no existing data this could conflict with.
     *
     * @return void
     */
    private function relax_automation_rule_id_to_nullable() {
        global $wpdb;

        $table = $wpdb->prefix . Utill::TABLES['automation'];

        $wpdb->query( "ALTER TABLE `{$table}` MODIFY `rule_id` bigint(20) unsigned DEFAULT NULL" ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
    }
}
