<?php
/**
 * Install class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Cart;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Cart module Install class.
 *
 * Owns `vulocart_carts`/`vulocart_cart_items` — module-owned data, so
 * these tables are created here rather than in the plugin-level
 * `VuloCart\Install` (which only owns `vulocart_assets`, the plugin's
 * always-on core entity). Same version-gated activation-hook pattern
 * `vulocart-pro`'s `Passport\Util` already establishes.
 *
 * @class       Install class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Install {

    /**
     * Version-gate option — checked so the dbDelta() calls below only
     * actually run once (on first activation, or after a future schema
     * bump), not on every request this module happens to be active.
     * `vulocart_activated_module_cart` fires on every
     * Modules::load_active_modules() pass while the module is active, not
     * only the very first one (module-architecture.md), so an unguarded
     * dbDelta() call here would re-run its schema introspection on every
     * single request — this option is what makes it idempotent instead
     * (performance.md).
     *
     * @var string
     */
    const TABLE_SCHEMA_VERSION_OPTION = 'vulocart_cart_table_version';

    /**
     * Current schema version — bump this alongside a new dbDelta() call in
     * maybe_create_tables() when the tables need an additive change.
     *
     * @var string
     */
    const TABLE_SCHEMA_VERSION = '1.0.0';

    /**
     * Install constructor.
     */
    public function __construct() {
        add_action( 'vulocart_activated_module_cart', array( $this, 'maybe_create_tables' ) );
    }

    /**
     * Creates `vulocart_carts`/`vulocart_cart_items` — only when
     * TABLE_SCHEMA_VERSION_OPTION is behind TABLE_SCHEMA_VERSION, so this
     * is a no-op on every request after the first successful run.
     *
     * @return void
     */
    public function maybe_create_tables(): void {
        if ( get_option( self::TABLE_SCHEMA_VERSION_OPTION ) === self::TABLE_SCHEMA_VERSION ) {
            return;
        }

        global $wpdb;

        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        $collate = $wpdb->get_charset_collate();

        // Vision: independent Cart Engine, own tables — not WooCommerce's
        // cart/session. `token` is the cart's client-held identity
        // (Domain\Cart's own docblock explains why); items are a separate
        // table rather than a JSON column on the cart row so quantity
        // updates/deletes on one line item don't require rewriting the
        // whole cart.
        $sql_carts = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}vulocart_carts` (
            `id`         bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `token`      varchar(64) NOT NULL,
            `currency`   varchar(10) DEFAULT NULL,
            `meta`       longtext DEFAULT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_token` (`token`)
        ) $collate;";

        dbDelta( $sql_carts );

        $sql_cart_items = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}vulocart_cart_items` (
            `id`         bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `cart_id`    bigint(20) unsigned NOT NULL,
            `asset_id`   bigint(20) unsigned NOT NULL,
            `quantity`   int(10) unsigned NOT NULL DEFAULT 1,
            `unit_price` decimal(19,4) DEFAULT NULL,
            `currency`   varchar(10) DEFAULT NULL,
            `meta`       longtext DEFAULT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_cart_id` (`cart_id`),
            KEY `idx_asset_id` (`asset_id`)
        ) $collate;";

        dbDelta( $sql_cart_items );

        update_option( self::TABLE_SCHEMA_VERSION_OPTION, self::TABLE_SCHEMA_VERSION );
    }
}
