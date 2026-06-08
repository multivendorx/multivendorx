<?php
/**
 * CatalogX Utill class file.
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Utill class
 *
 * @class       Utill class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Utill {
    /**
     * Core custom database tables used by CatalogX.
     *
     * These tables store enquiry data, rules configuration,
     * and enquiry message history.
     *
     * @var array<string, string>
     */
    public const TABLES = array(
        'enquiry' => 'catalogx_enquiry',
        'rule'    => 'catalogx_rules',
        'message' => 'catalogx_messages',
    );

    /**
     * Option keys used for storing CatalogX module settings
     * in the WordPress options table.
     *
     * Each key represents a settings section or module and maps
     * to its corresponding database option name.
     *
     * @var array<string, string>
     */
    public const CATALOGX_SETTINGS = array(
        'extra'                         => 'catalogx_extra_settings',
        'enquiry-catalog-customization' => 'catalogx_enquiry_catalog_customization_settings',
        'shopping'                      => 'catalogx_shopping_settings',
        'enquiry'                       => 'catalogx_enquiry_settings',
        'quotation'                     => 'catalogx_quotation_settings',
        'tools'                         => 'catalogx_tools_settings',
        'pages'                         => 'catalogx_pages_settings',
        'enquiry-quote-exclusion'       => 'catalogx_enquiry_quote_exclusion_settings',
        'enquiry-form-customization'    => 'catalogx_enquiry_form_customization_settings',
        'enquiry-email-temp'            => 'catalogx_enquiry_email_temp_settings',
        'wholesale'                     => 'catalogx_wholesale_settings',
        'wholesale-registration'        => 'catalogx_wholesale_registration_settings',
    );

    /**
     * Option keys used for storing internal plugin states,
     * installation flags, and metadata in the WordPress options table.
     *
     * These values are primarily used during plugin setup,
     * activation, onboarding, and version management.
     *
     * @var array<string, string>
     */
    public const CATALOGX_OTHER_SETTINGS = array(
        'run_installer'       => 'catalogx_run_installer',
        'installed'           => 'catalogx_installed',
        'plugin_activated'    => 'catalogx_plugin_activated',
        'plugin_page_install' => 'dc_product_vendor_plugin_page_install',
        'tour_completed'      => 'catalogx_tour_completed',
        'plugin_db_version'   => 'catalogx_version',
    );

    /**
     * Option key used to store the list of active CatalogX modules.
     *
     * The value typically contains an array of enabled module identifiers.
     *
     * @var string
     */
    public const ACTIVE_MODULES_DB_KEY = 'catalogx_all_active_module_list';

    /**
     * Function to console and debug errors.
     *
     * @param mixed $data The data to be logged (string, array, object, etc.).
     * @return void
     */
    public static function log( $data ) {
        if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
            return;
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        WP_Filesystem();

        global $wp_filesystem;

        $log_file = CatalogX()->plugin_path . 'log/catalogx.log';
        $message  = wp_json_encode( $data, JSON_PRETTY_PRINT ) . "\n---------------------------\n";

        $existing = $wp_filesystem->exists( $log_file ) ? $wp_filesystem->get_contents( $log_file ) : '';
        $wp_filesystem->put_contents( $log_file, $existing . $message, FS_CHMOD_FILE );
    }

    /**
     * Check is Catalog Pro is active or not.
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
     * @param mixed $template_name The name of the template file to load.
     * @param array $args ( default: array() ) .
     * @return void
     */
    public static function get_template( $template_name, $args = array() ) {

        // Check if the template exists in the theme.
        $theme_template = get_stylesheet_directory() . '/woocommerce-catalog-enquiry/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template.
        $located = file_exists( $theme_template ) ? $theme_template : CatalogX()->plugin_path . 'templates/' . $template_name;

        // Load the template.
        load_template( $located, false, $args );
    }


    /**
     * Create atachment from array of fiels.
     *
     * @param mixed $uploaded_file Array representing the uploaded file.
     * @return int|\WP_Error
     */
    public static function create_attachment_from_files_array( $uploaded_file ) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';

        // Handle the file upload.
        $upload = wp_handle_upload( $uploaded_file, array( 'test_form' => false ) );

        // Prepare the attachment.
        $file_path = $upload['file'];
        $file_name = basename( $file_path );
        $file_type = wp_check_filetype( $file_name, null );

        // Create attachment post.
        $attachment = array(
            'guid'           => $upload['url'],
            'post_mime_type' => $file_type['type'],
            'post_title'     => preg_replace( '/\.[^.]+$/', '', $file_name ),
            'post_content'   => '',
            'post_status'    => 'inherit',
        );

        // Insert attachment into the media library.
        $attachment_id = wp_insert_attachment( $attachment, $file_path );

        if ( ! is_wp_error( $attachment_id ) ) {
            // Generate metadata for the attachment, and update the attachment.
            $attachment_data = wp_generate_attachment_metadata( $attachment_id, $file_path );
            wp_update_attachment_metadata( $attachment_id, $attachment_data );

            return $attachment_id; // Return the attachment ID.
        }

        return 0;
    }

    /**
     * Check the plugin is active or not
     *
     * @param string $name Optional. Plugin name to check. Supported: 'notifima', 'multivendorx'.
     * @return bool
     */
    public static function is_active_plugin( $name = '' ) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        if ( 'notifima' === $name ) {
            return is_plugin_active( 'woocommerce-product-stock-alert/product_stock_alert.php' );
        }

        if ( 'multivendorx' === $name ) {
            return is_plugin_active( 'dc-woocommerce-multi-vendor/dc_product_vendor.php' );
        }

        return false;
    }

    /**
     * WPML support for language translation
     *
     * @param string $context The translation context (used by WPML).
     * @param string $name The name of the string to translate.
     * @param string $default_value The default string to return if no translation is found.
     * @return string The translated string.
     */
    public static function get_translated_string( $context, $name, $default_value ) {
        if ( function_exists( 'icl_t' ) ) {
            return icl_t( $context, $name, $default_value );
        } else {
            return __( $default_value, 'catalogx' );
        }
    }
    /**
     * Validate REST nonce.
     *
     * @param \WP_REST_Request $request Request object.
     * @return true|\WP_Error
     */
    public static function validate_nonce( $request ) {
        $nonce = sanitize_text_field( $request->get_header( 'X-WP-Nonce' ) );

        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                esc_html__( 'Invalid nonce.', 'catalogx' ),
                array( 'status' => 403 )
            );

            self::log( $error );

            return $error;
        }

        return true;
    }
    
    /**
	 * Convert WordPress PHP date format to React date picker format
	 *
	 * @param string $date_format WordPress PHP date format.
	 * @return string React date picker format.
	 */
	public static function wp_to_react_date_format( $date_format ) {
		static $map = array(
			'Y' => 'YYYY',
			'y' => 'YY',
			'F' => 'MMMM',
			'M' => 'MMM',
			'm' => 'MM',
			'n' => 'M',
			'd' => 'DD',
			'j' => 'D',
			'l' => 'dddd',
			'D' => 'ddd',
			'H' => 'HH',
			'G' => 'H',
			'h' => 'hh',
			'g' => 'h',
			'i' => 'mm',
			's' => 'ss',
			'A' => 'A',
			'a' => 'a',
		);

		return strtr( $date_format, $map );
	}
}
