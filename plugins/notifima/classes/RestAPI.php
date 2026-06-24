<?php
/**
 * RESTAPI class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima RestAPI class
 *
 * @class       RestAPI class
 * @version     3.0.0
 * @author      MultiVendorX
 */
class RestAPI {

    /**
     * RestAPI constructor.
     */
    public function __construct() {
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
        }
    }

    /**
     * Rest api register function call on rest_api_init action hook.
     *
     * @return void
     */
    public function register_rest_api() {
        register_rest_route(
            Notifima()->rest_namespace,
            '/settings',
            array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_settings' ),
				'permission_callback' => array( $this, 'notifima_permission' ),
			)
        );

        register_rest_route(
            Notifima()->rest_namespace,
            '/stock-notification-form',
            array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_stock_notification_form' ),
				'permission_callback' => array( $this, 'notifima_permission' ),
			)
        );
    }

    /**
     * Notifima api permission function.
     *
     * @return bool
     */
    public function notifima_permission() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Save settings.
     *
     * @param \WP_REST_Request $request The REST request object.
     */
    public function save_settings( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }
        try {
            $get_settings_data = $request->get_param( 'setting' );
            $settingsname      = $request->get_param( 'settingName' );
            $settingsname      = str_replace( '-', '_', $settingsname );
            $optionname        = 'notifima_' . $settingsname . '_settings';

            // save the settings in database.
            Notifima()->setting->update_option( $optionname, $get_settings_data );

            do_action( 'notifima_after_save_settings', $settingsname, $get_settings_data );

            return array(
                'type'    => 'success',
                'message' => __( 'Settings Saved', 'notifima' ),
            );
        } catch ( \Exception $e ) {
			return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'notifima'),
                array('status' => 500)
            );
        }
    }

    /**
     * Get stock notification form
     *
     * @param \WP_REST_Request $request The REST request object.
     */
    public function get_stock_notification_form( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }
        try {
            $product_id = $request->get_param( 'product_id' );

            // Start output buffering.
            ob_start();

            Notifima()->frontend->display_product_subscription_form( intval( $product_id ) );

            // Return the output.
            return rest_ensure_response( array( 'html' => ob_get_clean() ) );
        } catch ( \Exception $e ) {
			return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'notifima'),
                array('status' => 500)
            );
        }
    }
}
