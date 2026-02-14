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
     * Constent holds table name
     *
     * @var array
     */
    const TABLES = array(
        'enquiry' => 'catalogx_enquiry',
        'rule'    => 'catalogx_rules',
        'message' => 'catalogx_messages',
    );

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
     * @param mixed $files_array Array representing the uploaded file.
     * @return int|\WP_Error
     */
    public static function create_attachment_from_files_array( $files_array ) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';

        // Handle the file upload.
        $upload = wp_handle_upload( $files_array, array( 'test_form' => false ) );

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
        }
        return $default_value;
    }

    /**
     * Generate inline CSS styles for button.
     *
     * Applies styles based on provided settings and whether the button is in a hover state.
     *
     * @param array $button_settings An associative array of button styling options.
     * @param bool  $hover Optional. Whether to apply hover styles. Default false.
     * @return string CSS string to apply inline on the button.
     */
    public static function get_button_styles( $button_settings, $hover = false ) {
        $button_css  = '';
        $border_size = ! empty( $button_settings['button_border_size'] ) ? esc_html( $button_settings['button_border_size'] ) . 'px' : '1px';

        if ( $hover ) {
            if ( isset( $button_settings['button_background_color_onhover'] ) ) {
                $button_css .= ! empty( $button_settings['button_background_color_onhover'] ) ? 'background: ' . $button_settings['button_background_color_onhover'] . ' !important;' : '';
            }
            if ( isset( $button_settings['button_text_color_onhover'] ) ) {
                $button_css .= ! empty( $button_settings['button_text_color_onhover'] ) ? ' color: ' . $button_settings['button_text_color_onhover'] . ' !important;' : '';
            }
            if ( isset( $button_settings['button_border_color_onhover'] ) ) {
                $button_css .= ! empty( $button_settings['button_border_color_onhover'] ) ? 'border: ' . $border_size . ' solid' . $button_settings['button_border_color_onhover'] . ' !important;' : '';
            }
        } else {
            if ( ! empty( $button_settings['button_background_color'] ) ) {
                $button_css .= 'background: ' . esc_html( $button_settings['button_background_color'] ) . ';';
            }
            if ( ! empty( $button_settings['button_text_color'] ) ) {
                $button_css .= 'color: ' . esc_html( $button_settings['button_text_color'] ) . ';';
            }
            if ( ! empty( $button_settings['button_border_color'] ) ) {
                $button_css .= 'border: ' . $border_size . ' solid ' . esc_html( $button_settings['button_border_color'] ) . ';';
            }
            if ( ! empty( $button_settings['button_font_size'] ) ) {
                $button_css .= 'font-size: ' . esc_html( $button_settings['button_font_size'] ) . 'px;';
            }
            if ( ! empty( $button_settings['button_border_radious'] ) ) {
                $button_css .= 'border-radius: ' . esc_html( $button_settings['button_border_radious'] ) . 'px;';
            }
            if ( ! empty( $button_settings['button_font_width'] ) ) {
                $button_css .= 'font-weight: ' . esc_html( $button_settings['button_font_width'] ) . 'px;';
            }
            if ( ! empty( $button_settings['button_padding'] ) ) {
                $button_css .= 'padding: ' . esc_html( $button_settings['button_padding'] ) . 'px;';
            }
            if ( ! empty( $button_settings['button_margin'] ) ) {
                $button_css .= 'margin: ' . esc_html( $button_settings['button_margin'] ) . 'px;';
            }
        }

        return $button_css;
    }
}
