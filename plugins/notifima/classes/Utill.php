<?php
/**
 * Utill class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Utill class
 *
 * @class       Utill class
 * @version     3.0.0
 * @author      MultiVendorX
 */
class Utill {

    /**
     * Function to console and debug errors.
     *
     * @param mixed $data The data to log. Can be a string, array, or object.
     */
    public static function log( $data ) {
        if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
            return;
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        WP_Filesystem();

        global $wp_filesystem;

        $log_file = Notifima()->plugin_path . 'log/notifima.log';
        $message  = wp_json_encode( $data, JSON_PRETTY_PRINT ) . "\n---------------------------\n";

        $existing = $wp_filesystem->exists( $log_file ) ? $wp_filesystem->get_contents( $log_file ) : '';
        $wp_filesystem->put_contents( $log_file, $existing . $message, FS_CHMOD_FILE );
    }

    /**
     * Get the settings arry. Non set value is replaced with default value.
     *
     * @return array
     */
    public static function get_form_settings_array() {
        // Initialize the settings keys with default values.
        $setting_keys = array(
            'double_opt_in_success'     => Notifima()->default_value['double_opt_in_success'],
            'shown_interest_text'       => Notifima()->default_value['shown_interest_text'],
            'alert_success'             => Notifima()->default_value['alert_success'],
            'alert_email_exist'         => Notifima()->default_value['alert_email_exist'],
            'valid_email'               => Notifima()->default_value['valid_email'],
            'alert_unsubscribe_message' => Notifima()->default_value['alert_unsubscribe_message'],
            'email_placeholder_text'    => Notifima()->default_value['email_placeholder_text'],
            'alert_text'                => Notifima()->default_value['alert_text'],
            'unsubscribe_button_text'   => Notifima()->default_value['unsubscribe_button_text'],
            'alert_text_color'          => Notifima()->default_value['alert_text_color'],
            'customize_btn'             => Notifima()->default_value['customize_btn'],
            'ban_email_domain_text'     => Notifima()->default_value['ban_email_domain_text'],
            'ban_email_address_text'    => Notifima()->default_value['ban_email_address_text'],
        );

        $form_settings = array();

        foreach ( $setting_keys as $setting_key => $default_value ) {
            // Overwrite with actual settings from the database first.
            $setting_value = Notifima()->setting->get_setting( $setting_key, $default_value );

            // Handle arrays separately.
            if ( is_array( $setting_value ) ) {
                $form_settings[ $setting_key ] = $setting_value;
            } else {
                // Register string using WPML's icl_register_string function if available.
                if ( function_exists( 'icl_register_string' ) ) {
                    icl_register_string( 'notifima', $setting_key, $setting_value );
                }

                // Translate string if WPML is active.
                if ( function_exists( 'icl_t' ) ) {
                    $setting_value = icl_t( 'notifima', $setting_key, $setting_value );
                }

                // Store the processed string value.
                $form_settings[ $setting_key ] = $setting_value;
            }
        }

        return $form_settings;
    }
    /**
     * Check pro plugin is active or not.
     *
     * @return bool
     */
    public static function is_khali_dabba() {
        // return apply_filters( 'kothay_dabba', true );
        return true;
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
        $theme_template = get_stylesheet_directory() . '/woocommerce-product-stock-alert/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template.
        $located = file_exists( $theme_template ) ? $theme_template : Notifima()->plugin_path . 'templates/' . $template_name;

        // Load the template.
        load_template( $located, false, $args );
    }
}
