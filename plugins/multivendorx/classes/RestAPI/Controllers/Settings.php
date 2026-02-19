<?php
/**
 * MultiVendorX REST API Settings controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Modules;
use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Settings controller.
 *
 * @class       Settings class
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
	 * Route base.
	 *
	 * @var string
	 */
	protected $modules_base = 'modules';
	protected $dashboard_settings_base = 'dashboard-settings';

    /**
     * Register the routes for settings.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );
        // enable/disable the module.
        register_rest_route(
            MultiVendorX()->rest_namespace,
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
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->dashboard_settings_base,
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'set_settings' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );
    }

    public function set_settings( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $all_details       = array();
            $get_settings_data = $request->get_param( 'setting' );

            $store = new Store( MultiVendorX()->active_store );
            // Core fields update.
            $core_fields = array(
                Utill::STORE_SETTINGS_KEYS['name'],
                Utill::STORE_SETTINGS_KEYS['slug'],
                Utill::STORE_SETTINGS_KEYS['description'],
                Utill::STORE_SETTINGS_KEYS['status'],
                Utill::STORE_SETTINGS_KEYS['create_time'],
            );

            foreach ( $core_fields as $field ) {
                if ( array_key_exists( $field, $get_settings_data ) ) {
                    $store->set( $field, $get_settings_data[ $field ] );
                    unset( $get_settings_data[ $field ] );
                }
            }

            $store->set( Utill::STORE_SETTINGS_KEYS['who_created'], 'admin' );

            foreach ( $get_settings_data as $key => $value ) {
                
                $store->update_meta( $key, $value );

                if ( Utill::STORE_SETTINGS_KEYS['deactivation_reason'] === $key ) {
                    $store->update_meta(
                        Utill::STORE_SETTINGS_KEYS['deactivation_request_date'],
                        current_time( 'mysql' )
                    );
                }
            }

            $store->save();

            $all_details['error'] = __( 'Settings Saved', 'multivendorx' );


            return $all_details;
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Check if a given request has access to update settings.
     *
     * @param object $request The REST request object.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'edit_stores' );
    }

    /**
     * Update settings.
     *
     * @param object $request The REST request object.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $setupWizard = $request->get_param( 'setupWizard' );
            if ( $setupWizard ) {
                $value = $request->get_param( 'value' );
                if ( ! empty( $value ) ) {
                    $general_settings = array(
                        'approve_store'      => $value['store_setup']['approve_store'] ?? 'manually',
                        'store_selling_mode' => $value['marketplace_setup']['store_selling_mode'] ?? 'default',
                    );

                    $commission_type = $value['commission_setup']['commission_type'] ?? '';

                    $commission_settings = array(
                        'commission_type' => $commission_type,
                        'commission_per_' . $commission_type => array(
                            array(
                                'commission_fixed'      => $value['commission_setup']['commission_value'][0]['commission_fixed'] ?? '',
                                'commission_percentage' => $value['commission_setup']['commission_value'][0]['commission_percentage'] ?? '',
                            ),
                        ),
                    );

                    $disbursment_settings = array(
                        'disbursement_order_status' => $value['commission_setup']['disbursement_order_status'] ?? array( 'completed' ),
                    );

                    MultiVendorX()->setting->update_setting( Utill::MULTIVENDORX_SETTINGS['onboarding'], $general_settings );
                    MultiVendorX()->setting->update_setting( Utill::MULTIVENDORX_SETTINGS['commissions'], $commission_settings );
                    MultiVendorX()->setting->update_setting( Utill::MULTIVENDORX_SETTINGS['payouts'], $disbursment_settings );
                }

                return;
            }
            $all_details       = array();
            $get_settings_data = $request->get_param( 'setting' );
            $settingsname      = $request->get_param( 'settingName' );
            $settingsname      = str_replace( '-', '_', $settingsname );
            $optionname        = 'multivendorx_' . $settingsname . '_settings';

            // Save the settings in database.
            MultiVendorX()->setting->update_option( $optionname, $get_settings_data );

            do_action( 'multivendorx_after_save_settings', $settingsname, $get_settings_data );

            $all_details['error'] = __( 'Settings Saved', 'multivendorx' );

            if ( 'store_permissions' === $settingsname || 'user_permissions' === $settingsname ) {
                $store_cap = MultiVendorX()->setting->get_option( Utill::MULTIVENDORX_SETTINGS['store-permissions'] );
                $user_cap  = MultiVendorX()->setting->get_option( Utill::MULTIVENDORX_SETTINGS['user-permissions'] );

                $store_owner_caps = array();
                foreach ( $store_cap as $caps ) {
                    $store_owner_caps = array_merge( $store_owner_caps, $caps );
                }

                $store_owner_caps = array_unique( $store_owner_caps );

                // Create store_owner entry.
                $result = array(
                    'store_owner' => $store_owner_caps,
                );

                foreach ( $user_cap as $role => $caps ) {
                    if ( 'store_owner' !== $role ) {
                        $user_cap[ $role ] = array_values( array_intersect( $caps, $store_owner_caps ) );
                    }
                }

                MultiVendorX()->setting->update_option( Utill::MULTIVENDORX_SETTINGS['user-permissions'], array_merge( $user_cap, $result ) );

                $role = get_role( 'store_owner' );

                if ( $role ) {
                    // Remove all existing caps.
                    foreach ( $role->capabilities as $cap => $grant ) {
                        $role->remove_cap( $cap );
                    }

                    // Add fresh caps.
                    foreach ( $store_owner_caps as $cap ) {
                        $role->add_cap( $cap, true );
                    }
                }
            }

            if ( 'commissions' === $settingsname ) {
                if ( get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['revenue_mode_store'] ) ) {
                    delete_option( Utill::MULTIVENDORX_OTHER_SETTINGS['revenue_mode_store'] );
                }
            }

            return $all_details;
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Manage module setting. Active or Deactive modules.
     *
     * @param object $request The REST request object.
     */
    public function set_modules( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $module_id = $request->get_param( 'id' );
            $action    = $request->get_param( 'action' );

            // Setup wizard module.
            $modules = $request->get_param( 'modules' ) ?? array();
            MultiVendorX()->modules->activate_modules( $modules );

            // Handle the actions.
            switch ( $action ) {
                case 'activate':
                    MultiVendorX()->modules->activate_modules( array( $module_id ) );
                    break;

                default:
                    MultiVendorX()->modules->deactivate_modules( array( $module_id ) );
                    break;
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get the list of active CatalogX modules.
     *
     * @return array
     */
    public function get_modules() {
        $modules_instance = new Modules();
        return $modules_instance->get_active_modules();
    }
}
