<?php
/**
 * Install class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;

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

        $this->create_database_table();
        $this->create_database_triggers();
        $this->plugin_create_pages();
        $this->set_default_modules();
        $this->set_default_settings();

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
        $max_index_length = 191;

        $sql_commission = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['commission'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `order_id` bigint(20) NOT NULL,
            `store_id` bigint(20) NOT NULL,
            `facilitator_id` bigint(20) NOT NULL DEFAULT 0,
            `customer_id` bigint(20) NOT NULL,
            `total_order_value` float(10, 2) NOT NULL DEFAULT 0,
            `net_items_cost` float(10, 2) NOT NULL DEFAULT 0,
            `marketplace_commission` float(20, 2) NOT NULL DEFAULT 0,
            `store_earning` float(20, 2) NOT NULL DEFAULT 0,
            `facilitator_fee` float(20, 2) NOT NULL DEFAULT 0,
            `gateway_fee` float(20, 2) NOT NULL DEFAULT 0,
            `platform_fee` float(20, 2) NOT NULL DEFAULT 0,
            `store_shipping` float(20, 2) NOT NULL DEFAULT 0,
            `store_tax` float(20, 2) NOT NULL DEFAULT 0,
            `store_shipping_tax` float(20, 2) NOT NULL DEFAULT 0,
            `marketplace_tax` float(20, 2) NOT NULL DEFAULT 0,
            `marketplace_shipping_tax` float(20, 2) NOT NULL DEFAULT 0,
            `store_discount` float(20, 2) NOT NULL DEFAULT 0,
            `admin_discount` float(20, 2) NOT NULL DEFAULT 0,
            `store_payable` float(20, 2) NOT NULL DEFAULT 0,
            `marketplace_payable` float(20, 2) NOT NULL DEFAULT 0,
            `store_refunded` float(20, 2) NOT NULL DEFAULT 0,
            `marketplace_refunded` float(20, 2) NOT NULL DEFAULT 0,
            `currency` varchar(10) NOT NULL,
            `status` enum('unpaid', 'paid','refunded','partially_refunded','cancelled') DEFAULT 'unpaid',
            `commission_note`  longtext NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `rules_applied` LONGTEXT,
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
            `payment_method` varchar(50) DEFAULT NULL,
            `narration` text NOT NULL,
            `status` enum('Upcoming','Processed','Completed', 'Failed') DEFAULT 'Upcoming',
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
            `id` INT NOT NULL AUTO_INCREMENT,
            `product_id` INT NOT NULL,
            `store_id` INT NOT NULL,
            `question_text` TEXT NOT NULL,
            `question_by` INT NOT NULL,
            `question_date` DATETIME NOT NULL,
            `answer_text` TEXT,
            `answer_by` INT,
            `answer_date` DATETIME,
            `total_votes` INT DEFAULT 0,
            `voters` TEXT,
            `question_visibility` VARCHAR(50) DEFAULT 'public',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) $collate;";

        $sql_report_abuse = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['report_abuse'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `store_id` bigint(20) NOT NULL,
            `product_id` bigint(20) NOT NULL,
            `name` VARCHAR(255) DEFAULT NULL,
            `email` VARCHAR(255) DEFAULT NULL,
            `message` LONGTEXT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`ID`)
        ) $collate;";

        $sql_shipping_zone_locations = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['shipping_zone_locations'] . "` (
            `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
            `store_id` int(11) DEFAULT NULL,
            `zone_id` int(11) DEFAULT NULL,
            `location_code` varchar(255) DEFAULT NULL,
            `location_type` varchar(255) DEFAULT NULL,
            PRIMARY KEY (`id`)
        ) $collate;";

        $sql_product_map = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['products_map'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `product_map` VARCHAR(255) NOT NULL DEFAULT '',
            `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`ID`)
        ) $collate;";

        $sql_review = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['review'] . "` (
            `review_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
            `store_id` BIGINT(20) NOT NULL,
            `customer_id` BIGINT(20) NOT NULL,
            `order_id` BIGINT(20) NULL DEFAULT NULL,
            `overall_rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
            `review_title` VARCHAR(255) NULL DEFAULT NULL,
            `review_content` TEXT NULL DEFAULT NULL,
            `review_images` LONGTEXT NULL DEFAULT NULL,
            `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
            `reply` TEXT NULL DEFAULT NULL,
            `reply_date` DATETIME NULL DEFAULT NULL,
            `reported` TINYINT(1) NOT NULL DEFAULT 0,
            `date_created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `date_modified` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`review_id`)
        ) $collate;";

        $sql_ratings = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['rating'] . "` (
            `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
            `review_id` BIGINT(20) NOT NULL,
            `parameter` VARCHAR(100) NOT NULL,
            `rating_value` TINYINT(1) NOT NULL DEFAULT 0,
            PRIMARY KEY (`id`)
        ) $collate;";

        $sql_notifications = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['notifications'] . "` (
            `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
            `store_id` BIGINT(20) DEFAULT NULL,
            `category` ENUM('activity', 'notification') NOT NULL DEFAULT 'activity',
            `type` TEXT NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `message` TEXT NOT NULL,
            `is_read` BOOLEAN DEFAULT 0,
            `is_dismissed` BOOLEAN DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `expires_at` DATETIME NULL,
            PRIMARY KEY (`id`)
        ) $collate;";

        $sql_system_events = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['system_events'] . "` (
            `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
            `event_name` VARCHAR(255) NOT NULL,
            `description` TEXT NULL,
            `category` ENUM('activity', 'notification') NOT NULL DEFAULT 'activity',
            `tag` TEXT NOT NULL,
            `admin_enabled` BOOLEAN DEFAULT FALSE,
            `customer_enabled` BOOLEAN DEFAULT FALSE,
            `store_enabled` BOOLEAN DEFAULT FALSE,
            `sms_enabled` BOOLEAN DEFAULT FALSE,
            `email_enabled` BOOLEAN DEFAULT FALSE,
            `system_enabled` BOOLEAN DEFAULT FALSE,
            `custom_emails` JSON NULL,
            `email_subject` VARCHAR(255) NULL,
            `email_body` TEXT NULL,
            `sms_content` VARCHAR(500) NULL,
            `system_message` TEXT NULL,
            `system_action` VARCHAR(255) NULL,
            `status` ENUM('active', 'inactive') DEFAULT 'active',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) $collate;";

        $sql_stats = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['visitors_stats'] . "` (
            `ID` bigint(20) NOT NULL AUTO_INCREMENT,
            `store_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
            `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
            `user_cookie` varchar(255) NOT NULL,
            `session_id` varchar(191) NOT NULL,
            `ip` varchar(60) NOT NULL,
            `lat` varchar(60) NOT NULL,
            `lon` varchar(60) NOT NULL,
            `city` text NOT NULL,
            `zip` varchar(20) NOT NULL,
            `regionCode` text NOT NULL,
            `region` text NOT NULL,
            `countryCode` text NOT NULL,
            `country` text NOT NULL,
            `isp` text NOT NULL,
            `timezone` varchar(255) NOT NULL,
            `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`ID`),
            CONSTRAINT visitor UNIQUE (store_id, session_id),
            KEY store_id (store_id),
            KEY user_id (user_id),
            KEY user_cookie (user_cookie($max_index_length)),
            KEY session_id (session_id($max_index_length)),
            KEY ip (ip)
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
        dbDelta( $sql_report_abuse );
        dbDelta( $sql_shipping_zone_locations );
        dbDelta( $sql_product_map );
        dbDelta( $sql_review );
        dbDelta( $sql_ratings );
        dbDelta( $sql_notifications );
        dbDelta( $sql_system_events );
        dbDelta( $sql_stats );
    }

    /**
     * Create database triggers.
     */
    public function create_database_triggers() {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
        $wpdb->query( 'DROP TRIGGER IF EXISTS update_store_balance' );

        // Create the trigger.
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
                ELSEIF NEW.status = 'Upcoming' THEN
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
            ELSEIF NEW.transaction_type = 'Refund' AND NEW.entry_type = 'Dr' THEN
                IF NEW.status = 'Completed' THEN
                    SET NEW.balance = last_balance - NEW.amount;
                    SET NEW.locking_balance = last_locking_balance;
                ELSEIF NEW.status = 'Failed' THEN
                    SET NEW.balance = last_balance;
                    SET NEW.locking_balance = last_locking_balance;
                END IF;
            ELSEIF NEW.transaction_type = 'Reversed' AND NEW.entry_type = 'Dr' THEN
                IF NEW.status = 'Completed' THEN
                    SET NEW.balance = last_balance - NEW.amount;
                    SET NEW.locking_balance = last_locking_balance;
                ELSE
                    SET NEW.balance = last_balance;
                    SET NEW.locking_balance = last_locking_balance;
                END IF;
            ELSE
                SET NEW.balance = last_balance;
                SET NEW.locking_balance = last_locking_balance;
            END IF;
        END;
        ";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $wpdb->query( $sql );

        // if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
        //     MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        // }
    }

    /**
     * Set default modules
     * @return void
     */
    public static function set_default_modules() {            
        // Enable module by default
        $active_modules = get_option( Utill::ACTIVE_MODULES_DB_KEY, [] );
        $default_modules = array(
            'announcement', 'knowledgebase', 'simple', 'question-answer', 'privacy'
        );
        update_option( Utill::ACTIVE_MODULES_DB_KEY, array_unique( array_merge( $active_modules, $default_modules ) ) );
    }

    /**
     * Set default settings for the plugin or module.
     *
     * @return void
     */
    private function set_default_settings() {
        $settings = array(
            'badge_img' => 'adminfont-verification1',
            'all_verification_methods' => array( 
                'google-connect' => [
                    'enable' => true
                ]
            )
        );

        $legal_settings              = array(
            'seller_agreement'        => 
                'This Seller Agreement (“Agreement”) is entered into between Marketplace (“Platform”) and the Seller (“You” or “Seller”) upon registration on the Platform. By submitting this agreement and uploading the required documents, you agree to comply with all rules, policies, and guidelines of the Platform.

                1. Eligibility and Registration
                - Seller must be at least 18 years old and legally eligible to operate a business.
                - All business registration documents must be submitted and verified.

                2. Product Listing Rules
                - Only products allowed under prohibited/restricted categories may be listed.
                - Product descriptions, images, and certifications must be accurate and truthful.
                - Counterfeit or illegal products are prohibited.

                3. Order Fulfillment
                - Orders must be fulfilled on time.
                - Inventory must be accurately maintained.

                4. Payments & Commissions
                - Commissions deducted as per agreed rates.
                - Payouts only for verified sellers.

                5. Legal Compliance
                - Compliance with tax, consumer protection, and intellectual property laws.
                - Anti-counterfeit and copyright regulations must be followed.

                6. Refunds & Returns
                - Must follow platform policies.

                7. Termination
                - Platform may suspend or terminate accounts for violations.

                8. Amendments
                - Platform may update this agreement. Sellers will be notified.

                By signing and submitting, the Seller accepts all terms above.
                ',
            'terms_conditions'        => 
                '1. General
                - Use of the Platform constitutes agreement to these Terms & Conditions.
                - Sellers must act with honesty, transparency, and integrity.

                2. Account Responsibility
                - Keep account credentials secure.
                - No falsification of information.

                3. Product Guidelines
                - Products must be legal, safe, and comply with guidelines.
                - Prohibited or counterfeit products are forbidden.

                4. Fees & Payments
                - Commission and transaction fees apply.
                - Payouts require verification of bank and tax details.

                5. Dispute Resolution
                - Platform mediates disputes; sellers must comply with resolutions.

                6. Modification of Terms
                - Terms may be updated; sellers will be notified via dashboard.
                ',
            'privacy_policy'          => 
                '1. Data Collection
                - Platform collects personal and business info for order processing and compliance.

                2. Data Usage
                - Information used for communication, compliance, and service improvement.
                - Data not shared with third parties without consent or legal obligation.

                3. Data Security
                - Secure storage with encryption and access controls.
                - Sellers must keep passwords confidential.

                4. Consent
                - By accepting, sellers consent to collection, storage, and processing.
                - Withdrawal of consent may limit Platform access.
                ',
            'refund_return_policy'    => 
                '1. Eligibility
                - Products must meet condition and timeline requirements.
                - Requests must be submitted within 14 days.

                2. Return Process
                - Buyers submit requests through the Platform.
                - Sellers must acknowledge requests within 48 hours.

                3. Refund Process
                - Refunds issued within 7 business days after verification.
                - Refunds processed via original payment method.

                4. Seller Obligations
                - Provide accurate descriptions and images.
                - Follow Platform refund rules.
                ',
            'anti_counterfeit_policy' => 
                '1. Product Authenticity
                - All products must be authentic; certificates must be provided for branded items.

                2. Copyright Compliance
                - All images, descriptions, and logos must be original or licensed.

                3. Violations
                - Non-compliance may result in account suspension or termination.

                4. Certification Upload
                - Sellers must upload supporting documents for regulated products.
                ',
            'legal_document_handling' => 'allow_download_only'
        );

        $pending_store_status = array(
            'pending_msg' => 'Your store is awaiting approval and will be activated soon.',
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['pending'], $pending_store_status );

        $reject_store_status = array(
            'rejected_msg' => 'Your application was not approved. Please review feedback and reapply.',
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['rejected'], $reject_store_status );

        $under_review_store_status = array(
            'under_review_msg' => 'Your store is under review. Sales and payouts are temporarily paused.',
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['under-review'], $under_review_store_status );

        $suspended_store_status = array(
            'suspended_msg' => 'Your store is suspended due to a policy issue. Contact admin to resolve it.',
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['suspended'], $suspended_store_status );

        $store_permissions = array(
			'products' =>
				array(
					'read_products',
					'add_products',
					'edit_published_products',
					'edit_approved_products',
					'publish_products',
					'upload_files',
				),
			'orders'   =>
				array(
					'view_shop_orders',
					'edit_shop_orders',
					'delete_shop_orders',
					'add_shop_orders_note',
				),
			'coupons'   =>
				array(
					'add_shop_coupons',
					'edit_shop_coupons',
					'read_shop_coupons',
					'publish_coupons',
				),
			'analytics'   =>
				array(
					'read_shop_report',
				),
			'inventory'   =>
				array(
					'read_inventory',
					'edit_inventory',
				),
			'commission'   =>
				array(
					'read_shop_earning',
					'edit_withdrawl_request',
					'view_commission_history',
					'view_transactions',
				),
			'store_support'   =>
				array(
					'view_support_tickets',
					'reply_support_tickets',
					'view_customer_questions',
					'reply_customer_questions',
					'view_store_followers',
					'view_store_reviews',
					'reply_store_reviews',
				),
			'resources'   =>
				array(
					'view_documentation',
					'access_tools',
				),
			'settings'   =>
				array(
					'manage_store_settings',
				),
            'edit_store_info_activation' => 
                array(
                    'store_description',
                    'store_images',
                    'store_address',
                    'store_contact',
                    'store_name',
                )
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['store-capability'], $store_permissions );

        $user_permissions = array(
            'store_owner' =>
                array(
                    'read_products',
					'add_products',
					'edit_published_products',
					'edit_approved_products',
					'publish_products',
					'upload_files',
                    'view_shop_orders',
					'edit_shop_orders',
					'delete_shop_orders',
					'add_shop_orders_note',
                    'add_shop_coupons',
					'edit_shop_coupons',
					'read_shop_coupons',
					'publish_coupons',
					'read_shop_report',
                    'read_inventory',
					'edit_inventory',
                    'read_shop_earning',
					'edit_withdrawl_request',
					'view_commission_history',
					'view_transactions',
                    'view_support_tickets',
					'reply_support_tickets',
					'view_customer_questions',
					'reply_customer_questions',
					'view_store_followers',
					'view_store_reviews',
					'reply_store_reviews',
                    'view_documentation',
					'access_tools',
					'manage_store_settings',
				),
		);

        update_option( Utill::MULTIVENDORX_SETTINGS['user-capability'], $user_permissions );

        $disbursment_settings = array(
            'disbursement_order_status' => array( 'completed' ),
            'payment_schedules'         => 'hourly',
            'disbursement_hourly'       => 1,
            'withdraw_type'             => 'manual',
		);

        update_option( Utill::MULTIVENDORX_SETTINGS['disbursement'], $disbursment_settings );

        $shipping_provider_settings = array(
            'shipping_providers_options' => array(
                array(
                    'key'   => 'australia_post',
                    'label' => 'Australia post',
                    'value' => 'australia_post',
                    'edit'  => true,
                ),
                array(
                    'key'   => 'canada_post',
                    'label' => 'Canada post',
                    'value' => 'canada_post',
                    'edit'  => true,
                ),

                array(
                    'key'   => 'city_link',
                    'label' => 'City link',
                    'value' => 'city_link',
                    'edit'  => true,
                ),

                array(
                    'key'   => 'dhl',
                    'label' => 'DHL',
                    'value' => 'dhl',
                    'edit'  => true,
                ),

                array(
                    'key'   => 'fastway_south_africa',
                    'label' => 'Fastway South Africa',
                    'value' => 'fastway_south_africa',
                    'edit'  => true,
                ),

                array(
                    'key'   => 'fedex',
                    'label' => 'FedEx',
                    'value' => 'fedex',
                    'edit'  => true,
                ),

                array(
                    'key'   => 'ontrac',
                    'label' => 'OnTrac',
                    'value' => 'ontrac',
                    'edit'  => true,
                ),

                array(
                    'key'   => 'polish_shipping',
                    'label' => 'Polish shipping providers',
                    'value' => 'polish_shipping',
                    'edit'  => true,
                ),
            ),
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['shipping'], $shipping_provider_settings );

        $payment_settings = array(
            'payment_methods' => array(
                'bank-transfer' => array(
                    'enable'       => true,
                    'bank_details' => array( 'bank_name', 'account_number' ),
                ),
            ),
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['payment-integration'], $payment_settings );

        $dashboard_page = get_posts(
            array(
				'post_type'   => 'page',
				'post_status' => 'publish',
				'fields'      => 'ids',
				'numberposts' => 1,
				's'           => '[multivendorx_store_dashboard]',
            )
        );

        $store_dashboard_page_id = $dashboard_page ? reset( $dashboard_page ) : false;

        $page = get_posts(
            array(
				'post_type'   => 'page',
				'post_status' => 'publish',
				'fields'      => 'ids',
				'numberposts' => 1,
				's'           => '[multivendorx_store_registration]',
            )
        );

        $store_registration_page_id = $page ? reset( $page ) : false;

        $marketplace_settings = array(
            'store_registration_page' => $store_registration_page_id,
            'store_dashboard_page'    => $store_dashboard_page_id,
            'store_url'               => 'store',
            'display_customer_order'  => 'mainorder'
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['marketplace'], $marketplace_settings );

        $general_settings = array(
            'approve_store' => 'manually',
            'disable_setup_wizard' => 'enable_guided_setup',
            'onboarding_steps_configuration' => [
                'store_profile_setup',
                'payment_information',
                'shipping_configuration',
                'first_product_upload',
                'store_policies'
            ],
            'setup_wizard_introduction' => 
                    "Welcome!

                    Let's get your store ready.
                    Please follow the Setup Wizard to quickly complete the basic store settings and start selling.

                    It only takes a few minutes, and you can update everything later anything.

                    Start setup!",
            'store_selling_mode' => 'default',
            'spmv_show_order' => 'min_price',
            'more_offers_display_position' => 'after',
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['general'], $general_settings );

        $appearance_settings = array(
            'store_color_settings'  => array(
                'selectedPalette' => 'golden_ray',
                'colors'          => array(
                    'colorPrimary'   => '#0E117A',
                    'colorSecondary' => '#399169',
                    'colorAccent'    => '#12E2A4',
                    'colorSupport'   => '#DCF516',
                ),
            ),
            'store_banner_template' => array(
                'selectedPalette' => 'template3',
                'colors'          => array(),
            ),
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['store-appearance'], $appearance_settings );

        $product_settings = array(
            'type_options'    => array( 'virtual', 'downloadable' ),
            'products_fields' => array( 'general', 'inventory', 'linked_product', 'attribute', 'advanced', 'policies', 'product_tag', 'GTIN' ),
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['product-preferencess'], $product_settings );

        $map_settings = array(
            'radius_search_unit'    => 'both',
            'radius_search_distance' => array(
                array(
                    'radius_search_min_distance' => 1,
                    'radius_search_max_distance' => 500,
                    'radius_search_unit'         => 'kilometers',
                ),
            ),
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['geolocation'], $map_settings );

        $inventory_settings = array(
            'low_stock_notifications' => array(
                array(
                    'low_stock_alert' => array( 'low_stock_alert' ),
                    'low_stock_alert_threshold' => 5,
                ),
            ),

            'out_of_stock_notifications' => array(
                array(
                    'out_of_stock_alert' => array( 'out_of_stock_alert' ),
                    'out_of_stock_alert_threshold' => 1,
                ),
            ),
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['store-inventory'], $inventory_settings );

        $commission_settings = array(
            'give_tax'    => 'no_tax',
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['store-commissions'], $commission_settings );

        $coupon_settings = array(
            'commission_include_coupon' => 'seperate',
            'admin_coupon_excluded'     => array('admin_coupon_excluded'),
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['coupon'], $coupon_settings );

        $refund_settings = array(
            'customer_refund_status' => array('completed'),
            'refund_days'     => 7,
            'refund_reasons' => array(
                'damaged-or-defective-product' => array(
                    'label'    => 'Damaged or defective product',
					'isCustom' => true,
                ),
                'wrong-item'                   => array(
                    'label'    => 'Wrong item delivered',
					'isCustom' => true,
                ),
                'product-not-as-described'     => array(
                    'label'    => 'Product not as described',
					'isCustom' => true,
                ),
                'late-delivery'                => array(
                    'label'    => 'Late delivery',
					'isCustom' => true,
                ),
                'changed-mind'                 => array(
                    'label'    => 'Changed mind',
					'isCustom' => true,
                ),
            ),
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['order-actions-refunds'], $refund_settings );

        $privacy_settings = array(
            'store_branding_details' => array('show_store_name', 'show_store_description', 'show_store_logo_next_to_products', 'show_store_ratings'),
            'store_contact_details' => array('show_store_owner_info', 'show_store_phone', 'show_store_email'),
            'store_order_display' =>  array('group_items_by_store_in_cart'),
            'store_policy_override' =>  array('store', 'shipping', 'refund', 'cancellation_return'),
            'customer_information_access' =>  array('name', 'email_address', 'phone_number', 'shipping_address', 'order_notes'),
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['privacy'], $privacy_settings );

        $registration_form = array(
            array(
                'id'    => 1,
                'type'  => 'title',
                'label' => 'Registration Form',
            ),
            array(
                'id'          => 2,
                'type'        => 'text',
                'label'       => 'Enter your store name',
                'required'    => false,
                'name'        => 'name',
                'placeholder' => 'text',
                'readonly'    => true,
            ),
        );

        $registration_from_settings = array(
            'store_registration_from' => array(
                'formfieldlist'  => $registration_form,
                'butttonsetting' => array(),
            ),
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['store-registration-form'], $registration_from_settings );

        $delivery_settings = array(
            'shipping_stage' => array(
                'delivered' => array(
                    'label'    => 'Delivered',
                    'desc'     => 'Order is received by store',
					'icon'     => 'adminfont-delivery',
					'required' => true,
					'isCustom' => true,
                ),
                'cancelled' => array(
                    'label'    => 'Cancelled',
                    'desc'     => 'Order is cancelled',
					'icon'     => 'adminfont-rejecte',
					'required' => true,
					'isCustom' => true,
                ),
            ),
        );

        $review_settings = array(
            'ratings_parameters' => array(
                'quality-of-product' => array(
                    'label'    => 'Quality of product',
					'required' => true,
					'isCustom' => true,
                ),
                'communication-support' => array(
                    'label'    => 'Communication Support',
					'required' => true,
					'isCustom' => true,
                ),
                'delivery-experience' => array(
                    'label'    => 'Delivery experience',
					'required' => true,
					'isCustom' => true,
                ),
            ),
        );
        $product_compliance_settings['abuse_report_reasons'] = array(
            'product-not-received' => array(
                'label'    => 'Product not received',
                'isCustom' => true,
            ),
            'product-not-described' => array(
                'label'    =>'Product not as described',
                'isCustom' => true,
            ),
            'product-damaged-defective' => array(
                'label'    => 'Product damaged / defective',
                'isCustom' => true,
            ),
            'wrong-item-received' => array(
                'label'    =>'Wrong item received',
                'isCustom' => true,
            ),
            'order-arrived-late' => array(
                'label'    => 'Order arrived late',
                'isCustom' => true,
            ),
        );
        $product_compliance_settings['who_can_report'] ='logged_in';
        $product_compliance_settings['prohibited_product_categories'] = array(
            'weapons-&-ammunition' => array(
                'label'    => 'Weapons & ammunition',
                'isCustom' => true,
            ),
            'drugs-&-substances' => array(
                'label'    =>'Illegal drugs & substances',
                'isCustom' => true,
            ),
            'counterfeit-products' => array(
                'label'    => 'Counterfeit products',
                'isCustom' => true,
            ),
        );

        $compliance_settings = array(
            'store_compliance_management' => array(
                'seller-verification' => array(
                    'enable'                              => true,
                    'enable_advertisement_in_subscription'=> true,
                    'display_advertised_product_on_top'   => true,
                    'out_of_stock_visibility'             => true,
                    'required_tasks' => array(
                        'block_dashboard_access',
                        'hide_store_from_view',
                        'disable_product',
                    ),
                ),
            ),
        );

        // 6. Save back to DB
        update_option( Utill::MULTIVENDORX_SETTINGS['identity-verification'], $settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['delivery'], $delivery_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['legal-compliance'], $legal_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['product-compliance'], $product_compliance_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['review-management'], $review_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['non-compliance'], $compliance_settings );
    }

    /**
     * Create necessary pages for the plugin.
     */
    public function plugin_create_pages() {

        $pages_to_create = array(
            array(
                'slug'      => 'dashboard',
                'title'     => 'Store Dashboard',
                'shortcode' => '[multivendorx_store_dashboard]',
            ),
            array(
                'slug'      => 'store-registration',
                'title'     => 'Store Registration',
                'shortcode' => '[multivendorx_store_registration]',
            ),
        );

        $this->plugin_create_pages_dynamic( $pages_to_create );
    }

    /**
     * Create pages dynamically based on provided data.
     *
     * @param array $pages Array of page data to create.
     */
    public function plugin_create_pages_dynamic( $pages = array() ) {
        if ( empty( $pages ) || ! is_array( $pages ) ) {
            return;
        }

        foreach ( $pages as $page ) {
            // Validate required keys.
            if ( empty( $page['slug'] ) || empty( $page['title'] ) || empty( $page['shortcode'] ) ) {
                continue;
            }

            $slug      = $page['slug'];
            $title     = $page['title'];
            $shortcode = $page['shortcode'];

            // Check if page with slug exists.
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
                continue;
            }

            // Create the page.
            $page_data = array(
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'post_author'    => 1,
                'post_name'      => $slug,
                'post_title'     => $title,
                'post_content'   => $shortcode,
                'comment_status' => 'closed',
            );

            wp_insert_post( $page_data );
        }
    }

    public function old_new_map_module_id() {
        $map_modules = [
            'spmv'  =>  'shared-listing',
            'store-support'  =>  'customer-support',
            'report-abuse'  =>  'marketplace-compliance',
            'identity-verification'  =>  'marketplace-compliance',
            'store-location'  =>  'geo-location',
        ];
        return $map_modules;
    }

    /**
     * Migrate old modules 
     * @return void
     */
    public function migrate_old_modules() {
        $previous_active_modules = get_option('mvx_all_active_module_list', []);

        $shipping_settings['shipping_modules'] = [];

        if (in_array('zone-shipping', $previous_active_modules, true)) {
            $shipping_settings['shipping_modules']['zone-wise-shipping'] = [
                'enable' => true
            ];
        }

        if (in_array('country-shipping', $previous_active_modules, true)) {
            $shipping_settings['shipping_modules']['country-wise-shipping'] = [
                'enable' => true
            ];
        }

        if (in_array('distance-shipping', $previous_active_modules, true)) {
            $shipping_settings['shipping_modules']['distance-wise-shipping'] = [
                'enable' => true
            ];
        }

        $payment_settings['payment_methods'] = [];

        if (in_array('stripe-connect', $previous_active_modules, true)) {
            $payment_settings['payment_methods']['stripe-connect'] = [
                'enable' => true,
            ];
        }

        if (in_array('bank-payment', $previous_active_modules, true)) {
            $payment_settings['payment_methods']['bank-transfer'] = [
                'enable' => true,
            ];
        }

        if (in_array('paypal-payout', $previous_active_modules, true)) {
            $payment_settings['payment_methods']['paypal-payout'] = [
                'enable' => true,
            ];
        }

        if (in_array('stripe-marketplace', $previous_active_modules, true)) {
            $payment_settings['payment_methods']['stripe-marketplace'] = [
                'enable' => true,
            ];
        }
        if (in_array('paypal-marketplace', $previous_active_modules, true)) {
            $payment_settings['payment_methods']['paypal-marketplace'] = [
                'enable' => true,
            ];
        }

        update_option(Utill::MULTIVENDORX_SETTINGS['payment-integration'], $payment_settings);
        update_option(Utill::MULTIVENDORX_SETTINGS['shipping'], $shipping_settings);

         $old_shipping_modules = [
            'zone-shipping',
            'country-shipping',
            'distance-shipping',
        ];

        if ( ! empty( array_intersect( $old_shipping_modules, $previous_active_modules ) ) ) {
            $previous_active_modules[] = 'store-shipping';
        }

        $modules_to_remove = [
            'zone-shipping',
            'country-shipping',
            'distance-shipping',
            'stripe-connect',
            'bank-payment',
            'paypal-masspay',
            'paypal-payout',
            'toolset-types',
            'mvx-blocks',
        ];

        $previous_active_modules = array_diff( $previous_active_modules, $modules_to_remove );

        $module_map = $this->old_new_map_module_id();

        foreach ( $previous_active_modules as &$module ) {
            if ( isset( $module_map[ $module ] ) ) {
                $module = $module_map[ $module ];
            }
        }
        unset( $module ); 

        $active_modules = get_option( Utill::ACTIVE_MODULES_DB_KEY, [] );
        update_option( Utill::ACTIVE_MODULES_DB_KEY, array_unique( array_merge( $active_modules, $previous_active_modules ) ) );
    }

    /**
     * Migrate old Multivendorx settings 
     * @return void
     */
    public function migrate_old_settings() {
        $previous_capability_settings = get_option( 'mvx_products_capability_tab_settings', [] );

        $store_permissions['products'] = [];
        $store_permissions['coupons']  = [];

        if (!empty($previous_capability_settings['is_submit_product'])) {
            $store_permissions['products'] = array_merge(
                $store_permissions['products'],
                ['read_products', 'add_products']
            );
        }

        if (!empty($previous_capability_settings['is_published_product'])) {
            $store_permissions['products'][] = 'publish_products';
        }

        if (!empty($previous_capability_settings['is_edit_delete_published_product'])) {
            $store_permissions['products'][] = 'edit_published_products';
        }

        if (!empty($previous_capability_settings['publish_and_submit_products'])) {
            $store_permissions['products'][] = 'edit_approved_products';
        }

        if (!empty($previous_capability_settings['is_upload_files'])) {
            $store_permissions['products'][] = 'upload_files';
        }

        if (!empty($previous_capability_settings['is_submit_coupon'])) {
            $store_permissions['coupons'] = array_merge(
                $store_permissions['coupons'],
                ['add_shop_coupons', 'read_shop_coupons']
            );
        }

        if (!empty($previous_capability_settings['is_published_coupon'])) {
            $store_permissions['coupons'][] = 'publish_coupons';
        }

        if (!empty($previous_capability_settings['is_edit_delete_published_coupon'])) {
            $store_permissions['coupons'][] = 'edit_shop_coupons';
        }

        $previous_product_settings = get_option( 'mvx_products_tab_settings', [] );
        if (!empty($previous_product_settings['type_options'])) {
            $product_settings['type_options'] = $previous_product_settings['type_options'];
        }

        if (!empty($previous_product_settings['products_fields'])) {
            $product_settings['products_fields'] = $previous_product_settings['products_fields'];
        }

        $previous_general_settings = get_option( 'mvx_settings_general_tab_settings', [] );
        $general_settings = array(
            'approve_store' => !empty($previous_general_settings['approve_vendor']) ? $previous_general_settings['approve_vendor'] : 'manually',
        );

        if (!empty($general_settings['display_product_seller'])) {
            $privacy_settings['store_branding_details'] = array('show_store_name', 'show_store_description', 'show_store_logo_next_to_products');
            $privacy_settings['store_order_display'] = array('group_items_by_store_in_cart');
        }

        $previous_store_settings = get_option( 'mvx_store_tab_settings', [] );

        if (!empty($previous_store_settings['mvx_hide_vendor_details'])) {
            $privacy_settings['store_branding_details'] = array();
            $privacy_settings['store_contact_details'] = array();
        }

        if (!empty($previous_general_settings['registration_page'])) {
            $marketplace_settings['store_registration_page'] = $previous_general_settings['registration_page']['value'];
             $post = get_post( $previous_general_settings['registration_page']['value'] );

            $old_shortcode = '[vendor_registration]';
            $new_shortcode = '[marketplace_registration]';

            $updated_content = str_replace( $old_shortcode, $new_shortcode, $post->post_content );

            wp_update_post(
                [
                    'ID'           => $previous_general_settings['registration_page']['value'],
                    'post_content' => $updated_content,
                ]
            );

            delete_option( 'mvx_product_vendor_registration_page_id' );
        }

        if (!empty($previous_general_settings['vendor_dashboard_page'])) {
            $marketplace_settings['store_dashboard_page'] = $previous_general_settings['vendor_dashboard_page']['value'];
            $post = get_post( $previous_general_settings['vendor_dashboard_page']['value'] );

            $old_shortcode = '[mvx_vendor]';
            $new_shortcode = '[marketplace_dashboard]';

            $updated_content = str_replace( $old_shortcode, $new_shortcode, $post->post_content );

            wp_update_post(
                [
                    'ID'           => $previous_general_settings['vendor_dashboard_page']['value'],
                    'post_content' => $updated_content,
                ]
            );

            delete_option( 'mvx_product_vendor_vendor_page_id' );
        }

        $permalinks = get_option('dc_vendors_permalinks', []);
        if (!empty($permalinks['vendor_shop_base'])) {
            $marketplace_settings['store_url'] = $permalinks['vendor_shop_base'];
        }

        if (!empty($previous_general_settings['mvx_tinymce_api_section'])) {
            $marketplace_settings['tinymce_api_section'] = $previous_general_settings['mvx_tinymce_api_section'];
        }

        $previous_dashboard_settings = get_option( 'mvx_seller_dashbaord_tab_settings', [] );

        if (!empty($previous_dashboard_settings['setup_wizard_introduction'])) {
            $general_settings['setup_wizard_introduction'] = $previous_dashboard_settings['setup_wizard_introduction'];
        }

        if (!empty($previous_dashboard_settings['mvx_vendor_dashboard_custom_css'])) {
            $tool_settings['custom_css_product_page'] = $previous_dashboard_settings['mvx_vendor_dashboard_custom_css'];
        }

        if (!empty($previous_dashboard_settings['mvx_new_dashboard_site_logo'])) {
            $appearance_settings['store_dashboard_site_logo'] = $previous_dashboard_settings['mvx_new_dashboard_site_logo'];
        }

        if (!empty($previous_dashboard_settings['vendor_color_scheme_picker'])) {
            if ($previous_dashboard_settings['vendor_color_scheme_picker'] == 'outer_space_blue') {
                $appearance_settings['store_color_settings']['selectedPalette']= 'obsidian_night';
                $appearance_settings['store_color_settings']['colors']= array (
                        'colorPrimary' => '#00EED0',
                        'colorSecondary' => '#0197AF',
                        'colorAccent'   => '#4B227A',
                        'colorSupport' => '#02153D',
                    );
            }

            if ($previous_dashboard_settings['vendor_color_scheme_picker'] == 'green_lagoon') {
                $appearance_settings['store_color_settings']['selectedPalette']= 'golden_ray';
                $appearance_settings['store_color_settings']['colors']= array (
                        'colorPrimary' => '#0E117A',
                        'colorSecondary' => '#399169',
                        'colorAccent' => '#12E2A4',
                        'colorSupport' => '#DCF516',
                    );
            }

            if ($previous_dashboard_settings['vendor_color_scheme_picker'] == 'old_west') {
                $appearance_settings['store_color_settings']['selectedPalette']= 'emerald_edge';
                $appearance_settings['store_color_settings']['colors']= array (
                        'colorPrimary' => '#E6B924',
                        'colorSecondary' => '#D888C1',
                        'colorAccent' => '#6B7923',
                        'colorSupport' => '#6E97D0',
                    );
            }

            if ($previous_dashboard_settings['vendor_color_scheme_picker'] == 'wild_watermelon') {
                $appearance_settings['store_color_settings']['selectedPalette']= 'orchid_bloom';
                $appearance_settings['store_color_settings']['colors']= array (
                        'colorPrimary' => '#FF5959',
                        'colorSecondary' => '#FADD3A',
                        'colorAccent' => '#49BEB6',
                        'colorSupport' => '#075F63',
                    );
            }
        }

        if (!empty($previous_store_settings['mvx_vendor_shop_template'])) {
            $appearance_settings['store_banner_template'] = $previous_store_settings['mvx_vendor_shop_template'];
        }

        if (!empty($previous_store_settings['mvx_store_sidebar_position'])) {
            $appearance_settings['store_sidebar'] = $previous_store_settings['mvx_store_sidebar_position'];
        }

        if (!empty($previous_store_settings['choose_map_api'])) {
            $map_settings['choose_map_api'] = $previous_store_settings['choose_map_api']['value'];
            $map_settings['google_api_key'] = $previous_store_settings['google_api_key'];
            $map_settings['mapbox_api_key'] = $previous_store_settings['mapbox_api_key'];
        }

        if (!empty($previous_store_settings['show_related_products'])) {
            if ($previous_store_settings['show_related_products']['value'] == 'vendors_related') {
                $product_settings['recommendation_source'] = 'same_store';
            }
            if ($previous_store_settings['show_related_products']['value'] == 'all_related') {
                $product_settings['recommendation_source'] = 'all_stores';
            }
            if ($previous_store_settings['show_related_products']['value'] == 'disable') {
                $product_settings['recommendation_source'] = 'none';
            }
        }

        $previous_spmv_settings = get_option( 'mvx_spmv_pages_tab_settings', [] );
        if (!empty($previous_spmv_settings['is_singleproductmultiseller'])) {
            $general_settings['store_selling_mode'] = 'single_product_multiple_vendor';
        }
        
        if (!empty($previous_spmv_settings['singleproductmultiseller_show_order'])) {
            if ($previous_spmv_settings['singleproductmultiseller_show_order'] == 'min-price') {
                $general_settings['spmv_show_order'] = 'min_price';
            }
            if ($previous_spmv_settings['singleproductmultiseller_show_order'] == 'max-price') {
                $general_settings['spmv_show_order'] = 'max_price';
            }
            if ($previous_spmv_settings['singleproductmultiseller_show_order'] == 'top-rated-vendor') {
                $general_settings['spmv_show_order'] = 'top_rated_store';
            }
        }

        $previous_disbursement_settings = get_option( 'mvx_disbursement_tab_settings', [] );
        if (!empty($previous_disbursement_settings['commission_calculation_on_tax'])) {
            $commission_settings['give_tax'] = 'commision_based_tax'; 
        }

        if (!empty($previous_disbursement_settings['give_tax'])) {
            $commission_settings['give_tax'] = 'full_tax'; 
        } else {
            $commission_settings['give_tax'] = 'no_tax'; 
        }

        $previous_order_settings = get_option( 'mvx_order_tab_settings', [] );
        if (!empty($previous_order_settings['disallow_vendor_order_status'])) {
            $store_permissions['orders'] = array('edit_shop_orders');
        }
        if (!empty($previous_order_settings['display_suborder_in_mail'])) {
            $marketplace_settings['display_customer_order'] = 'suborder';
        }

        $previous_commission_settings = get_option( 'mvx_commissions_tab_settings', [] );
        if (!empty($previous_commission_settings['revenue_sharing_mode']) && $previous_commission_settings['revenue_sharing_mode'] == 'revenue_sharing_mode_vendor') {
            update_option( Utill::MULTIVENDORX_OTHER_SETTINGS['revenue_mode_store'], true);
        }

        if (!empty($previous_commission_settings['commission_type'])) {
            if ($previous_commission_settings['commission_type']['value'] == 'fixed') {
                $commission_settings['commission_type'] = 'per_item';
                $commission_settings['commission_per_item'] =  array(
                        array(
                            'commission_fixed' => array_column($previous_commission_settings['default_commission'], 'value', 'key')['fixed_ammount'] ?? '',
                            'commission_percentage' => '',
                        ),
                    );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'percent') {
                $commission_settings['commission_type'] = 'per_item';
                $commission_settings['commission_per_item'] =  array(
                        array(
                            'commission_fixed' => '',
                            'commission_percentage' => array_column($previous_commission_settings['default_commission'], 'value', 'key')['percent_ammount'] ?? '',
                        ),
                    );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'fixed_with_percentage_qty') {
                $commission_settings['commission_type'] = 'per_item';
                $commission_settings['commission_per_item'] =  array(
                        array(
                            'commission_fixed' => array_column($previous_commission_settings['default_commission'], 'value', 'key')['fixed_ammount'] ?? '',
                            'commission_percentage' => array_column($previous_commission_settings['default_commission'], 'value', 'key')['percent_ammount'] ?? '',
                        ),
                    );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'fixed_with_percentage') {
                $commission_settings['commission_type'] = 'store_order';
                $commission_settings['commission_per_store_order'] =  array(
                        array(
                            'commission_fixed' => array_column($previous_commission_settings['default_commission'], 'value', 'key')['fixed_ammount'] ?? '',
                            'commission_percentage' => array_column($previous_commission_settings['default_commission'], 'value', 'key')['percent_ammount'] ?? '',
                        ),
                    );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'commission_by_product_price') {
                $commission_settings['commission_type'] = 'store_order';
                if (!empty($previous_commission_settings['vendor_commission_by_products'])) {
                    foreach ($previous_commission_settings['vendor_commission_by_products'] as $product_rule) {
                        $new_rule = array();

                        $new_rule['rule_type']    = 'price';
                        $new_rule['product_price'] = $product_rule['cost'] ?? '';

                        $rule_map = array(
                            'upto'    => 'less_than',
                            'greater' => 'more_than',
                        );

                        $new_rule['rule'] = $rule_map[ $product_rule['rule']['value'] ] ?? '';

                        // Commission percentage
                        $new_rule['commission_percentage'] = $product_rule['commission'] ?? '0';

                        // Commission fixed
                        $new_rule['commission_fixed'] = $product_rule['commission_fixed'] ?? '0';

                        $commission_settings['commission_per_store_order'][] = $new_rule;
                    }
                }
            }

            if ($previous_commission_settings['commission_type']['value'] == 'commission_by_purchase_quantity') {
                $commission_settings['commission_type'] = 'store_order';
                if (!empty($previous_commission_settings['vendor_commission_by_quantity'])) {
                    foreach ($previous_commission_settings['vendor_commission_by_quantity'] as $quantity_rule) {
                        $new_rule = array();

                        $new_rule['rule_type']    = 'quantity';
                        $new_rule['product_qty'] = $quantity_rule['quantity'] ?? '';

                        $rule_map = array(
                            'upto'    => 'less_than',
                            'greater' => 'more_than',
                        );

                        $new_rule['rule'] = $rule_map[ $quantity_rule['rule']['value'] ] ?? '';

                        // Commission percentage
                        $new_rule['commission_percentage'] = $quantity_rule['commission'] ?? '0';

                        // Commission fixed
                        $new_rule['commission_fixed'] = $quantity_rule['commission_fixed'] ?? '0';

                        $commission_settings['commission_per_store_order'][] = $new_rule;
                    }
                }
            }
        }

        if (!empty($previous_commission_settings['payment_gateway_charge'])) {
            update_option( Utill::MULTIVENDORX_OTHER_SETTINGS['payment_gateway_charge'], true);
        }

        $previous_distance_settings = get_option( 'woocommerce_mvx_product_shipping_by_distance_settings', [] );
        $previous_country_settings = get_option( 'woocommerce_mvx_product_shipping_by_country_settings', [] );
        $previous_vendor_settings = get_option( 'woocommerce_mvx_vendor_shipping_1_settings', [] );

        if (!empty($previous_disbursement_settings['give_shipping']) || (!empty($previous_distance_settings['enable']) && $previous_distance_settings['tax_status'] == 'taxable') || (!empty($previous_country_settings['enable']) && $previous_country_settings['tax_status'] == 'taxable') || $previous_vendor_settings['tax_status'] == 'taxable') {
            $commission_settings['taxable'] = array('taxable');
        }

        if (!empty($previous_disbursement_settings['commission_include_coupon'])) {
            $coupon_settings['commission_include_coupon'] = 'store';
        }

        if (!empty($previous_disbursement_settings['admin_coupon_excluded'])) {
            $coupon_settings['admin_coupon_excluded'] = $previous_disbursement_settings['admin_coupon_excluded'];
        }

        $statuses = [];

        foreach ($previous_disbursement_settings['order_withdrawl_status'] as $status) {
            if ($status['value'] === 'completed' || $status['value'] === 'processing') {
                $statuses[] = $status['value'];
            }
        }

        $disbursement_settings = array(
            'commission_lock_period'   => !empty($previous_disbursement_settings['commission_threshold_time']) ?? 0,
            'disbursement_order_status'   => !empty($previous_disbursement_settings['order_withdrawl_status']) ? $statuses : array( 'completed' ),
            'payout_threshold_amount'   => !empty($previous_disbursement_settings['commission_threshold']) ?? 0,
            'payment_schedules' => empty($previous_disbursement_settings['choose_payment_mode_automatic_disbursal']) ? 'mannual' : $previous_disbursement_settings['payment_schedule'],
            'withdrawals_fees'  => array(
                array(
                    'free_withdrawals'  => !empty($previous_disbursement_settings['no_of_orders']) ?? '',
                    'withdrawal_fixed'  => !empty($previous_disbursement_settings['commission_transfer']) ?? ''
                )
            )
        );

        $previous_refund_settings = get_option( 'mvx_refund_management_tab_settings', [] );
        $old_reasons = array_map('trim', explode('||', $previous_refund_settings['refund_order_msg'] ?? ''));
        if (!empty($old_reasons)) {
            foreach ($old_reasons as $reason) {
                $key = strtolower(str_replace(' ', '-', $reason));
    
                $refund_reasons[$key] = [
                    'label'    => $reason,
                    'isCustom' => 1,
                ];
            }
            $refund_settings['refund_reasons'] = $refund_reasons;
        }

        $refund_settings = array(
            'customer_refund_status'  => !empty($previous_refund_settings['customer_refund_status']) ? $previous_refund_settings['customer_refund_status'] : array('completed'),
            'refund_days'  => !empty($previous_refund_settings['refund_days']) ? $previous_refund_settings['refund_days'] : 7,
        );

        $previous_review_settings = get_option( 'mvx_review_management_tab_settings', [] );
        foreach ($previous_review_settings['mvx_review_categories'] as $item) {
            if (empty($item['category'])) {
                continue;
            }

            $label = trim($item['category']);

            $key = strtolower( preg_replace('/[^a-z0-9]+/', '-', $label) );

             if (!array_key_exists($key, $ratings_parameters)) {
                $ratings_parameters[$key] = [
                    'label'    => $label,
                    'isCustom' => 1,
                ];
            }
        }

        if (!empty($ratings_parameters)) {
            $review_settings['ratings_parameters'] = $ratings_parameters;
        }

        $review_settings = array(
            'is_storereview_varified'   => !empty($previous_review_settings['is_sellerreview_varified']) ? array('is_storereview_varified') : array(),
        );

        $previous_policy_settings = get_option( 'mvx_policy_tab_settings', [] );
        $policy_settings = array(
            'store_policy'  => !empty($previous_policy_settings['store-policy']) ? $previous_policy_settings['store-policy'] : '',
            'shipping_policy'  => !empty($previous_policy_settings['shipping_policy']) ? $previous_policy_settings['shipping_policy'] : '',
            'refund_policy'  => !empty($previous_policy_settings['refund_policy']) ? $previous_policy_settings['refund_policy'] : '',
            'cancellation_policy'  => !empty($previous_policy_settings['cancellation_policy']) ? $previous_policy_settings['cancellation_policy'] : '',
        );

        $previous_stripe_settings = get_option( 'mvx_payment_stripe_connect_tab_settings', [] );
        $payment_settings['payment_methods']['stripe-connect'] = [
            'payment_mode'  => !empty($previous_stripe_settings['testmode']) ? 'test' : '',
            'test_client_id' => !empty($previous_stripe_settings['test_client_id']) ?? '',
            'test_secret_key' => !empty($previous_stripe_settings['test_secret_key']) ?? '',
            'live_client_id' => !empty($previous_stripe_settings['live_client_id']) ?? '',
            'live_secret_key' => !empty($previous_stripe_settings['live_secret_key']) ?? '',
        ];

        $previous_paypal_settings = get_option( 'mvx_payment_payout_tab_settings', [] );
        $payment_settings['payment_methods']['paypal-payout'] = [
            'payment_mode'  => !empty($previous_paypal_settings['is_testmode']) ? 'sandbox' : '',
            'client_id' => !empty($previous_paypal_settings['client_id']) ?? '',
            'client_secret' => !empty($previous_paypal_settings['client_secret']) ?? '',
        ];

        $oldFields = get_option('mvx_new_vendor_registration_form_data', []);

        if (!empty($oldFields)) {
            $newForm = [
                'store_registration_from' => [
                    'formfieldlist' => [],
                    'butttonsetting' => array(),
                ]
            ];
    
            $idCounter = 1;
            $addressFields = [];
    
            foreach ($oldFields as $field) {
                // Skip parent title
                if ($field['type'] === 'p_title') {
                    $newForm['store_registration_from']['formfieldlist'][] = [
                        'id' => $idCounter++,
                        'type' => 'title',
                        'label' => '',
                        'chosen' => '',
                        'selected' => ''
                    ];
                    continue;
                }
    
                // Address fields collected separately
                if (str_starts_with($field['type'], 'vendor_') &&
                    in_array($field['type'], [
                        'vendor_address_1',
                        'vendor_address_2',
                        'vendor_city',
                        'vendor_state',
                        'vendor_country',
                        'vendor_postcode'
                    ])) {
    
                    $addressMap = [
                        'vendor_address_1' => 'address_1',
                        'vendor_address_2' => 'address_2',
                        'vendor_city'      => 'city',
                        'vendor_state'     => 'state',
                        'vendor_country'   => 'country',
                        'vendor_postcode'  => 'postcode',
                    ];
    
                    $addressFields[] = [
                        'id' => $idCounter++,
                        'key' => $addressMap[$field['type']],
                        'label' => $field['label'],
                        'type' => 'text',
                        'placeholder' => $field['label'],
                        'required' => $field['required'] ?? '',
                        'chosen' => '',
                        'selected' => ''
                    ];
                    continue;
                }
    
                // Type conversion
                $typeMap = [
                    'textbox' => 'text',
                    'multi-select' => 'multiselect',
                    'vendor_description' => 'textarea',
                    'vendor_page_title' => 'text',
                    'vendor_paypal_email' => 'email'
                ];
    
                $type = $typeMap[$field['type']] ?? $field['type'];
    
                $newField = [
                    'id' => $idCounter++,
                    'type' => $type,
                    'label' => $field['label'],
                    'required' => $field['required'] ?? '',
                    'name' => strtolower($field['type'] . '-mknk' . substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 4)),
                    'placeholder' => $field['placeholder'] ?? '',
                    'chosen' => '',
                    'selected' => ''
                ];
    
                // Options
                if (!empty($field['options'])) {
                    $newField['options'] = [];
                    $optId = 1;
    
                    foreach ($field['options'] as $option) {
                        $newField['options'][] = [
                            'id' => $optId++,
                            'label' => $option['label'],
                            'value' => $option['value'],
                            'chosen' => '',
                            'selected' => ''
                        ];
                    }
                }
    
                // Recaptcha
                if ($type === 'recaptcha') {
                    $newField['name'] = 'recaptcha-mknk' . substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 4);
                    $newField['placeholder'] = 'recaptcha';
                }
    
                // Attachment
                if ($type === 'attachment') {
                    $newField['name'] = 'attachment-mknk' . substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 4);
                    $newField['placeholder'] = 'attachment';
                }
    
                $newForm['store_registration_from']['formfieldlist'][] = $newField;
            }
    
            // Add address block if exists
            if (!empty($addressFields)) {
                $newForm['store_registration_from']['formfieldlist'][] = [
                    'id' => $idCounter++,
                    'type' => 'address',
                    'label' => 'Address',
                    'name' => 'address',
                    'fields' => $addressFields,
                    'value' => [],
                    'readonly' => '',
                    'chosen' => '',
                    'selected' => ''
                ];
            }
            update_option( Utill::MULTIVENDORX_SETTINGS['store-registration-form'], $newForm );
        }

        update_option( Utill::MULTIVENDORX_SETTINGS['order-actions-refunds'], $refund_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['store-capability'], $store_permissions );
        update_option( Utill::MULTIVENDORX_SETTINGS['product-preferencess'], $product_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['general'], $general_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['privacy'], $privacy_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['marketplace'], $marketplace_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['store-appearance'], $appearance_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['geolocation'], $map_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['store-commissions'], $commission_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['coupon'], $coupon_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['policy'], $policy_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['review-management'], $review_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['disbursement'], $disbursement_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['development-tools'], $tool_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['payment-integration'], $payment_settings );

    }

    public function migrate_product_category_settings() {
        $previous_commission_settings = get_option( 'mvx_commissions_tab_settings', [] );

        $products = wc_get_products( [
            'status' => 'any',
            'return' => 'ids',
        ] );

        foreach($products as $product_id) {
            
            if ($previous_commission_settings['commission_type']['value'] == 'fixed') {

                $previous_value = get_post_meta( $product_id, '_commission_per_product', true );
    
                if ( empty( $previous_value ) ) {
                    continue;
                }
    
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['fixed_commission'], $previous_value );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'percent') {

                $previous_value = get_post_meta( $product_id, '_commission_per_product', true );
    
                if ( empty( $previous_value ) ) {
                    continue;
                }
    
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['percentage_commission'], $previous_value );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'fixed_with_percentage_qty') {

                $previous_percentage_value = get_post_meta( $product_id, '_commission_percentage_per_product', true );
                $previous_fixed_value = get_post_meta( $product_id, '_commission_fixed_with_percentage_qty', true );
    
                if ( empty( $previous_fixed_value ) || empty($previous_percentage_value) ) {
                    continue;
                }
    
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['fixed_commission'], $previous_fixed_value );
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['percentage_commission'], $previous_percentage_value );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'fixed_with_percentage') {

                $previous_percentage_value = get_post_meta( $product_id, '_commission_percentage_per_product', true );
                $previous_fixed_value = get_post_meta( $product_id, '_commission_fixed_with_percentage', true );
    
                if ( empty( $previous_fixed_value ) || empty($previous_percentage_value) ) {
                    continue;
                }
    
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['fixed_commission'], $previous_fixed_value );
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['percentage_commission'], $previous_percentage_value );
            }

            // Migrate product vendor.
            $author_id = (int) get_post_field( 'post_author', $product_id );
            $user = get_user_by( 'id', $author_id );

            // Check if user is a vendor and update post meta.
            if ( in_array( 'dc_vendor', (array) $user->roles, true ) ) {
                $active_store = get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], $active_store );
            }
        }

        $terms = get_terms( [
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
            'fields'     => 'ids',
        ] );

        foreach($terms as $term_id) {
            if ($previous_commission_settings['commission_type']['value'] == 'fixed') {

                $previous_value = get_term_meta( $term_id, 'commission', true );
    
                if ( empty( $previous_value ) ) {
                    continue;
                }
    
                update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_fixed_commission'], $previous_value );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'percent') {

                $previous_value = get_term_meta( $term_id, 'commission', true );
    
                if ( empty( $previous_value ) ) {
                    continue;
                }
    
                update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_percentage_commission'], $previous_value );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'fixed_with_percentage_qty') {

                $previous_percentage_value = get_term_meta( $term_id, 'commission_percentage', true );
                $previous_fixed_value = get_term_meta( $term_id, 'fixed_with_percentage_qty', true );
    
                if ( empty( $previous_fixed_value ) || empty($previous_percentage_value) ) {
                    continue;
                }
    
                update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_fixed_commission'], $previous_fixed_value );
                update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_percentage_commission'], $previous_percentage_value );
            }

            if ($previous_commission_settings['commission_type']['value'] == 'fixed_with_percentage') {

                $previous_percentage_value = get_term_meta( $term_id, 'commission_percentage', true );
                $previous_fixed_value = get_term_meta( $term_id, 'fixed_with_percentage', true );
    
                if ( empty( $previous_fixed_value ) || empty($previous_percentage_value) ) {
                    continue;
                }
    
                update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_fixed_commission'], $previous_fixed_value );
                update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_percentage_commission'], $previous_percentage_value );
            }
        }

        //Migrate coupon vendor.
        $coupons = wc_get_coupons( array(
            'return' => 'ids',
        ) );

        foreach ( $coupons as $coupon_id ) {
            $author_id = (int) get_post_field( 'post_author', $coupon_id );
            $user = get_user_by( 'id', $author_id );

            if ( in_array( 'dc_vendor', (array) $user->roles, true ) ) {
                $active_store = get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
                update_post_meta( $coupon_id, Utill::POST_META_SETTINGS['store_id'], $active_store );
            }
        }

    }

    public function old_new_meta_map() {
        $map_meta = [
            'mvx_vendor_fields' => 'multivendorx_registration_data',
            '_vendor_address_1' => 'address',
            '_vendor_address_2' => 'address',
            '_vendor_city'      => 'city',
            '_vendor_postcode'  => 'zip',
            '_vendor_country_code'  => 'country',
            '_vendor_state_code'  => 'state',
            '_vendor_phone'  => 'phone',
            '_vendor_hide_address'  => 'hide_address',
            '_vendor_hide_phone'  => 'hide_phone',
            '_vendor_hide_email'  => 'hide_email',
            '_vendor_hide_description'  => 'hide_description',
            '_vendor_fb_profile'  => 'facebook',
            '_vendor_twitter_profile'  => 'twitter',
            '_vendor_linkdin_profile'  => 'linkedin',
            '_vendor_youtube'  => 'youtube',
            '_vendor_instagram'  => 'instagram',
            '_vendor_pinterest_profile'  => 'pinterest',
            'mvx_vendor_rejection_notes'  => 'store_reject_note',
            '_store_location'  => 'address',
            '_store_lat'  => 'location_lat',
            '_store_lng'  => 'location_lng',
            '_vendor_image'  => 'image',
            '_vendor_banner'  => 'banner',
            '_vendor_banner_type'  => 'banner_type',
            '_vendor_video'  => 'banner_video',
            '_vendor_slider'  => 'banner_slider',
            'shipping_class_id'  => 'shipping_class_id',
            'vendor_shipping_options'  => 'shipping_options',
            '_vendor_shipping_policy'   => 'shipping_policy',
            '_vendor_refund_policy'   => 'refund_policy',
            'mvx_vendor_followed_by_customer'   => '',
            '_vendor_cancellation_policy'   => 'cancellation_policy',
            '_vendor_payment_mode'   => 'payment_method',
            '_vendor_bank_account_type'   => 'account_type',
            '_vendor_bank_name'   => 'bank_name',
            '_vendor_bank_address'   => 'bank_address',
            '_vendor_account_holder_name'   => 'account_holder_name',
            '_vendor_bank_account_number'   => 'account_number',
            '_vendor_aba_routing_number'   => 'routing_number',
            '_vendor_destination_currency'   => 'destination_currency',
            '_vendor_iban'   => 'iban',
            '_vendor_paypal_email'  => 'paypal_email',
            '_vendor_country'  => '',
            '_vendor_state'  => '',
            '_vendor_profile_image'  => '',
            'vendor_connected'  => '',
            'admin_client_id'  => '',
            'stripe_user_id'  => 'stripe_account_id',
            'access_token'  => 'stripe_access_token',
            'stripe_publishable_key'  => 'stripe_publishable_key',
            'refresh_token'  => 'stripe_refresh_token',
            '_vendor_external_store_url'  => 'store_external_store_url',
            '_vendor_external_store_label'  => 'store_external_store_label',
            'refresh_token'  => 'stripe_refresh_token',
            '_vendor_term_id'  =>  '',
            '_vendor_page_title'  =>  '',
            '_vendor_page_slug'  =>  '',
            '_vendor_csd_return_address1'  =>  '',
            '_vendor_csd_return_address2'  =>  '',
            '_vendor_csd_return_country'  =>  '',
            '_vendor_csd_return_state'  =>  '',
            '_vendor_csd_return_city'  =>  '',
            '_vendor_csd_return_zip'  =>  '',
            '_vendor_customer_phone'  =>  '',
            '_vendor_customer_email'  =>  '',
            '_vendor_turn_off'  =>  '',
            '_dismiss_to_do_list'  =>  '',
        ];
        return $map_meta;
    }

    /**
     * Migrate old Multivendorx tables data 
     * @return void
     */
    public function migrate_tables() {
        global $wpdb;
        // Vendor migration.
        $vendors = get_users([
            'role__in' => ['dc_vendor', 'dc_pending_vendor', 'dc_rejected_vendor'],
            'fields'   => ['ID']
        ]);

        $map_meta = $this->old_new_meta_map();

        foreach ($vendors as $user) {
            $user_id = $user->ID;

            // Change role.
            $wp_user = new \WP_User($user_id);
            $wp_user->set_role('store_owner');

            // Get all user meta.
            $user_meta = get_user_meta($user_id);
            $term_id = get_user_meta($user_id, '_vendor_term_id', true);
            $term = get_term($term_id);

            if (in_array('dc_vendor', (array) $user->roles, true)) {
                $status = 'active';
            }

            if (in_array('dc_pending_vendor', (array) $user->roles, true)) {
                $status = 'pending';
            }

            if (in_array('dc_rejected_vendor', (array) $user->roles, true)) {
                $status = 'rejected';
            }

            if (get_user_meta($user_id, '_vendor_turn_off', true) == 'Enable') {
                $status = 'suspended';
            }

            // Store create.
            $store = new Store();
            $store->set( 'name', $term->name );
            $store->set( 'slug', $term->slug );
            $store->set( 'status', $status );
            $store->set( 'who_created', $user_id );
            $store->set( 'description', get_user_meta($user_id, '_vendor_description', true) ?? '' );
            $store_id = $store->save();

            // primary owner set and add store-users table.
            StoreUtil::set_primary_owner( $user_id, $store_id );
            update_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['active_store'], $store_id);
            StoreUtil::add_store_users(
                    array(
                        'store_id' => $store_id,
                        'users'    => (array) $user_id,
                        'role_id'  => 'store_owner',
                    )
                );

            // add meta in store-meta table.
            $store->update_meta( 'primary_email', $user->email );
            $store->update_meta( 'emails', [$user->email] );

            foreach ($user_meta as $meta_key => $meta_values) {
                // report abuse table data insert.
                if ($meta_key == 'report_abuse_data') {
                    $table = $wpdb->prefix . Utill::TABLES['report_abuse'];

                    foreach ($meta_values as $value) {
                        // Sanitize and prepare data.
                        $insert_data = array(
                            'store_id'   => $store_id,
                            'product_id' => $value['product_id'],
                            'name'       => $value['name'] ?? '',
                            'email'      => $value['email'] ?? '',
                            'message'    => $value['msg'] ?? '',
                        );
    
                        // Insert data.
                        $wpdb->insert(
                            $table,
                            $insert_data,
                            array( '%d', '%d', '%s', '%s', '%s' )
                        );
                    }
                    continue;
                }

                // follow-store store meta migration.
                if ($meta_key == 'mvx_vendor_followed_by_customer') {
                    $new_meta = [];

                    foreach ( $meta_values as $item ) {
                        $new_meta[] = [
                            'id'   => (int) $item['user_id'],
                            'date' => $item['timestamp'],
                        ];
                    }

                    $store->update_meta( 'followers', $new_meta );
                    continue;
                }

                // Skip meta keys that are not mapped.
                if (!isset($map_meta[$meta_key])) {
                    continue;
                }

                $new_meta_key = $map_meta[$meta_key];

                if ($new_meta_key === 'address') {
                    $existing = $store->get_meta('address');
                    $meta_values = trim($existing . ' ' . $meta_values);
                }

                $store->update_meta( $new_meta_key, $meta_values );
            }

        }

        // follow store customer side migration.
        $users = get_users([
            'meta_key'     => 'mvx_customer_follow_vendor',
            'meta_compare' => 'EXISTS',
            'fields'       => 'ID',
        ]);

        foreach ( $users as $user_id ) {
            $results = [];
            $followed = get_user_meta( $user_id, 'mvx_customer_follow_vendor', true );

            if ( is_array( $followed ) ) {
                foreach ( $followed as $item ) {
                    if ( ! empty( $item['user_id'] ) ) {
                        $store_id = get_user_meta( $item['user_id'], Utill::USER_SETTINGS_KEYS['active_store'], true );

                        if ( $store_id ) {
                            $results[] = (int) $store_id;
                        }
                    }
                }
            }

            update_user_meta( $user_id, 'multivendorx_following_stores', array_unique( $results ) );
            delete_user_meta( $user_id, 'mvx_customer_follow_vendor' );
        }

        // Announcement table migrate.
        $args = [
            'post_type'      => 'mvx_vendor_notice',
            'post_status'    => 'any',
            'fields'         => 'ids',
        ];

        $announcements = get_posts($args);

        foreach ($announcements as $post_id) {

            wp_update_post([
                'ID'        => $post_id,
                'post_type' => 'multivendorx_an',
            ]);

            $vendors = get_post_meta( $post_id, '_mvx_vendor_notices_vendors', true );

            $stores = [];

            foreach ($vendors as $vendor_id) {
                $active_store = get_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

                if (!empty($active_store)) {
                    $stores[] = (int) $active_store;
                }
            }

            
            update_post_meta( $post_id, 'multivendorx_announcement_stores', array_unique($stores) );

            delete_post_meta( $post_id, '_mvx_vendor_notices_vendors' );
        }

        // Knowledgebase table migrate.
        $args = [
            'post_type'      => 'mvx_university',
            'post_status'    => 'any',
            'fields'         => 'ids',
        ];

        $knowledgebase = get_posts($args);

        foreach ($knowledgebase as $post_id) {

            wp_update_post([
                'ID'        => $post_id,
                'post_type' => 'multivendorx_kb',
            ]);
        }

        // Commissions and orders meta and refund migration.
        $table_name = $wpdb->prefix . Utill::TABLES['commission'];

        $args = [
            'post_type'      => 'dc_commission',
            'fields'         => 'ids',
        ];

        $commission_ids = get_posts( $args );

        foreach ( $commission_ids as $commission_id ) {

            $commission_vendor   = get_post_meta( $commission_id, '_commission_vendor', true );
            $commission_order_id = get_post_meta( $commission_id, '_commission_order_id', true );
            $store_earning       = get_post_meta( $commission_id, '_commission_amount', true );
            $store_shipping      = get_post_meta( $commission_id, '_shipping', true );
            $store_tax           = get_post_meta( $commission_id, '_tax', true );
            $store_payable       = get_post_meta( $commission_id, '_commission_total', true );
            $status              = get_post_meta( $commission_id, '_paid_status', true );
            $refunded            = abs( (float) get_post_meta( $commission_id, '_commission_refunded', true ) );
            $created_at          = date('Y-m-d H:i:s', get_post_meta( $commission_id, '_paid_date', true ));

            $vendor_id = get_term_meta( $commission_vendor, '_vendor_user_id', true );
            $store_id = get_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

            $insert_id = $wpdb->insert(
                $table_name,
                [
                    'order_id'         => (int) $commission_order_id,
                    'store_id'         => (int) $store_id,
                    'store_earning'    => $store_earning,
                    'store_shipping'   => $store_shipping,
                    'store_tax'        => $store_tax,
                    'store_payable'    => $store_payable,
                    'store_refunded'   => $refunded,
                    'status'           => $status,
                    'created_at'       => $created_at,
                ],
                [
                    '%d',
                    '%d',
                    '%f',
                    '%f',
                    '%f',
                    '%f',
                    '%f',
                    '%s',
                    '%s',
                ]
            );

            $order = wc_get_order($commission_order_id);

            $meta_map = [
                '_commission_id'                => 'multivendorx_commission_id',
                '_commissions_processed'        => 'multivendorx_commissions_processed',
                '_vendor_id'                    => 'multivendorx_store_id',
                'order_items_commission_rates'  => 'multivendorx_order_items_commission_rates',
            ];

            foreach ( $meta_map as $old_key => $new_key ) {

                if ($old_key == '_commission_id') {
                    $value = $insert_id;
                } elseif ($old_key == '_vendor_id') {
                    $value = $store_id;
                } else {
                    $value = $order->get_meta($old_key);
                }

                $order->update_meta_data( $new_key, $value );
                $order->delete_meta_data( $old_key );
            }

            $order->save();
        }

        // Fetch all refund orders.
        $refund_ids = wc_get_orders( array(
            'type'   => 'shop_order_refund',
            'status' => array_keys( wc_get_order_statuses() ),
            'return' => 'ids',
        ) );

        foreach ( $refund_ids as $refund_id ) {
            $refund = wc_get_order($refund_id);
            $parent_order_id = $refund->get_parent_id();
            $parent_order = wc_get_order( $parent_order_id );

            $store_id = $parent_order->get_meta( 'multivendorx_store_id', true );
            $refund->update_meta_data( 'multivendorx_store_id', $store_id );
            $refund->save();
        }

        // Visitor stats table migrate.
        $old_visitors_table = $wpdb->prefix . 'mvx_visitors_stats';
        $new_visitors_table = $wpdb->prefix . Utill::TABLES['visitors_stats'];

        $rows = $wpdb->get_results( "SELECT * FROM {$old_visitors_table}" );

        $store_cache = [];

        foreach ( $rows as $row ) {

            $author_id = (int) $row->vendor_id;

            if ( ! isset( $store_cache[ $author_id ] ) ) {
                $store_cache[ $author_id ] = (int) get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
            }

            $store_id = $store_cache[ $author_id ] ?: 0;

            $wpdb->insert(
                $new_visitors_table,
                [
                    'store_id'     => $store_id,
                    'user_id'      => (int) $row->user_id,
                    'user_cookie'  => $row->user_cookie,
                    'session_id'   => $row->session_id,
                    'ip'           => $row->ip,
                    'lat'          => $row->lat,
                    'lon'          => $row->lon,
                    'city'         => $row->city,
                    'zip'          => $row->zip,
                    'regionCode'   => $row->regionCode,
                    'region'       => $row->region,
                    'countryCode'  => $row->countryCode,
                    'country'      => $row->country,
                    'isp'          => $row->isp,
                    'timezone'     => $row->timezone,
                    'created'      => $row->created,
                ]
            );
        }

        //Questions and answers table migration.
        $questions_table = $wpdb->prefix . 'mvx_cust_questions';
        $answers_table   = $wpdb->prefix . 'mvx_cust_answers';
        $new_qna_table       = $wpdb->prefix . Utill::TABLES['product_qna'];

        $questions = $wpdb->get_results( "SELECT * FROM {$questions_table}" );
        foreach ( $questions as $question ) {
            $answer = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM {$answers_table} WHERE ques_ID = %d ORDER BY ans_created ASC LIMIT 1",
                    $question->ques_ID
                )
            );

            $ques_votes = $question->ques_vote ? maybe_unserialize( $question->ques_vote ) : [];
            $ans_votes  = $answer ? maybe_unserialize( $answer->ans_vote ) : [];

            // Merge votes
            $merged_votes = array_merge( $ques_votes, $ans_votes );
            $total_votes = count( $merged_votes );

            $store_id = get_post_meta( $question->product_ID, Utill::POST_META_SETTINGS['store_id'], true );
            $wpdb->insert(
                $new_qna_table,
                [
                    'id'                  => (int) $question->ques_ID,
                    'product_id'          => (int) $question->product_ID,
                    'store_id'            => $store_id,
                    'question_text'       => $question->ques_details,
                    'question_by'         => (int) $question->ques_by,
                    'question_date'       => $question->ques_created,
                    'answer_text'         => $answer ? $answer->ans_details : null,
                    'answer_by'           => $answer ? (int) $answer->ans_by : null,
                    'answer_date'         => $answer ? $answer->ans_created : null,
                    'total_votes'         => $total_votes,
                    'voters'              => maybe_serialize( $merged_votes ),
                    'question_visibility' => 'public',
                    'created_at'          => $question->ques_created,
                    'updated_at'          => $answer ? $answer->ans_created : $question->ques_created,
                ],
                [
                    '%d','%d','%d','%s','%d','%s',
                    '%s','%d','%s','%d','%s','%s','%s'
                ]
            );
        }

        //SPMV table migration.
        $old_spmv_table = $wpdb->prefix . 'mvx_products_map';
        $new_spmv_table = $wpdb->prefix . Utill::TABLES['products_map'];

        $spmv_products = $wpdb->get_results(
            "SELECT product_map_id, product_id, created
            FROM {$old_spmv_table}
            ORDER BY product_map_id, ID"
        );

        $maps = [];
        foreach ( $spmv_products as $row ) {
            $map_id     = (int) $row->product_map_id;
            $product_id = (int) $row->product_id;

            if ( ! isset( $maps[ $map_id ] ) ) {
                $maps[ $map_id ] = [
                    'products' => [],
                    'created'  => $row->created,
                ];
            }

            $maps[ $map_id ]['products'][] = $product_id;
        }

        foreach ( $maps as $map_id => $data ) {
            $wpdb->insert(
                $new_spmv_table,
                [
                    'ID'          => $map_id,
                    'product_map' => wp_json_encode( array_values( $data['products'] ) ),
                    'created'     => $data['created'],
                ],
                [
                    '%d',
                    '%s',
                    '%s',
                ]
            );

            foreach ( $data['products'] as $product_id ) {
                update_post_meta( $product_id, 'multivendorx_spmv_id', $map_id );
                delete_post_meta( $product_id, '_mvx_spmv_map_id' );
                delete_post_meta( $product_id, '_mvx_spmv_product' );
            }
        }

        //Vendor ledger(Transactions) table migrate.
        $old_ledger_table = $wpdb->prefix . 'mvx_vendor_ledger';
        $new_ledger_table = $wpdb->prefix . Utill::TABLES['transaction'];

        $transactions = $wpdb->get_results( "SELECT * FROM {$old_ledger_table}", ARRAY_A );

        $store_cache = [];

        foreach ( $transactions as $row ) {
            $author_id = (int) $row['vendor_id'];

            if ( ! isset( $store_cache[ $author_id ] ) ) {
                $store_cache[ $author_id ] = (int) get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
            }

            $store_id = $store_cache[ $author_id ] ?: 0;

            $is_credit = ! empty( $row['credit'] );
            $entry_type = $is_credit ? 'Cr' : 'Dr';
            $amount     = $is_credit ? (float) $row['credit'] : (float) $row['debit'];

            $wpdb->insert(
                $new_ledger_table,
                [
                    'store_id'         => $store_id,
                    'order_id'         => (int) $row['order_id'],
                    'commission_id'    => $row['ref_id'],
                    'entry_type'       => $entry_type,
                    'transaction_type' => $row['ref_type'],
                    'amount'           => $amount,
                    'balance'          => (float) $row['balance'],
                    'locking_balance'  => 0,
                    'currency'         => get_woocommerce_currency(),
                    'narration'        => $row['ref_info'],
                    'status'           => $row['ref_status'],
                    'created_at'       => $row['created'],
                    'updated_at'       => $row['created'],
                ],
                [
                    '%d', '%d', '%s', '%s', '%s', '%f', '%f','%f', '%s', '%s', '%s', '%s', '%s',
                ]
            );
        }

    }

}
