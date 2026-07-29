<?php
/**
 * Install class file.
 *
 * @package VuloCart
 */

namespace VuloCart;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Install class.
 *
 * Creates VuloCart's custom database tables on first install and runs
 * version-gated incremental migrations on upgrade, following the same
 * dbDelta()-based pattern as MultiVendorX\Install/VuloPilot\Install.
 *
 * Owns `vulocart_offerings` (Offering is the plugin's always-on core entity)
 * plus the catalog-taxonomy tables the Offerings menu's Categories/
 * Brands/Collections/Attributes/Reviews pages need
 * (`vulocart_terms`, `vulocart_attributes`, `vulocart_attribute_values`,
 * `vulocart_reviews`) — all core, always-loaded infrastructure the same
 * way Offering is, not a toggleable module. Cart and Order's own tables are
 * created on their own module activation hooks instead
 * (`modules/Cart/Install.php`, `modules/Order/Install.php`), same
 * "module owns its own schema" convention `vulocart-pro`'s Passport
 * module already establishes, not from this plugin-level class.
 *
 * @class       Install class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Install {

    /**
     * Class constructor — runs migration immediately.
     *
     * Only ever constructed from VuloCart::init_classes() and
     * VuloCart::init_plugin() (both at/after 'init'), so, like
     * VuloPilot\Install, running synchronously here is safe.
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
        $previous_version = get_option( Utill::OTHER_SETTINGS['plugin_db_version'], false );

        if ( ! $previous_version ) {
            $this->create_database_tables();
        } else {
            $this->do_migration( $previous_version );
        }

        update_option( Utill::OTHER_SETTINGS['plugin_db_version'], VULOCART_PLUGIN_VERSION );
        do_action( 'vulocart_after_installed' );
    }

    /**
     * Creates every VuloCart custom table for a fresh install. Additive-only
     * from here on — later schema changes belong in do_migration(), never
     * here.
     *
     * @return void
     */
    private static function create_database_tables() {
        global $wpdb;

        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        self::create_offering_table();
        self::create_catalog_taxonomy_tables();
    }

    /**
     * Creates `vulocart_offerings`.
     *
     * No `IF NOT EXISTS` in the CREATE TABLE statement — `dbDelta()`
     * extracts the table name via a regex that stops at the first space
     * after `CREATE TABLE`, so `CREATE TABLE IF NOT EXISTS ...` reads as
     * table name `IF` and silently does nothing to the real table. A
     * real, previously-undetected instance of this exact bug (found while
     * building modules/Order/Install.php's own 1.1.0 migration —
     * `dbDelta()` there returned `['IF' => 'Created table IF']` and
     * touched nothing) — harmless until now only because this table
     * never needed a post-install schema change before.
     *
     * @return void
     */
    private static function create_offering_table() {
        global $wpdb;

        $collate = $wpdb->get_charset_collate();

        // Vision: "Never use Product internally, instead use Offering" —
        // one table covers every offering type in Domain\Offering\OfferingType;
        // `type` distinguishes physical/digital/subscription/etc rather
        // than a table-per-type, and `meta`/`passport` are extensible JSON
        // bags rather than fixed columns per type, since the type list is
        // expected to keep growing (vision: "Future Offering Types").
        $sql_offerings = "CREATE TABLE `{$wpdb->prefix}" . Utill::TABLES['offering'] . "` (
            `id`         bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `type`       varchar(50) NOT NULL,
            `sku`        varchar(100) DEFAULT NULL,
            `title`      varchar(255) NOT NULL,
            `slug`       varchar(200) NOT NULL,
            `status`     varchar(20) NOT NULL DEFAULT 'draft',
            `price`      decimal(19,4) DEFAULT NULL,
            `currency`   varchar(10) DEFAULT NULL,
            `meta`       longtext DEFAULT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_type` (`type`),
            KEY `idx_status` (`status`),
            KEY `idx_sku` (`sku`),
            KEY `idx_slug` (`slug`)
        ) $collate;";

        dbDelta( $sql_offerings );
    }

    /**
     * Creates `vulocart_terms` (Categories/Brands/Collections —
     * Domain\Term\Taxonomy's own docblock explains the shared-table
     * design), `vulocart_attributes`/`vulocart_attribute_values`, and
     * `vulocart_reviews`.
     *
     * @return void
     */
    private static function create_catalog_taxonomy_tables() {
        global $wpdb;

        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        $collate = $wpdb->get_charset_collate();

        $sql_terms = "CREATE TABLE `{$wpdb->prefix}vulocart_terms` (
            `id`          bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `taxonomy`    varchar(20) NOT NULL,
            `name`        varchar(200) NOT NULL,
            `slug`        varchar(200) NOT NULL,
            `parent_id`   bigint(20) unsigned DEFAULT NULL,
            `description` text DEFAULT NULL,
            `meta`        longtext DEFAULT NULL,
            `created_at`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_taxonomy_slug` (`taxonomy`, `slug`),
            KEY `idx_parent_id` (`parent_id`)
        ) $collate;";

        dbDelta( $sql_terms );

        $sql_attributes = "CREATE TABLE `{$wpdb->prefix}vulocart_attributes` (
            `id`         bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name`       varchar(200) NOT NULL,
            `slug`       varchar(200) NOT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_slug` (`slug`)
        ) $collate;";

        dbDelta( $sql_attributes );

        $sql_attribute_values = "CREATE TABLE `{$wpdb->prefix}vulocart_attribute_values` (
            `id`           bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `attribute_id` bigint(20) unsigned NOT NULL,
            `value`        varchar(200) NOT NULL,
            `created_at`   timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_attribute_id` (`attribute_id`)
        ) $collate;";

        dbDelta( $sql_attribute_values );

        $sql_reviews = "CREATE TABLE `{$wpdb->prefix}vulocart_reviews` (
            `id`             bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `offering_id`       bigint(20) unsigned NOT NULL,
            `customer_name`  varchar(200) DEFAULT NULL,
            `customer_email` varchar(200) DEFAULT NULL,
            `rating`         tinyint(1) unsigned NOT NULL DEFAULT 5,
            `title`          varchar(200) DEFAULT NULL,
            `content`        text DEFAULT NULL,
            `status`         varchar(20) NOT NULL DEFAULT 'pending',
            `created_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_offering_id` (`offering_id`),
            KEY `idx_status` (`status`)
        ) $collate;";

        dbDelta( $sql_reviews );
    }

    /**
     * Runs incremental, version-gated schema changes for upgrades from an
     * already-installed copy of VuloCart. Additive only, per
     * .claude/rules/backward-compatibility.md — ADD COLUMN / ADD INDEX /
     * a whole new CREATE TABLE, never DROP.
     *
     * No steps yet — VuloCart hasn't shipped publicly, so there's no real
     * installed base at an earlier schema version to migrate from; every
     * table this plugin needs is already created directly, in its current
     * shape, by create_database_tables(). This method exists as the
     * landing spot for the first real post-launch migration, matching
     * MultiVendorX\Install/VuloPilot\Install's own pattern.
     *
     * @param string $previous_version The version option value before this run.
     * @return void
     */
    public function do_migration( $previous_version ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
    }
}
