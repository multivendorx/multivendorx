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
					'permission_callback' => array( $this, 'catalogx_permissions_check' ),
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
					'permission_callback' => array( $this, 'catalogx_permissions_check' ),
				),
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_active_modules' ),
					'permission_callback' => array( $this, 'catalogx_permissions_check' ),
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
	public function catalogx_permissions_check( $request ) {
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
			$setup_wizard = $request->get_param( 'setupWizard' );
			$value        = $request->get_param( 'value' );

            if ( $setup_wizard && ! empty( $value ) ) {
				$customer_engagement = CatalogX()->setting->get_option( Utill::CATALOGX_SETTINGS['customer-engagement'] );

				if ( isset( $value['product_enquiry'] ) && is_array( $value['product_enquiry'] ) ) {
					$customer_engagement = array_merge( $customer_engagement, $value['product_enquiry'] );
				}

				if ( isset( $value['quotation_requests'] ) && is_array( $value['quotation_requests'] ) ) {
					$customer_engagement = array_merge( $customer_engagement, $value['quotation_requests'] );
				}

                CatalogX()->setting->update_option( Utill::CATALOGX_SETTINGS['customer-engagement'], $customer_engagement );

                return rest_ensure_response(
					array(
						'type'    => 'success',
						'message' => __( 'Settings Saved', 'catalogx' ),
					)
				);
            }

			$settings_values = $request->get_param( 'setting' );
            $settings_name   = $request->get_param( 'settingName' );
            $settings_name   = str_replace( '-', '_', $settings_name );
            $option_name     = 'catalogx_' . $settings_name . '_settings';

			// Save settings.
			CatalogX()->setting->update_option( $option_name, $settings_values );

			do_action( 'catalogx_settings_after_save', $settings_name, $settings_values );

			return rest_ensure_response(
				array(
					'type'    => 'success',
					'message' => __( 'Settings Saved', 'catalogx' ),
				)
			);
		} catch ( \Exception $e ) {
			Utill::server_error( $e );
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

			// Handle action.
			switch ( $action ) {
				case 'activate':
					CatalogX()->modules->activate_modules( array( $module_id ) );
					break;

				default:
					CatalogX()->modules->deactivate_modules( array( $module_id ) );
					break;
			}

			return array(
				'success' => true,
			);
		} catch ( \Exception $e ) {
			Utill::server_error( $e );
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
