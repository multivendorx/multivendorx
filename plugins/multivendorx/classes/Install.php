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

        $this->set_default_settings();

        // if ( ! get_option( 'dc_product_vendor_plugin_db_version', false ) ) {
        //     $this->create_database_table();
        //     $this->set_default_settings();
        // } else {
        //     $this->do_migration();
        // }
            
        $this->create_database_table();
        $this->plugin_create_pages();
        update_option( 'dc_product_vendor_plugin_db_version', MULTIVENDORX_PLUGIN_VERSION );

        do_action('multivendorx_updated');
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
            `store_id` bigint(20) NOT NULL,
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

        $sql_store = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['store'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `status` varchar(20) DEFAULT NULL,
            `name` varchar(20) NOT NULL,
            `slug` varchar(20) NOT NULL,
            `description` TEXT DEFAULT NULL,
            `who_created` TEXT DEFAULT NULL,
            `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`ID`)
        ) $collate;";

        $sql_store_users = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['store_users'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `store_id` bigint(20) NOT NULL,
            `user_id` bigint(20) NOT NULL,
            `role_id` bigint(20) NOT NULL,
            `primary_owner` TEXT DEFAULT NULL,
            PRIMARY KEY (`ID`)
        ) $collate;";

        $sql_store_social = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['store_meta'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `store_id` bigint(20) NOT NULL,
            `address_1` TEXT DEFAULT NULL,
            `address_2` TEXT DEFAULT NULL,
            `city` varchar(20) DEFAULT NULL,
            `postcode` varchar(20) DEFAULT NULL,
            `country` varchar(100) DEFAULT NULL,
            `country_code` varchar(20) DEFAULT NULL,
            `state` varchar(100) DEFAULT NULL,
            `state_code` varchar(20) DEFAULT NULL, 
            `phone` bigint(20) DEFAULT 0,
            `commission_fixed` float(20, 2) NOT NULL DEFAULT 0,
            `commission_percentage` float(20, 2) NOT NULL DEFAULT 0,
            `location` varchar(255) DEFAULT NULL,
            `lat` varchar(100) DEFAULT NULL,
            `lng` varchar(100) DEFAULT NULL,
            `image` TEXT DEFAULT NULL,
            `banner` TEXT DEFAULT NULL,
            `banner_type` varchar(100) DEFAULT NULL,
            `video` varchar(255) DEFAULT NULL,
            `slider` varchar(255) DEFAULT NULL,
            `facebook` varchar(20),
            `twitter` varchar(20),
            `linkdin` varchar(20),
            `youtube` varchar(20),
            `pinterest` varchar(20),
            `instagram` varchar(20),
            PRIMARY KEY (`ID`)
        ) $collate;";
         
        // Include upgrade functions if not loaded.
        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }
        
        dbDelta( $sql_commission );
        dbDelta( $sql_store );
        dbDelta( $sql_store_users );
        dbDelta( $sql_store_social );
    }

    /**
     * Set default settings for the plugin or module.
     *
     * @return void
     */
    private function set_default_settings() {
                // 1. Get the existing option from DB
        $settings = get_option('multivendorx_identity_verification_settings', []);

        // 2. Modify only what you need
        $settings['payment_methods']['ID']['verification_methods'] = [
            [
                'label'    => 'National Id',
                'required' => true,
                'active'   => true,
            ],
            [
                'label'    => 'Voter Id',
                'required' => true,
                'active'   => false,
            ],
        ];

        // 3. Save back to DB
        update_option('multivendorx_identity_verification_settings', $settings);

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
            'post_title'     => __( 'Store Dashboard', 'multivendorx' ),
            'post_content'   => '[multivendorx_store_dashboard]',
            'comment_status' => 'closed',
        );

        $page_id = wp_insert_post( $page_data );

        update_option( 'mvx_product_vendor_vendor_dashboard_page_id', $page_id );
    }
}
