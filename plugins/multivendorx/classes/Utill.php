<?php

/**
 * Utill class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Store\Store;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Utill class
 *
 * @class       Utill class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Utill
{
    /**
     * Utill class construct function
     */
    public function __construct() {
        add_action('wp', array($this, 'disable_wpml_switcher_on_dashboard'), 99);
    }

    /**
     * Constent holds table name
     *
     * @var array
     */
    const TABLES = array(
        'commission'            => 'multivendorx_commissions',
        'store'                 => 'multivendorx_store',
        'store_users'           => 'multivendorx_store_users',
        'store_meta'            => 'multivendorx_store_meta',
        'transaction'           => 'multivendorx_transactions',
        'real_time_transaction' => 'multivendorx_real_time_transactions',
        'product_qna'           => 'multivendorx_questions_and_answers',
        'report_abuse'          => 'multivendorx_report_abuse',
        'review'                => 'multivendorx_store_reviews',
        'rating'                => 'multivendorx_store_review_ratings',
        'products_map'          => 'multivendorx_products_map',
        'notifications'         => 'multivendorx_store_activity_notifications',
        'system_events'         => 'multivendorx_system_events',
        'visitors_stats'        => 'multivendorx_visitors_stats',
    );

    const MULTIVENDORX_SETTINGS = array(
        'general'                       => 'multivendorx_general_settings',
        'store-registration-form'       => 'multivendorx_store_registration_form_settings',
        'menu-manager'                  => 'multivendorx_menu_manager_settings',
        'privacy'                       => 'multivendorx_privacy_settings',
        'coupon'                        => 'multivendorx_coupon_settings',
        'store'                         => 'multivendorx_store_settings',
        'products'                      => 'multivendorx_products_settings',
        'policy'                        => 'multivendorx_policy_settings',
        'disbursement'                  => 'multivendorx_disbursement_settings',
        'commissions'                   => 'multivendorx_commissions_settings',
        'marketplace'                   => 'multivendorx_marketplace_settings',
        'user-capability'               => 'multivendorx_user_capability_settings',
        'store-capability'              => 'multivendorx_store_capability_settings',
        'identity-verification'         => 'multivendorx_identity_verification_settings',
        'commission-rule'               => 'multivendorx_commission_rule_settings',
        'payment-integration'           => 'multivendorx_payment_integration_settings',
        'store-appearance'              => 'multivendorx_store_appearance_settings',
        'product-report-abuse'          => 'multivendorx_product_report_abuse_settings',
        'store-commissions'             => 'multivendorx_store_commissions_settings',
        'store-inventory'               => 'multivendorx_store_inventory_settings',
        'review-management'             => 'multivendorx_review_management_settings',
        'order-actions-refunds'         => 'multivendorx_order_actions_refunds_settings',
        'advertising'                   => 'multivendorx_advertising_settings',
        'product-preferencess'          => 'multivendorx_product_preferencess_settings',
        'geolocation'                   => 'multivendorx_geolocation_settings',
        'shipping'                      => 'multivendorx_shipping_settings',
        'legal-compliance'              => 'multivendorx_legal_compliance_settings',
        'product-compliance'            => 'multivendorx_product_compliance_settings',
        'tax-compliance'                => 'multivendorx_tax_compliance_settings',
        'custom-css'                    => 'multivendorx_custom_css_settings',
        'single-product-multiple-store' => 'multivendorx_single_product_multiple_store_settings',
        'pending'                       => 'multivendorx_pending_settings',
        'rejected'                      => 'multivendorx_rejected_settings',
        'permanently-rejected'          => 'multivendorx_permanently_rejected_settings',
        'under-review'                  => 'multivendorx_under_review_settings',
        'suspended'                     => 'multivendorx_suspended_settings',
        'ai-automation'                 => 'multivendorx_ai_automation_settings',
        'log'                           => 'multivendorx_log_settings',
        'min-max'                       => 'multivendorx_min_max_settings',
        'delivery'                      => 'multivendorx_delivery_settings',
        'notification-configuration'    => 'multivendorx_notification_configuration_settings',
        'non-compliance'                => 'multivendorx_non_compliance_settings',
        'development-tools'             => 'multivendorx_development_tools_settings',
        'live-chat'                     => 'multivendorx_live_chat_settings',
    );

    const MULTIVENDORX_OTHER_SETTINGS = array(
        'installed'           => 'multivendorx_installed',
        'plugin_activated'    => 'multivendorx_plugin_activated',
        'plugin_db_version'   => 'dc_product_vendor_plugin_db_version',
        'plugin_page_install' => 'dc_product_vendor_plugin_page_install',
        'log_file'            => 'multivendorx_log_file',
        'tour_active'         => 'multivendorx_tour_active',
        'admin_email'         => 'admin_email',
        'default_role'        => 'default_role',
        'revenue_mode_store'  => 'revenue_mode_store',
        'payment_gateway_charge'  => 'payment_gateway_charge',
    );

    const WOO_SETTINGS = array(
        'taxes'             => 'woocommerce_calc_taxes',
        'generate_password' => 'woocommerce_registration_generate_password',
        'default_country'   => 'woocommerce_default_country',
        'weight_unit'       => 'woocommerce_weight_unit',
        'dimension_unit'    => 'woocommerce_dimension_unit',
    );

    const ORDER_META_SETTINGS = array(
        'order_status_synchronized'       => 'multivendorx_order_status_synchronized',
        'store_item_commission'           => 'multivendorx_store_item_commission',
        'cod_order_payment'               => 'multivendorx_cod_order_payment',
        'customer_refund_reason'          => 'multivendorx_customer_refund_reason',
        'customer_refund_order'           => 'multivendorx_customer_refund_order',
        'customer_refund_product'         => 'multivendorx_customer_refund_product',
        'customer_refund_product_imgs'    => 'multivendorx_customer_refund_product_imgs',
        'customer_refund_product_img_ids' => 'multivendorx_customer_refund_product_img_ids',
        'customer_refund_addi_info'       => 'multivendorx_customer_refund_addi_info',
        'store_order_shipping_item_id'    => 'store_order_shipping_item_id',
        'multivendorx_store_order'        => 'multivendorx_store_order',
        'has_sub_order'                   => 'multivendorx_has_sub_order',
        'sold_by'                         => 'multivendorx_sold_by',
        'commissions_processed'           => 'multivendorx_commissions_processed',
        'commission_id'                   => 'multivendorx_commission_id',
        'shipping_provider'               => 'multivendorx_shipping_provider',
        'tracking_url'                    => 'multivendorx_tracking_url',
        'tracking_id'                     => 'multivendorx_tracking_id',
    );

    const WORDPRESS_SETTINGS = array(
        'permalink'                      => 'permalink_structure',
        'rows'                           => 'default_post_edit_rows',
        'product_shipping_class'         => 'product_shipping_class',
        'shipping_origin_country'        => 'shipping_origin_country',
        'category_fixed_commission'      => 'multivendorx_category_fixed_commission',
        'category_percentage_commission' => 'multivendorx_category_percentage_commission',

    );

    const POST_META_SETTINGS = array(
        'store_id'                    => 'multivendorx_store_id',
        'fixed_commission'            => 'multivendorx_product_fixed_commission',
        'percentage_commission'       => 'multivendorx_product_percentage_commission',
        'variable_product_percentage' => 'multivendorx_variable_product_percentage_commission',
        'variable_product_fixed'      => 'multivendorx_variable_product_fixed_commission',
        'shipping_policy'             => 'multivendorx_shipping_policy',
        'refund_policy'               => 'multivendorx_refund_policy',
        'cancellation_policy'         => 'multivendorx_cancellation_policy',
        'announcement_stores'         => 'multivendorx_announcement_stores',
        'announcement_url'            => 'multivendorx_announcement_url',
    );

    const STORE_SETTINGS_KEYS = array(
        'name'                       => 'name',
        'slug'                       => 'slug',
        'description'                => 'description',
        'who_created'                => 'who_created',
        'status'                     => 'status',
        'withdrawals_count'          => 'withdrawals_count',
        'payment_method'             => 'payment_method',
        'paypal_email'               => 'paypal_email',
        'stripe_account_id'          => 'stripe_connect_account_id',
        'stripe_account_type'        => 'stripe_account_type',
        'stripe_oauth_state'         => 'stripe_oauth_state',
        'registration_data'          => 'multivendorx_registration_data',
        'request_withdrawal_amount'  => 'request_withdrawal_amount',
        'store_reject_note'          => 'store_reject_note',
        'primary_email'              => 'primary_email',
        'phone'                      => 'phone',
        'address'                    => 'address',
        'address_1'                  => 'address_1',
        'address_2'                  => 'address_2',
        'image'                      => 'image',
        'city'                       => 'city',
        'state'                      => 'state',
        'country'                    => 'country',
        'postcode'                   => 'postcode',
        'create_time'                => 'create_time',
        'deactivation_reason'        => 'deactivation_reason',
        'deactivation_request_date'  => 'deactivation_request_date',
        'followers'                  => 'followers',
        'account_number'             => 'account_number',
        'shipping_class_id'          => 'shipping_class_id',
        'store_policy'               => 'store_policy',
        'shipping_policy'            => 'shipping_policy',
        'refund_policy'              => 'refund_policy',
        'cancellation_policy'        => 'cancellation_policy',
        'country_local_pickup_cost'          => 'local_pickup_cost',
        'country_shipping_rates'             => 'multivendorx_shipping_rates',
        'country_additional_qty'             => 'multivendorx_additional_qty',
        'country_additional_product'         => 'multivendorx_additional_product',
        'country_shipping_type_price'        => 'multivendorx_shipping_type_price',
        'country_free_shipping_amount'       => 'free_shipping_amount',
        'distance_free_shipping_amount'       => 'free_shipping_amount',
        'location_lat'               => 'location_lat',
        'location_lng'               => 'location_lng',
        'distance_default_cost'      => 'distance_default_cost',
        'distance_max'               => 'distance_max',
        'distance_local_pickup_cost' => 'distance_local_pickup_cost',
        'distance_rules'             => 'distance_rules',
        'shipping_options'           => 'shipping_options',
        'distance_type'              => 'distance_type',
        'whatsapp_number'            => 'whatsapp_number',
        'facebook_page_id'           => 'facebook_page_id',
    );

    const USER_SETTINGS_KEYS = array(
        'active_store'                   => 'multivendorx_active_store',
        'first_name'                     => 'first_name',
        'last_name'                      => 'last_name',
        'social_verification'            => 'social_verification_connections',
        'following_stores'               => 'multivendorx_following_stores',
        'multivendorx_user_location_lat' => 'multivendorx_user_location_lat',
        'multivendorx_user_location_lng' => 'multivendorx_user_location_lng',
    );

    const POST_TYPES = array(
        'announcement' => 'multivendorx_an',
        'knowledge'    => 'multivendorx_kb',
    );

    const ACTIVE_MODULES_DB_KEY = 'multivendorx_all_active_module_list';

    /**
     * Write a formatted log entry for MultiVendorX.
     *
     * Handles:
     * - Exceptions
     * - WP_Error objects
     * - WordPress DB errors
     * - Normal text messages
     *
     * @param mixed  $message Log message, Exception, or WP_Error.
     * @param string $type    Log type (INFO, ERROR, EXCEPTION, WP_ERROR).
     * @param array  $extra   Additional metadata to include.
     * @return bool           True on success, false on failure.
     */
    public static function log($message = '', $type = 'INFO', $extra = array())
    {
        global $wp_filesystem, $wpdb;

        // Initialize the WordPress filesystem API.
        if (empty($wp_filesystem)) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            WP_Filesystem();
        }

        // Create the logs directory and protect it with .htaccess.
        if (! file_exists(MultiVendorX()->multivendorx_logs_dir . '/.htaccess')) {
            wp_mkdir_p(MultiVendorX()->multivendorx_logs_dir);
            try {
                $wp_filesystem->put_contents(
                    MultiVendorX()->multivendorx_logs_dir . '/.htaccess',
                    'deny from all'
                );
                $wp_filesystem->put_contents(
                    MultiVendorX()->multivendorx_logs_dir . '/index.html',
                    ''
                );
            } catch (Exception $e) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                // Directory creation failed but logging should continue.
            }
        }

        // Convert Exception into structured metadata.
        if ($message instanceof \Exception) {
            $type             = 'EXCEPTION';
            $extra['Message'] = $message->getMessage();
            $extra['Code']    = $message->getCode();
            $extra['File']    = $message->getFile();
            $extra['Line']    = $message->getLine();
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
            $extra['Stack'] = $message->getTraceAsString();
            $message        = 'Exception occurred';
        }
        // Convert Throwable into structured metadata.
        if ($message instanceof \Throwable) {
            $type             = 'EXCEPTION';
            $extra['Message'] = $message->getMessage();
            $extra['Code']    = $message->getCode();
            $extra['File']    = $message->getFile();
            $extra['Line']    = $message->getLine();
            $extra['Stack']   = $message->getTraceAsString();
            $message          = 'Throwable occurred';
        }

        // Convert WP_Error into structured metadata.
        if ($message instanceof \WP_Error) {
            $type             = 'WP_ERROR';
            $extra['Code']    = $message->get_error_code();
            $extra['Message'] = $message->get_error_message();
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
            $extra['Data'] = $message->get_error_data();
            $message       = 'WP_Error occurred';
        }

        // Automatically capture database errors.
        if (isset($wpdb) && ! empty($wpdb->last_error)) {
            $extra['DB Error']   = $wpdb->last_error;
            $extra['Last Query'] = $wpdb->last_query;
        }

        // Automatic metadata.
        $meta = array_merge(
            array(
                'Type'      => $type,
                'Timestamp' => current_time('mysql'),
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
                'File'      => debug_backtrace()[1]['file'] ?? '',
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
                'Line'      => debug_backtrace()[1]['line'] ?? '',
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack'     => wp_debug_backtrace_summary(),
            ),
            $extra
        );

        $timestamp = $meta['Timestamp'];
        $log_lines = array();

        foreach ($meta as $key => $val) {
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
            $val         = trim(print_r($val, true));
            $log_lines[] = "{$timestamp} : {$key}: {$val}";
        }

        // Add the main message.
        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
        $log_lines[] = "{$timestamp} : Message: " . trim(print_r($message, true));

        // Build final entry block.
        $log_entry = implode("\n", $log_lines) . "\n";

        $existing = $wp_filesystem->get_contents(MultiVendorX()->log_file);
        if (! empty($existing)) {
            $log_entry = "\n" . $log_entry; // Add spacing.
        }

        return $wp_filesystem->put_contents(
            MultiVendorX()->log_file,
            $existing . $log_entry
        );
    }

    /**
     * Check pro plugin is active or not.
     *
     * @return bool
     */
    public static function is_khali_dabba()
    {
        return apply_filters('kothay_dabba', false);
    }
    /**
     * Check if a WordPress plugin is active
     *
     * @param string $plugin_slug Plugin folder/filename, e.g., 'woocommerce/woocommerce.php'
     * @return bool
     */
    public static function is_active_plugin($plugin_slug = '')
    {
        if (empty($plugin_slug)) {
            return false;
        }

        if (! function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        return is_plugin_active($plugin_slug);
    }

    /**
     * Get other templates ( e.g. product attributes ) passing attributes and including the file.
     *
     * @access public
     * @param  mixed $template_name template name.
     * @param  array $args          ( default: array() ).
     * @return void
     */
    public static function get_template($template_name, $args = array())
    {

        // Check if the template exists in the theme.
        $theme_template = get_stylesheet_directory() . '/dc-woocommerce-product-vendor/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template.
        $located = file_exists($theme_template) ? $theme_template : MultiVendorX()->plugin_path . 'templates/' . $template_name;

        // Load the template.
        load_template($located, false, $args);
    }


    /**
     * Utility function to wrap a string in single quotes.
     *
     * @param string $value The input string to be wrapped.
     *
     * @return string The string wrapped in single quotes, or the original value if not a string.
     */
    public static function add_single_quotes($value)
    {
        if (is_string($value)) {
            return "'" . $value . "'";
        }

        return $value;
    }

    /**
     * Check if current page is store dashboard page.
     *
     * @return bool
     */
    public static function is_store_dashboard()
    {
        $dashboard_page = (int) MultiVendorX()->setting->get_setting('store_dashboard_page');
        return is_page($dashboard_page);
    }

    /**
     * Check if current page is store registration page.
     *
     * @return bool
     */
    public static function is_store_registration_page()
    {
        $registration_page = (int) MultiVendorX()->setting->get_setting('store_registration_page');
        return is_page($registration_page);
    }

    public static function is_store_page()
    {
        $store_name = get_query_var(MultiVendorX()->setting->get_setting('store_url', 'store'));

        if (! empty($store_name)) {
            $store = Store::get_store($store_name, 'slug');
        }
        return $store ?? false;
    }
    
    /**
     * Disable WPML language switcher on multivendorx React store dashboard
     */
    public function disable_wpml_switcher_on_dashboard()
    {

        if (! Utill::is_store_dashboard()) {
            return;
        }

        add_filter('icl_ls_languages', '__return_empty_array');
    }

    public static function normalize_date_range( $start_raw, $end_raw ) {
        $start_raw = sanitize_text_field( $start_raw );
        $end_raw   = sanitize_text_field( $end_raw );
    
        $start_date = '';
        $end_date   = '';
    
        if ( $start_raw && $end_raw ) {
            // Site timezone (WordPress standard)
            $timezone = wp_timezone();
    
            $start_dt = new \DateTime( $start_raw . ' 00:00:00', $timezone );
            $end_dt   = new \DateTime( $end_raw . ' 23:59:59', $timezone );
    
            $start_date = $start_dt->format( 'Y-m-d H:i:s' );
            $end_date   = $end_dt->format( 'Y-m-d H:i:s' );
        }
    
        return [
            'start_date' => $start_date,
            'end_date'   => $end_date,
        ];
    }
    
}
