<?php
/**
 * Install class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module Install class.
 *
 * Owns `vulocart_orders`/`vulocart_order_items` — same module-owned-table,
 * version-gated activation-hook pattern VuloCart\Cart\Install and
 * `vulocart-pro`'s `Passport\Util` already establish.
 *
 * @class       Install class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Install {

    /**
     * Version-gate option — see VuloCart\Cart\Install's own docblock for
     * why this is necessary (`vulocart_activated_module_order` fires on
     * every active-module pass, not only the first).
     *
     * @var string
     */
    const TABLE_SCHEMA_VERSION_OPTION = 'vulocart_order_table_version';

    /**
     * Current schema version.
     *
     * @var string
     */
    const TABLE_SCHEMA_VERSION = '1.0.0';

    /**
     * Install constructor.
     */
    public function __construct() {
        add_action( 'vulocart_activated_module_order', array( $this, 'maybe_create_tables' ) );
    }

    /**
     * Creates `vulocart_orders`/`vulocart_order_items` — only when
     * TABLE_SCHEMA_VERSION_OPTION is behind TABLE_SCHEMA_VERSION.
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

        // Vision: "Order Created" event, own tables. `order_number` is
        // stamped after insert (Infrastructure\WPDBOrderRepository::insert()
        // explains why); `access_token` is the guest order-tracking
        // credential, this module's equivalent of Cart's own `token`.
        // `order_items` has no `updated_at` — unlike cart items, an
        // order's line items are an immutable historical record once
        // placed.
        $sql_orders = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}vulocart_orders` (
            `id`             bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `order_number`   varchar(32) NOT NULL,
            `access_token`   varchar(64) NOT NULL,
            `cart_token`     varchar(64) DEFAULT NULL,
            `customer_email` varchar(200) DEFAULT NULL,
            `customer_name`  varchar(200) DEFAULT NULL,
            `status`         varchar(20) NOT NULL DEFAULT 'pending',
            `currency`       varchar(10) DEFAULT NULL,
            `subtotal`       decimal(19,4) NOT NULL DEFAULT 0.0000,
            `total`          decimal(19,4) NOT NULL DEFAULT 0.0000,
            `meta`           longtext DEFAULT NULL,
            `created_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_order_number` (`order_number`),
            KEY `idx_status` (`status`),
            KEY `idx_customer_email` (`customer_email`)
        ) $collate;";

        dbDelta( $sql_orders );

        $sql_order_items = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}vulocart_order_items` (
            `id`         bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `order_id`   bigint(20) unsigned NOT NULL,
            `asset_id`   bigint(20) unsigned NOT NULL,
            `title`      varchar(255) NOT NULL,
            `quantity`   int(10) unsigned NOT NULL DEFAULT 1,
            `unit_price` decimal(19,4) DEFAULT NULL,
            `currency`   varchar(10) DEFAULT NULL,
            `meta`       longtext DEFAULT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_order_id` (`order_id`),
            KEY `idx_asset_id` (`asset_id`)
        ) $collate;";

        dbDelta( $sql_order_items );

        update_option( self::TABLE_SCHEMA_VERSION_OPTION, self::TABLE_SCHEMA_VERSION );
    }
}
