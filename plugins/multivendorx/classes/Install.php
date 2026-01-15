<?php
/**
 * Install class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Utill;
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

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }
    }

    /**
     * Set default settings for the plugin or module.
     *
     * @return void
     */
    private function set_default_settings() {
        // 1. Get the existing option from DB
        $settings = get_option( 'multivendorx_identity_verification_settings', array() );

        // 2. Modify only what you need
        $settings['all_verification_methods']['ID']['verification_methods'] = array(

            array(
                'label'    => 'National Id',
                'required' => true,
                'active'   => true,
            ),
            array(
                'label'    => 'Voter Id',
                'required' => true,
                'active'   => false,
            ),
        );

        $legal_settings              = array(
            'seller_agreement'        => 'This Seller Agreement (“Agreement”) is entered into between Marketplace (“Platform”) and the Seller (“You” or “Seller”) upon registration on the Platform. By submitting this agreement and uploading the required documents, you agree to comply with all rules, policies, and guidelines of the Platform.

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
            'terms_conditions'        => '1. General
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
            'privacy_policy'          => '1. Data Collection
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
            'refund_return_policy'    => '1. Eligibility
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
            'anti_counterfeit_policy' => '1. Product Authenticity
   - All products must be authentic; certificates must be provided for branded items.

2. Copyright Compliance
   - All images, descriptions, and logos must be original or licensed.

3. Violations
   - Non-compliance may result in account suspension or termination.

4. Certification Upload
   - Sellers must upload supporting documents for regulated products.
',
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
					'manage_products',
					'read_products',
					'edit_products',
					'delete_products',
					'publish_products',
					'upload_files',
				),
			'orders'   =>
				array(
					'read_shop_orders',
					'view_shop_orders',
					'edit_shop_orders',
					'delete_shop_orders',
				),
        );

        update_option( Utill::MULTIVENDORX_SETTINGS['store-capability'], $store_permissions );

        $user_permissions = array(
            'store_owner' =>
                array(
                    'manage_products',
                    'read_products',
                    'edit_products',
                    'delete_products',
                    'publish_products',
                    'upload_files',
                    'read_shop_orders',
                    'view_shop_orders',
                    'edit_shop_orders',
                    'delete_shop_orders',
				),
		);

        update_option( Utill::MULTIVENDORX_SETTINGS['user-capability'], $user_permissions );

        $disbursment_settings = array(
            'disbursement_order_status' => array( 'completed' ),
            'payment_schedules'         => 'mannual',
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
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['marketplace'], $marketplace_settings );

        $general_settings = array(
            'approve_store' => 'manually',
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

        $order_settings = array(
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
        $product_compliance_settings['who_can_report'] ='anyone';
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
        // 6. Save back to DB
        update_option( Utill::MULTIVENDORX_SETTINGS['identity-verification'], $settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['order-actions-refunds'], $order_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['delivery'], $delivery_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['legal-compliance'], $legal_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['product-compliance'], $product_compliance_settings );
        update_option( Utill::MULTIVENDORX_SETTINGS['review-management'], $review_settings );
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

    /**
     * Migrate old Multivendorx settings 
     * @return void
     */
    public function migrate_old_settings() {
         $previous_capability_settings = get_option( 'mvx_products_capability_tab_settings', [] );

        if (!empty($previous_capability_settings['is_submit_product'])) {
            $store_permissions['products'] = array('read_products', 'add_products');
        }
        if (!empty($previous_capability_settings['is_published_product'])) {
            $store_permissions['products'] = array('publish_products');
        }
        if (!empty($previous_capability_settings['is_edit_delete_published_product'])) {
            $store_permissions['products'] = array('edit_published_products');
        }
        if (!empty($previous_capability_settings['publish_and_submit_products'])) {
            $store_permissions['products'] = array('edit_approved_products');
        }

        if (!empty($previous_capability_settings['is_submit_coupon'])) {
            $store_permissions['coupons'] = array('add_shop_coupons', 'read_shop_coupons');
        }
        if (!empty($previous_capability_settings['is_published_coupon'])) {
            $store_permissions['coupons'] = array('publish_coupons');
        }
        if (!empty($previous_capability_settings['is_edit_delete_published_coupon'])) {
            $store_permissions['coupons'] = array('edit_shop_coupons');
        }
        update_option( Utill::MULTIVENDORX_SETTINGS['store-capability'], $store_permissions );

        $previous_product_settings = get_option( 'mvx_products_tab_settings', [] );
        $product_settings = array(
            'type_options'    => !empty($previous_product_settings['type_options']) ? $previous_product_settings['type_options'] : array(),
            'products_fields' => !empty($previous_product_settings['products_fields']) ? $previous_product_settings['products_fields'] : array(),
            );
        update_option( Utill::MULTIVENDORX_SETTINGS['product-preferencess'], $product_settings );
            
        $previous_general_settings = get_option( 'mvx_settings_general_tab_settings', [] );
        $general_settings = array(
            'approve_store' => !empty($previous_general_settings['approve_vendor']) ? $previous_general_settings['approve_vendor'] : 'manually',
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['general'], $general_settings );

        $privacy_settings = array(
            'store_branding_details' => !empty($general_settings['display_product_seller']) ? array('show_store_name', 'show_store_description', 'show_store_logo_next_to_products') : array(),
            'store_order_display' => !empty($general_settings['display_product_seller']) ? array('group_items_by_store_in_cart') : array(),
        );
        update_option( Utill::MULTIVENDORX_SETTINGS['privacy'], $privacy_settings );

        $previous_store_settings = get_option( 'mvx_store_tab_settings', [] );

        if (!empty($previous_store_settings['mvx_hide_vendor_details'])) {
            $privacy_settings['store_branding_details'] = array();
            $privacy_settings['store_contact_details'] = array();
        }
        update_option( Utill::MULTIVENDORX_SETTINGS['privacy'], $privacy_settings );

    }
}
