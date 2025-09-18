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
        $this->create_database_triggers();
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

        // $sql_commission = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['commission'] . "` (
        //     `ID` bigint(20) NOT NULL AUTO_INCREMENT,
        //     `order_id` bigint(20) NOT NULL,
        //     `store_id` bigint(20) NOT NULL,
        //     `commission_amount` float(20, 2) NOT NULL DEFAULT 0,
        //     `shipping` float(20, 2) NOT NULL DEFAULT 0,
        //     `tax` float(20, 2) NOT NULL DEFAULT 0,
        //     `commission_total` float(20, 2) NOT NULL DEFAULT 0,
        //     `commission_refunded` float(20, 2) NOT NULL DEFAULT 0,
        //     `paid_status` varchar(20) NOT NULL,
        //     `commission_note`  longtext NULL,
        //     `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        //     PRIMARY KEY (`ID`)
        // ) $collate;";

        $sql_commission = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['commission'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `order_id` bigint(20) NOT NULL,
            `store_id` bigint(20) NOT NULL,
            `facilitator_id` bigint(20) NOT NULL DEFAULT 0,
            `customer_id` bigint(20) NOT NULL,
            `total_order_amount` float(10, 2) NOT NULL DEFAULT 0,
            `commission_amount` float(20, 2) NOT NULL DEFAULT 0,
            `facilitator_fee` float(20, 2) NOT NULL DEFAULT 0,
            `gateway_fee` float(20, 2) NOT NULL DEFAULT 0,
            `shipping_amount` float(20, 2) NOT NULL DEFAULT 0,
            `tax_amount` float(20, 2) NOT NULL DEFAULT 0,
            `shipping_tax_amount` float(20, 2) NOT NULL DEFAULT 0,
            `discount_amount` float(20, 2) NOT NULL DEFAULT 0,
            `commission_total` float(20, 2) NOT NULL DEFAULT 0,
            `commission_refunded` float(20, 2) NOT NULL DEFAULT 0,
            `currency` varchar(10) NOT NULL,
            `status` enum('paid','refunded','partially_refunded','cancelled') DEFAULT 'paid',
            `commission_note`  longtext NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`ID`)
        ) $collate;";

        $sql_store = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['store'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `status` varchar(20) DEFAULT NULL,
            `name` varchar(20) NOT NULL,
            `slug` varchar(20) NOT NULL,
            `description` TEXT DEFAULT NULL,
            `who_created` bigint(20) DEFAULT NULL,
            `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`ID`)
        ) $collate;";

        $sql_store_users = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['store_users'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `store_id` bigint(20) NOT NULL,
            `user_id` bigint(20) NOT NULL,
            `role_id` varchar(50) DEFAULT NULL,
            `primary_owner` bigint(20) DEFAULT NULL,
            PRIMARY KEY (`ID`)
        ) $collate;";

        $sql_store_meta = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['store_meta'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `store_id` bigint(20) NOT NULL,
            `meta_key` VARCHAR(255) DEFAULT NULL,
            `meta_value` LONGTEXT,
            PRIMARY KEY (`ID`)
        ) $collate;";
         
        $sql_transaction = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['transaction'] . "` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `store_id` bigint(20) unsigned NOT NULL,
            `order_id` bigint(20) unsigned DEFAULT NULL,
            `commission_id` bigint(20) unsigned DEFAULT NULL,
            `entry_type` enum('Dr','Cr') NOT NULL,
            `transaction_type` enum('Commission','Withdrawal','Refund','Reversed', 'COD received') NOT NULL,
            `amount` float(20,2) NOT NULL,
            `balance` float(20,2) NOT NULL,
            `locking_balance` float(20,2) NOT NULL,
            `currency` varchar(10) NOT NULL,
            `narration` text NOT NULL,
            `status` enum('Pending','Processed','Completed', 'Failed') DEFAULT 'Pending',
            `available_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_store` (`store_id`),
            KEY `idx_order` (`order_id`),
            KEY `idx_commission` (`commission_id`),
            KEY `idx_type` (`transaction_type`)
        ) $collate;";

        $sql_real_time_transaction = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['real_time_transaction'] . "` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `receiver_id` bigint(20) unsigned NOT NULL,
            `order_id` bigint(20) unsigned DEFAULT NULL,
            `commission_id` bigint(20) unsigned DEFAULT NULL,
            `receiver_type`Text NOT NULL,
            `amount` float(20,2) NOT NULL,
            `currency` varchar(10) NOT NULL,
            `narration` text NOT NULL,
            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_store` (`receiver_id`),
            KEY `idx_order` (`order_id`),
            KEY `idx_commission` (`commission_id`)
        ) $collate;";

        $sql_qna = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['product_qna'] . "` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            question_text TEXT NOT NULL,
            question_by INT NOT NULL,
            question_date DATETIME NOT NULL,
            answer_text TEXT,
            answer_by INT,
            answer_date DATETIME,
            total_votes INT DEFAULT 0,
            voters TEXT,
            question_visibility VARCHAR(50) DEFAULT 'public'
        ) $collate;";

        // Include upgrade functions if not loaded.
        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }
        
        dbDelta( $sql_commission );
        dbDelta( $sql_store );
        dbDelta( $sql_store_users );
        dbDelta( $sql_store_meta );
        dbDelta( $sql_transaction );
        dbDelta( $sql_real_time_transaction );
        dbDelta( $sql_qna );
    }

    public function create_database_triggers() {
        global $wpdb;

        // Drop the trigger if it exists
        $wpdb->query("DROP TRIGGER IF EXISTS update_store_balance");

        // Create the trigger
        $sql = "
        CREATE TRIGGER update_store_balance
        BEFORE INSERT ON wp_multivendorx_transactions
        FOR EACH ROW
        BEGIN
            DECLARE last_balance DECIMAL(20,2);
            DECLARE last_locking_balance DECIMAL(20,2);

            SELECT balance, locking_balance
            INTO last_balance, last_locking_balance
            FROM wp_multivendorx_transactions
            WHERE store_id = NEW.store_id
            ORDER BY id DESC
            LIMIT 1;

            IF last_balance IS NULL THEN
                SET last_balance = 0.00;
            END IF;
            IF last_locking_balance IS NULL THEN
                SET last_locking_balance = 0.00;
            END IF;

            IF NEW.transaction_type = 'Commission' AND NEW.entry_type = 'Cr' THEN
                IF NEW.status = 'Completed' THEN
                    SET NEW.balance = last_balance + NEW.amount;
                    SET NEW.locking_balance = last_locking_balance;
                ELSEIF NEW.status = 'Pending' THEN
                    SET NEW.balance = last_balance;
                    SET NEW.locking_balance = last_locking_balance + NEW.amount;
                ELSE
                    SET NEW.balance = last_balance;
                    SET NEW.locking_balance = last_locking_balance;
                END IF;
            ELSEIF NEW.transaction_type = 'Withdrawal' AND NEW.entry_type = 'Dr' THEN
                IF NEW.status = 'Completed' THEN
                    SET NEW.balance = last_balance - NEW.amount;
                    SET NEW.locking_balance = last_locking_balance;
                ELSEIF NEW.status = 'Failed' THEN
                    SET NEW.balance = last_balance;
                    SET NEW.locking_balance = last_locking_balance;
                END IF;
            ELSE
                SET NEW.balance = last_balance;
                SET NEW.locking_balance = last_locking_balance;
            END IF;
        END;
        ";

        // Execute the trigger
        $wpdb->query($sql);

    }

    /**
     * Set default settings for the plugin or module.
     *
     * @return void
     */
    private function set_default_settings() {
        // 1. Get the existing option from DB
        $settings = get_option('multivendorx_identity_verification_settings', []);

        $review_settings = get_option('multivendorx_review_management_settings', []);
        $order_settings  = get_option('multivendorx_order_actions_refunds_settings', []);


        // 2. Modify only what you need
        $settings['all_verification_methods']['ID']['verification_methods'] = [

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
    
        // 3. Set default review ratings parameters
        $review_settings['ratings_parameters'] = [
            'Shipping',
            'Product quality',
            'Reliability',
        ];
    
        // 4. Set default product review sync
        $review_settings['product_review_sync'] = [
            'product_review_sync',
        ];
    
        // 5. Set default abuse report reasons
        $order_settings['abuse_report_reasons'] = [
            'Product not received',
            'Product not as described',
            'Product damaged/defective',
            'Wrong item received',
            'Order arrived late'
        ];
    
        // 6. Save back to DB
        update_option('multivendorx_identity_verification_settings', $settings);
        update_option('multivendorx_review_management_settings', $review_settings);
        update_option('multivendorx_order_actions_refunds_settings', $order_settings);
    }
    

    public function plugin_create_pages() {

        $pages_to_create = [
            [
                'option_key' => 'mvx_product_vendor_vendor_dashboard_page_id',
                'slug'       => 'dashboard',
                'title'      => __( 'Store Dashboard', 'multivendorx' ),
                'shortcode'  => '[multivendorx_store_dashboard]',
            ],
            [
                'option_key' => 'mvx_product_vendor_store_registration_page_id',
                'slug'       => 'store-registration',
                'title'      => __( 'Store Registration', 'multivendorx' ),
                'shortcode'  => '[multivendorx_store_registration]',
            ],
            [
                'option_key' => 'mvx_product_vendor_vendor_orders_page_id',
                'slug'       => 'vendor-orders',
                'title'      => __( 'Vendor Orders', 'multivendorx' ),
                'shortcode'  => '[multivendorx_vendor_orders]',
            ],
        ];
        
        $this->plugin_create_pages_dynamic( $pages_to_create );
        
    }

    public function plugin_create_pages_dynamic( $pages = [] ) {
        if ( empty( $pages ) || ! is_array( $pages ) ) {
            return;
        }
    
        foreach ( $pages as $page ) {
            // Validate required keys
            if ( empty( $page['option_key'] ) || empty( $page['slug'] ) || empty( $page['title'] ) || empty( $page['shortcode'] ) ) {
                continue;
            }
    
            $option_key = $page['option_key'];
            $slug       = $page['slug'];
            $title      = $page['title'];
            $shortcode  = $page['shortcode'];
    
            // Check if option already set
            $option_value = get_option( $option_key );
            if ( $option_value > 0 && get_post( $option_value ) ) {
                continue;
            }
    
            // Check if page with slug exists
            $page_found = get_posts(
                array(
                    'name'        => $slug,
                    'post_status' => 'publish',
                    'post_type'   => 'page',
                    'fields'      => 'ids',
                    'numberposts' => 1,
                )
            );
    
            if ( $page_found ) {
                if ( ! $option_value ) {
                    update_option( $option_key, $page_found[0] );
                }
                continue;
            }
    
            // Create the page
            $page_data = array(
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'post_author'    => 1,
                'post_name'      => $slug,
                'post_title'     => $title,
                'post_content'   => $shortcode,
                'comment_status' => 'closed',
            );
    
            $page_id = wp_insert_post( $page_data );
    
            update_option( $option_key, $page_id );
        }
    }
    
}
