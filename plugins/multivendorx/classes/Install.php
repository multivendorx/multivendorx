<?php
/**
 * Install class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Install class
 *
 * @class       Install class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Install {

    /**
     * Class constructor
     */
    public function __construct() {

        if ( ! get_option( 'dc_product_vendor_plugin_db_version', false ) ) {
            $this->create_database_table();
            $this->set_default_settings();
        } else {
            $this->do_migration();
        }
        $this->plugin_create_pages();
        update_option( 'dc_product_vendor_plugin_db_version', MULTIVENDORX_PLUGIN_VERSION );

        do_action( 'multivendorx_updated' );
    }

    /**
     * Runs the database migration process.
     */
    public static function do_migration() {
        // write migration code from 3.0.1.
    }

    /**
     * Create database table for subscriber.
     *
     * @return void
     */
    private static function create_database_table() {
        global $wpdb;

        // Get the charset collate for the tables.
        $collate = $wpdb->get_charset_collate();

        $sql_commission = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['commission'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `order_id` bigint(20) NOT NULL,
            `vendor_id` bigint(20) NOT NULL,
            `commission_amount` float(20, 2) NOT NULL DEFAULT 0,
            `shipping` float(20, 2) NOT NULL DEFAULT 0,
            `tax` float(20, 2) NOT NULL DEFAULT 0,
            `include_coupon` tinyint(1) NOT NULL,
            `include_shipping` tinyint(1) NOT NULL,
            `include_tax` tinyint(1) NOT NULL,
            `commission_total` float(20, 2) NOT NULL DEFAULT 0,
            `commission_refunded` float(20, 2) NOT NULL DEFAULT 0,
            `paid_status` varchar(20) NOT NULL,
            `commission_note`  longtext NULL,
            `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`ID`)
        ) $collate;";

        // Include upgrade functions if not loaded.
        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        dbDelta( $sql_commission );
    }

    /**
     * Set default settings for the plugin or module.
     *
     * @return void
     */
    private function set_default_settings() {
    }

    public function plugin_create_pages() {

        $option_value = get_option( 'mvx_product_vendor_vendor_dashboard_page_id' );

        if ( $option_value > 0 && get_post( $option_value ) ) {
            return;
        }

        $page_found = get_posts(
            array(
				'name'        => 'dashboard',
				'post_status' => 'publish',
				'post_type'   => 'page',
				'fields'      => 'ids',
				'numberposts' => 1,
            )
        );

        if ( $page_found ) {
            if ( ! $option_value ) {
                update_option( 'mvx_product_vendor_vendor_dashboard_page_id', $page_found[0] );
            }
            return;
        }

        $page_data = array(
            'post_status'    => 'publish',
            'post_type'      => 'page',
            'post_author'    => 1,
            'post_name'      => 'dashboard',
            'post_title'     => __( 'Vendor Dashboard', 'multivendorx' ),
            'post_content'   => '[multivendorx_vendor_dashboard]',
            'comment_status' => 'closed',
        );

        $page_id = wp_insert_post( $page_data );

        update_option( 'notifima_subscription_confirmation_page', $page_id );
    }
}
