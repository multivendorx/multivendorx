<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class Utill {

    /**
     * Function to console and debug errors.
     */
    public static function log( $str ) {
        $file = Notifima()->plugin_path . 'log/notifima.log';

        if ( file_exists( $file ) ) {
            // Open the file to get existing content
            $str = var_export( $str, true );

            // Wp_remote_gate replacement required
            $current = file_get_contents( $file );

            if ( $current ) {
                // Append a new content to the file
                $current .= "$str" . "\r\n";
                $current .= "-------------------------------------\r\n";
            } else {
                $current  = "$str" . "\r\n";
                $current .= "-------------------------------------\r\n";
            }

            // Write the contents back to the file
            file_put_contents( $file, $current );
        }
    }

    /**
     * Get the settings arry. Non set value is replaced with default value.
     *
     * @return array
     */
    public static function get_form_settings_array() {
        // Initialize the settings keys with default values
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
            // Overwrite with actual settings from the database first
            $setting_value = Notifima()->setting->get_setting( $setting_key, $default_value );

            // Handle arrays separately
            if ( is_array( $setting_value ) ) {
                $form_settings[ $setting_key ] = $setting_value;
            } else {
                // Register string using WPML's icl_register_string function if available
                if ( function_exists( 'icl_register_string' ) ) {
                    icl_register_string( 'notifima', $setting_key, $setting_value );
                }

                // Translate string if WPML is active
                if ( function_exists( 'icl_t' ) ) {
                    $setting_value = icl_t( 'notifima', $setting_key, $setting_value );
                }

                // Store the processed string value
                $form_settings[ $setting_key ] = $setting_value;
            }
        }

        return $form_settings;
    }
    /**
     * Check pro plugin is acrive or not
     *
     * @return bool
     */
    public static function is_khali_dabba() {
        // if ( defined( 'NOTIFIMA_PRO_PLUGIN_VERSION' ) ) {
		// 	return Notifima_Pro()->license->is_active();
        // }
        // return false;
        return true;
    }

    /**
     * Get other templates ( e.g. product attributes ) passing attributes and including the file.
     *
     * @access public
     * @param  mixed $template_name
     * @param  array $args          ( default: array() )
     * @return void
     */
    public static function get_template( $template_name, $args = array() ) {

        if ( $args && is_array( $args ) ) {
            extract( $args );
        }

        // Check if the template exists in the theme
        $theme_template = get_stylesheet_directory() . '/woocommerce-product-stock-alert/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template
        $located = file_exists( $theme_template ) ? $theme_template : Notifima()->plugin_path . 'templates/' . $template_name;

        // Load the template
        load_template( $located, false, $args );
    }
}
