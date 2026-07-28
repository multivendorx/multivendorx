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
 * Owns only `vulocart_assets` — Asset is the plugin's always-on core
 * entity (module-architecture.md: modules are never core, always-loaded
 * infrastructure). Cart and Order used to have their tables created here
 * too, before both became real toggleable modules
 * (`modules/Cart/Install.php`, `modules/Order/Install.php`) — a module's
 * own tables are created on its own activation hook instead, same
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

        $collate = $wpdb->get_charset_collate();

        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        // Asset (vision: "Never use Product internally, instead use Asset" —
        // one table covers every asset type in Domain\Asset\AssetType;
        // `type` distinguishes physical/digital/subscription/etc rather
        // than a table-per-type, and `meta`/`passport` are extensible JSON
        // bags rather than fixed columns per type, since the type list is
        // expected to keep growing (vision: "Future Asset Types").
        $sql_assets = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['asset'] . "` (
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

        dbDelta( $sql_assets );
    }

    /**
     * Runs incremental, version-gated schema changes for upgrades from an
     * already-installed copy of VuloCart. Additive only, per
     * .claude/rules/backward-compatibility.md — ADD COLUMN / ADD INDEX,
     * never DROP. Empty today (nothing has shipped past 1.0.0 yet) — kept
     * as the version-gated seam future core-schema changes go through,
     * rather than being added only once one is actually needed.
     *
     * @param string $previous_version The version option value before this run.
     * @return void
     */
    public function do_migration( $previous_version ) {
        unset( $previous_version );
    }
}
