<?php

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Modules;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Settings_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base    = 'settings';
	protected $modules_base = 'modules';

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
    }


    // POST permission
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }


    public function update_item( $request ) {
        $all_details       = array();
        $get_settings_data = $request->get_param( 'setting' );
        $settingsname      = $request->get_param( 'settingName' );
        $settingsname      = str_replace( '-', '_', $settingsname );
        $optionname        = 'multivendorx_' . $settingsname . '_settings';

        // save the settings in database.
        MultiVendorX()->setting->update_option( $optionname, $get_settings_data );

        do_action( 'multivendorx_after_save_settings', $settingsname, $get_settings_data );

        $all_details['error'] = __( 'Settings Saved', 'multivendorx' );

        if ($settingsname == 'store_capability') {
            $store_cap = MultiVendorX()->setting->get_option('multivendorx_store_capability_settings');
            $user_cap = MultiVendorX()->setting->get_option('multivendorx_user_capability_settings');
        
            $store_owner_caps = array();
            foreach ($store_cap as $caps) {
                $store_owner_caps = array_merge($store_owner_caps, $caps);
            }

            $store_owner_caps = array_unique($store_owner_caps);

            // Create store_owner entry
            $result = [
                'store_owner' => $store_owner_caps
            ];

            foreach ($user_cap as $role => $caps) {
                if ($role !== 'store_owner') {
                    $user_cap[$role] = array_values(array_intersect($caps, $store_owner_caps));
                }
            }

            MultiVendorX()->setting->update_option( 'multivendorx_user_capability_settings', array_merge($user_cap, $result) );
            
            $role = get_role( 'store_owner' );

            if ( $role ) {
                // Remove all existing caps
                foreach ( $role->capabilities as $cap => $grant ) {
                    $role->remove_cap( $cap );
                }

                // Add fresh caps
                foreach ( $store_owner_caps as $cap ) {
                    $role->add_cap( $cap, true );
                }
            }
        
        }

        return $all_details;
    }

    /**
     * Manage module setting. Active or Deactive modules.
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return void
     */
    public function set_modules( $request ) {
        $module_id = $request->get_param( 'id' );
        $action    = $request->get_param( 'action' );

        // Setup wizard module.
        $modules = $request->get_param( 'modules' ) ?? [];
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
