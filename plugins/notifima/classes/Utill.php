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

    public const NOTIFIMA_SETTINGS = array(
        'automation'                    => 'notifima_automation_settings',
        'subscription-form-designer'    => 'notifima_subscription_form_designer_settings',
        'customer-messages'             => 'notifima_customer_messages_settings',
        'notifications'                 => 'notifima_notifications_settings',
    );

    public const NOTIFIMA_PRODUCT_META = array(
        'subscribers'          => 'no_of_subscribers',
        'product_discontinued' => 'product_discontinued',
    );

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
        return apply_filters( 'kothay_dabba_notifima', false );
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

    /**
     * Generic REST API capability check, shared by every controller/route's
     * `permission_callback` in this plugin (and notifima-pro's, which
     * already depend on this class for `validate_nonce()`/`Subscriber`)
     * instead of each one re-checking `current_user_can()` (and shaping its
     * own error response) separately.
     *
     * Grants access when the current user has at least one of the given
     * capabilities; otherwise returns a `WP_Error` with the correct 401
     * (not logged in) or 403 (logged in, but lacking the capability) status.
     *
     * @param string|array $capabilities One capability, or an array of capabilities - access is granted if the current user has any one of them.
     * @return true|\WP_Error
     */
    public static function current_user_has_capability( $capabilities, $context = '' ) {
        $capabilities = apply_filters( 'notifima_permissions_check', $capabilities, $context );
        foreach ( (array) $capabilities as $capability ) {
            if ( current_user_can( $capability ) ) { // phpcs:ignore WordPress.WP.Capabilities.Unknown
                return true;
            }
        }

        return new \WP_Error(
            'notifima_rest_forbidden',
            __( 'You are not allowed to perform this action.', 'notifima' ),
            array( 'status' => is_user_logged_in() ? 403 : 401 )
        );
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
                esc_html__( 'Invalid nonce.', 'notifima' ),
                array( 'status' => 403 )
            );

            self::log( $error );

            return $error;
        }

        return true;
    }

    /**
	 * Get subscriber details based on filter options.
	 *
	 * Filters supported in $args:
	 * - count, product_ids, email, status, startdate, enddate
	 * - condition (AND/OR), limit, offset
	 *
	 * @param array $args Filter options.
	 * @return array List of matching subscribers.
	 */
    public static function get_subscribers( $args ) {
        global $wpdb;

        $where        = array();
        $limit_clause = '';
        $table        = $wpdb->prefix . 'notifima_subscribers';

        if ( isset( $args['product_ids'] ) ) {
            $where[] = empty( $args['product_ids'] ) ? '0 = 1' : 'product_id IN (' . implode( ',', array_map( 'absint', $args['product_ids'] ) ) . ')';
        }

        if ( ! empty( $args['email'] ) ) {
            $where[] = $wpdb->prepare( 'email LIKE %s', '%' . $wpdb->esc_like( $args['email'] ) . '%' ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        }

        if ( ! empty( $args['status'] ) && 'all' !== $args['status'] ) {
            $where[] = $wpdb->prepare( 'status = %s', $args['status'] ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        }

        if ( ! empty( $args['start_date'] ) && ! empty( $args['end_date'] ) ) {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $where[] = $wpdb->prepare(
                'create_time BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)',
                $args['start_date'],
                $args['end_date']
            );
        }

        if ( isset( $args['limit'], $args['offset'] ) ) {
            $limit        = intval( $args['limit'] );
            $offset       = intval( $args['offset'] );
            $limit_clause = "LIMIT $limit OFFSET $offset";
        }

        $where_sql = ! empty( $where ) ? 'WHERE ' . implode( ' AND ', $where ) : '';

        if ( ! empty( $args['count'] ) ) {
            $query = "SELECT COUNT(*) FROM $table $where_sql";

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            return (int) $wpdb->get_var( $query );
        }

        $query = "SELECT * FROM $table $where_sql $limit_clause";

        return $wpdb->get_results( $query ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
    }

    /**
     * Function to check wheather mvx is active or not
     *
     * @return bool
     */
    public static function is_multivendorx_active() {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        return is_plugin_active( 'dc-woocommerce-multi-vendor/dc_product_vendor.php' );
    }
}
