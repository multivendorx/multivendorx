<?php
/**
 * MooWoodle REST API Settings controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle REST API Settings controller.
 *
 * @class       Settings class
 * @version     PRODUCT_VERSION
 * @author      MooWoodle
 */
class Settings extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'settings';

    /**
	 * Route base.
	 *
	 * @var string
	 */
	protected $modules_base = 'modules';

    /**
     * Register the routes for settings.
     */
    public function register_routes() {
        register_rest_route(
            MooWoodle()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );
    }

    /**
     * Check if a given request has access to update settings.
     *
     * @param object $request The REST request object.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) ;
    }

    /**
     * Update settings.
     *
     * @param object $request The REST request object.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MooWoodle()->util->log( $error );
            }

            return $error;
        }
        try {

            $all_details   = array();
            $settings_data = $request->get_param( 'setting' );
            $settingsname  = $request->get_param( 'settingName' );
            $settingsname  = str_replace( '-', '_', 'moowoodle_' . $settingsname . '_settings' );

            // save the settings in database.
            MooWoodle()->setting->update_option( $settingsname, $settings_data );

            /**
             * Moodle after setting save.
             *
             * @var $settingsname settingname.
             * @var $settingdata settingdata.
             */
            do_action( 'moowoodle_after_setting_save', $settingsname, $settings_data );

            $all_details['error'] = __( 'Settings Saved', 'moowoodle' );

            return $all_details;
        } catch ( \Exception $e ) {
            MooWoodle()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'moowoodle' ), array( 'status' => 500 ) );
        }
    }
}
