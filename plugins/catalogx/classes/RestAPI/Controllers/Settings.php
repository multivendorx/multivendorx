<?php
/**
 * CatalogX REST API Settings controller.
 *
 * @package CatalogX
 */

namespace CatalogX\RestAPI\Controllers;

use CatalogX\Modules;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX REST API Settings controller.
 *
 * @class       Settings
 * @version     6.0.0
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
	 * Modules route base.
	 *
	 * @var string
	 */
	protected $modules_base = 'modules';

	/**
	 * Register routes.
	 *
	 * @return void
	 */
	public function register_routes() {

		register_rest_route(
			CatalogX()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
		);

		// Enable / Disable modules.
		register_rest_route(
			CatalogX()->rest_namespace,
			'/' . $this->modules_base,
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'set_modules' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_modules' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Permission check for updating settings.
	 *
	 * @param object $request Request object.
	 *
	 * @return bool
	 */
	public function update_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Permission check for getting modules.
	 *
	 * @param object $request Request object.
	 *
	 * @return bool
	 */
	public function get_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Update settings.
	 *
	 * @param object $request Request object.
	 *
	 * @return array|\WP_Error
	 */
	public function update_item( $request ) {

		$nonce = $request->get_header( 'X-WP-Nonce' );

		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			$error = new \WP_Error(
				'invalid_nonce',
				esc_html__( 'Invalid nonce.', 'catalogx' ),
                array( 'status' => 403 )
			);

			if ( is_wp_error( $error ) ) {
				CatalogX()->util->log( $error );
			}

			return $error;
		}

		try {
			$get_settings_data = $request->get_param( 'setting' );
            $settingsname      = $request->get_param( 'settingName' );
            $settingsname      = str_replace( '-', '_', $settingsname );
            $optionname        = 'catalogx_' . $settingsname . '_settings';

			// Save settings.
			CatalogX()->setting->update_option(
				$optionname,
				$get_settings_data
			);

			do_action(
				'catalogx_settings_after_save',
				$settingsname,
				$get_settings_data
			);

			// Setup wizard settings.
			$action = $request->get_param( 'action' );

			if ( 'enquiry' === $action ) {
				$display_option = $request->get_param( 'displayOption' );

				$restrict_user = $request->get_param(
					'restrictUserEnquiry'
				);

				CatalogX()->setting->update_setting(
					'is_disable_popup',
					$display_option,
					'catalogx_shopping_settings_settings'
				);

				CatalogX()->setting->update_setting(
					'enquiry_user_permission',
					$restrict_user,
					'catalogx_shopping_settings_settings'
				);
			}

			if ( 'quote' === $action ) {
				$restrict_user = $request->get_param(
					'restrictUserQuote'
				);

				CatalogX()->setting->update_setting(
					'quote_user_permission',
					$restrict_user,
					'catalogx_shopping_settings_settings'
				);
			}

			return array(
				'type'    => 'success',
				'message' => __( 'Settings Saved', 'catalogx' ),
			);
		} catch ( \Exception $e ) {
			CatalogX()->util->log( $e );

			return new \WP_Error(
				'server_error',
				__( 'Unexpected server error', 'catalogx' ),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Manage modules.
	 *
	 * @param object $request Request object.
	 *
	 * @return array|\WP_Error
	 */
	public function set_modules( $request ) {

		$nonce = $request->get_header( 'X-WP-Nonce' );

		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			$error = new \WP_Error(
				'invalid_nonce',
				esc_html__( 'Invalid nonce.', 'catalogx' ),
                array( 'status' => 403 )
			);

			if ( is_wp_error( $error ) ) {
				CatalogX()->util->log( $error );
			}

			return $error;
		}

		try {
			$module_id = $request->get_param( 'id' );

			$action = $request->get_param( 'action' );

			// Setup wizard modules.
			$modules = $request->get_param( 'modules' );

			if ( is_array( $modules ) ) {
				CatalogX()->modules->activate_modules( $modules );
			}

			// Handle action.
			switch ( $action ) {
				case 'activate':
					CatalogX()->modules->activate_modules(
						array( $module_id )
					);
					break;

				default:
					CatalogX()->modules->deactivate_modules(
						array( $module_id )
					);
					break;
			}

			return array(
				'success' => true,
			);
		} catch ( \Exception $e ) {
			CatalogX()->util->log( $e );

			return new \WP_Error(
				'server_error',
				__( 'Unexpected server error', 'catalogx' ),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Get active modules.
	 *
	 * @return array
	 */
	public function get_modules() {

		$modules_instance = new Modules();

		return $modules_instance->get_active_modules();
	}
}
