<?php
/**
 * MooWoodle REST API Settings controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI\Controllers;

use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle REST API Settings controller.
 *
 * @version     3.4.0
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
     * @param \WP_REST_Request $request The REST request object.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Update settings.
     *
     * @param \WP_REST_Request $request The REST request object.
     */
    public function update_item( $request ) {
        $nonce_check = Util::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }
        try {
            $settings    = $request->get_param( 'setting' );
            $option_name = $request->get_param( 'settingName' );
            $option_name = str_replace( '-', '_', 'moowoodle_' . $option_name . '_settings' );

            // save the settings in database.
            MooWoodle()->setting->update_option( $option_name, $settings );

            /**
             * Moodle after setting save.
             *
             * @var $option_name option_name.
             * @var $settings settings.
             */
            do_action( 'moowoodle_after_setting_save', $option_name, $settings );

            return array(
                'message' => __( 'Settings saved.', 'moowoodle' ),
            );
        } catch ( \Exception $e ) {
			return Util::server_error( $e );
        }
    }
}
