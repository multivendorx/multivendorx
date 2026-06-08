<?php
/**
 * CatalogX REST API Settings controller.
 *
 * @package CatalogX
 */

namespace CatalogX\RestAPI\Controllers;

use CatalogX\Modules;
use CatalogX\Utill;

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
					'callback'            => array( $this, 'update_modules' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_active_modules' ),
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

        $nonce_validation = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_validation ) ) {
            return $nonce_validation;
        }

		try {
			$settings_values = $request->get_param( 'setting' );
            $settings_name   = $request->get_param( 'settingName' );
            $settings_name   = str_replace( '-', '_', $settings_name );
            $option_name     = 'catalogx_' . $settings_name . '_settings';

			// Save settings.
			CatalogX()->setting->update_option(
				$option_name,
				$settings_values
			);

			do_action(
				'catalogx_settings_after_save',
				$settings_name,
				$settings_values
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
	public function update_modules( $request ) {

        $nonce_validation = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_validation ) ) {
            return $nonce_validation;
        }

		try {
			$module_id = $request->get_param( 'id' );

			$action = $request->get_param( 'action' );

			// Setup wizard modules.
			$module_list = $request->get_param( 'modules' );

			if ( is_array( $module_list ) ) {
				CatalogX()->modules->activate_modules( $module_list );
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
	public function get_active_modules() {

		$modules_instance = new Modules();

		return $modules_instance->get_active_modules();
	}
}
