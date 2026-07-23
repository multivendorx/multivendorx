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
            `rule_id`           bigint(20) unsigned NOT NULL,
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
    }

    /**
     * Runs incremental, version-gated schema changes for upgrades from an
     * already-installed copy of VuloPilot. Additive only, per
     * .claude/rules/backward-compatibility.md — ADD COLUMN / ADD INDEX,
     * never DROP. Empty today: the schema is still at its 1.0.0 baseline;
     * the next schema change adds its own `version_compare( $previous_version, ... )`
     * block here, following the exact precedent in MultiVendorX\Install::do_migration().
     *
     * @param string $previous_version The version option value before this run.
     * @return void
     */
    public function do_migration( $previous_version ) {
        // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable
    }
}
