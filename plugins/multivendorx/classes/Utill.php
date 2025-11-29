<?php
/**
 * Utill class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Utill class
 *
 * @class       Utill class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Utill {

    /**
     * Constent holds table name
     *
     * @var array
     */
    const TABLES = array(
        'commission'              => 'multivendorx_commissions',
        'store'                   => 'multivendorx_store',
        'store_users'             => 'multivendorx_store_users',
        'store_meta'              => 'multivendorx_store_meta',
        'transaction'             => 'multivendorx_transactions',
        'real_time_transaction'   => 'multivendorx_real_time_transactions',
        'product_qna'             => 'multivendorx_questions_and_answers',
        'report_abuse'            => 'multivendorx_report_abuse',
        'shipping_zone'           => 'multivendorx_shipping_zone_methods',
        'shipping_zone_locations' => 'multivendorx_shipping_zone_locations',
        'review'                  => 'multivendorx_store_reviews',
        'rating'                  => 'multivendorx_store_review_ratings',
        'products_map'            => 'multivendorx_products_map',
        'notifications'           => 'multivendorx_store_activity_notifications',
        'system_events'           => 'multivendorx_system_events',
    );

    const ADMIN_SETTINGS = array(
        'general'                        => 'multivendorx_general_settings',
        'store-registration-form'        => 'multivendorx_store-registration-form_settings',
        'menu-manager'                   => 'multivendorx_menu_manager_settings',
        'privacy-settings'               => 'multivendorx_privacy_settings_settings',
        'store-coupon'                   => 'multivendorx_store_coupon_settings',
        'store'                          => 'multivendorx_store_settings',
        'products'                       => 'multivendorx_products_settings',
        'policy'                         => 'multivendorx_policy_settings',
        'disbursement'                   => 'multivendorx_disbursement_settings',
        'commissions'                    => 'multivendorx_commissions_settings',
        'marketplace-settings'           => 'multivendorx_marketplace_settings_settings',
        'user-capability'                => 'multivendorx_user_capability_settings',
        'store-capability'               => 'multivendorx_store_capability_settings',
        'identity-verification'          => 'multivendorx_identity_verification_settings',
        'commission-rule'                => 'multivendorx_commission_rule_settings',
        'payment-integration'            => 'multivendorx_payment_integration_settings',
        'store-appearance'               => 'multivendorx_store_appearance_settings',
        'product-report-abuse'           => 'multivendorx_product_report_abuse_settings',
        'store-commissions'              => 'multivendorx_store_commissions_settings',
        'store-inventory'                => 'multivendorx_store_inventory_settings',
        'review-management'              => 'multivendorx_review_management_settings',
        'order-actions-refunds'          => 'multivendorx_order_actions_refunds_settings',
        'advertising'                    => 'multivendorx_advertising_settings',
        'product-preferencess'           => 'multivendorx_product_preferencess_settings',
        'product-store-category-control' => 'multivendorx_product_preferencess_settings',
        'geolocation'                    => 'multivendorx_geolocation_settings',
        'shipping'                       => 'multivendorx_shipping_settings',
        'legal-compliance'               => 'multivendorx_legal_compliance_settings',
        'product-compliance'             => 'multivendorx_product_compliance_settings',
        'tax-compliance'                 => 'multivendorx_tax_compliance_settings',
        'custom-css'                     => 'multivendorx_custom_css_settings',
        'single-product-multiple-store'  => 'multivendorx_single_product_multiple_store_settings',
        'pending-approval'               => 'multivendorx_pending_approval_settings',
        'rejected'                       => 'multivendorx_rejected_settings',
        'permanently-rejected'           => 'multivendorx_permanently_rejected_settings',
        'under-review'                   => 'multivendorx_under_review_settings',
        'suspended'                      => 'multivendorx_suspended_settings',
    );

    const OTHER_SETTINGS = array(
        'installed'                        => 'multivendorx_installed',
        'plugin_activated'                 => 'multivendorx_plugin_activated',
        'plugin_db_version'                => 'dc_product_vendor_plugin_db_version',
        'plugin_page_install'              => 'dc_product_vendor_plugin_page_install',
        'log_file'                         => 'multivendorx_log_file',
        'tour_active'                      => 'multivendorx_tour_active',
        'admin_email'                      => 'admin_email',
        'default_role'                     => 'default_role',
    );

    const WOO_SETTINGS = array(
        'taxes'                           => 'woocommerce_calc_taxes',
        'generate_password'               => 'woocommerce_registration_generate_password',
        'default_country'                 => 'woocommerce_default_country',
        'manage_stock'                    => 'woocommerce_manage_stock',
        'weight_unit'                     => 'woocommerce_weight_unit',
        'dimension_unit'                  => 'woocommerce_dimension_unit',
        'notify_low_stock'                => 'woocommerce_notify_low_stock_amount',
    );

    const WORDPRESS_SETTINGS = array(
        'permalink'                       => 'permalink_structure',
        'rows'                            => 'default_post_edit_rows',
    );
    const POST_META_SETTINGS = array(
        'store_id'                        => 'multivendorx_store_id',
        'fixed_commission'                => 'multivendorx_product_fixed_commission',
        'percentage_commission'           => 'multivendorx_product_percentage_commission',
        'variable_product_percentage'     => 'multivendorx_variable_product_percentage_commission',
        'variable_product_fixed'          => 'multivendorx_variable_product_fixed_commission',
        'do_list'                         => '_dismiss_to_do_list',
        'spmv_map_id'                     => '_mvx_spmv_map_id',
        'gtin_code'                       => '_mvx_gtin_code',
        'shipping_policy'                 => 'multivendorx_shipping_policy',
        'refund_policy'                   => 'multivendorx_refund_policy',
        'cancellation_policy'             => 'multivendorx_cancellation_policy',
        'announcement_stores'             => 'multivendorx_announcement_stores',
        'announcement_url'                => 'multivendorx_announcement_url',
        

    );
    const ACTIVE_MODULES_DB_KEY = 'multivendorx_all_active_module_list';

    /**
     * MooWoodle LOG function.
     *
     * @param string $message message.
     * @return bool
     */
	public static function log( $message ) {
		global $wp_filesystem;

		$message = var_export( $message, true ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_var_export

		// Init filesystem.
		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		// log folder create.
		if ( ! file_exists( MultiVendorX()->multivendorx_logs_dir . '/.htaccess' ) ) {
			$result = wp_mkdir_p( MultiVendorX()->multivendorx_logs_dir );
			if ( true === $result ) {
				// Create infrastructure to prevent listing contents of the logs directory.
				try {
					$wp_filesystem->put_contents( MultiVendorX()->multivendorx_logs_dir . '/.htaccess', 'deny from all' );
					$wp_filesystem->put_contents( MultiVendorX()->multivendorx_logs_dir . '/index.html', '' );
				} catch ( Exception $exception ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
					// Creation failed.
				}
			}
			$message = "MultiVendorX Log file Created\n";
		}

		// Clear log file.
		if ( filter_input( INPUT_POST, 'clearlog', FILTER_DEFAULT ) !== null ) {
			$message = "MultiVendorX Log file Cleared\n";
		}

		// Write Log.
		if ( '' !== $message ) {
			$log_entry        = gmdate( 'd/m/Y H:i:s', time() ) . ': ' . $message;
			$existing_content = $wp_filesystem->get_contents( MultiVendorX()->log_file );

			// Append existing content.
			if ( ! empty( $existing_content ) ) {
				$log_entry = "\n" . $log_entry;
			}

			return $wp_filesystem->put_contents( MultiVendorX()->log_file, $existing_content . $log_entry );
		}

		return false;
	}

    /**
     * Check pro plugin is active or not.
     *
     * @return bool
     */
    public static function is_khali_dabba() {
        return apply_filters( 'kothay_dabba', false );
    }

    /**
     * Get other templates ( e.g. product attributes ) passing attributes and including the file.
     *
     * @access public
     * @param  mixed $template_name template name.
     * @param  array $args          ( default: array() ).
     * @return void
     */
    public static function get_template( $template_name, $args = array() ) {

        // Check if the template exists in the theme.
        $theme_template = get_stylesheet_directory() . '/dc-woocommerce-product-vendor/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template.
        $located = file_exists( $theme_template ) ? $theme_template : MultiVendorX()->plugin_path . 'templates/' . $template_name;

        // Load the template.
        load_template( $located, false, $args );
    }


    /**
     * Utility function add aditional single quote in a string.
     *
     * @param   string $string
     * @return  string
     */
    public static function add_single_quots( $string ) {
        if ( is_string( $string ) ) {
            return "'$string'";
        }
        return $string;
    }

    public static function is_store_dashboard() {
        $dashboard_page = (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' );
        // if (is_page($dashboard_page)) {
        // $has_shortcode = has_shortcode(get_post($dashboard_page)->post_content, 'multivendorx_store_dashboard');
        // return $has_shortcode;
        // }
        return is_page( $dashboard_page );
    }

    public static function is_store_registration_page() {
        $registration_page = (int) MultiVendorX()->setting->get_setting( 'store_registration_page' );
        // if (is_page($registration_page)) {
        // $has_shortcode = has_shortcode(get_post($registration_page)->post_content, 'multivendorx_store_registration');
        // return $has_shortcode;
        // }
        return is_page( $registration_page );
    }
}
