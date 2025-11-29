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
     * @param   string $text
     * @return  string
     */
    public static function add_single_quots( $text ) {
        if ( is_string( $text ) ) {
            return "'$text'";
        }
        return $text;
    }

    /**
     * Check if current page is store dashboard page.
     *
     * @return bool
     */
    public static function is_store_dashboard() {
        $dashboard_page = (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' );
        // if (is_page($dashboard_page)) {
        // $has_shortcode = has_shortcode(get_post($dashboard_page)->post_content, 'multivendorx_store_dashboard');
        // return $has_shortcode;
        // }
        return is_page( $dashboard_page );
    }

    /**
     * Check if current page is store registration page.
     *
     * @return bool
     */
    public static function is_store_registration_page() {
        $registration_page = (int) MultiVendorX()->setting->get_setting( 'store_registration_page' );
        // if (is_page($registration_page)) {
        // $has_shortcode = has_shortcode(get_post($registration_page)->post_content, 'multivendorx_store_registration');
        // return $has_shortcode;
        // }
        return is_page( $registration_page );
    }
}
