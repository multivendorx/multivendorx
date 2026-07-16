<?php
/**
 * Notifima REST API Settings controller.
 *
 * @package Notifima
 */

namespace Notifima\RestAPI\Controllers;

use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima RestAPI settings class
 *
 * @class       RestAPI class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Settings extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'settings';

    /**
     * Register the routes for settings.
     */
    public function register_routes() {
        register_rest_route(
            Notifima()->rest_namespace,
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
     * @param \WP_REST_Request $request The REST request object.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Save settings.
     *
     * @param \WP_REST_Request $request The REST request object.
     */
    public function update_item( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }
        try {
            $settings     = $request->get_param( 'setting' );
            $settings_key = $request->get_param( 'settingName' );
            $settings_key = str_replace( '-', '_', $settings_key );
            $option_name  = 'notifima_' . $settings_key . '_settings';

            // save the settings in database.
            Notifima()->setting->update_option( $option_name, $settings );

            do_action( 'notifima_after_save_settings', $settings_key, $settings );

            return array(
                'type'    => 'success',
                'message' => __( 'Settings Saved', 'notifima' ),
            );
        } catch ( \Exception $e ) {
			return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'notifima' ),
                array( 'status' => 500 )
            );
        }
    }
}
