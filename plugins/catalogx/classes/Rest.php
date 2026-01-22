<?php
/**
 * Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX;

use CatalogX\Enquiry\Module as EnquiryModule;
use CatalogX\Quote\Module as QuoteModule;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Rest class
 *
 * @class       Rest class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Rest {
    /**
     * Rest class constructor function
     */
    public function __construct() {
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'rest_api_init', array( $this, 'register_rest_apis' ) );
        }
    }

    /**
     * Register rest api
     *
     * @return void
     */
    public function register_rest_apis() {

        register_rest_route(
            CatalogX()->rest_namespace,
            '/settings',
            array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'set_settings' ),
				'permission_callback' => array( $this, 'catalogx_permission' ),
			)
        );

        // enable/disable the module.
        register_rest_route(
            CatalogX()->rest_namespace,
            '/modules',
            array(
                array(
                    'methods'             => 'POST',
                    'callback'            => array( $this, 'set_modules' ),
                    'permission_callback' => array( $this, 'catalogx_permission' ),
                ),
                array(
                    'methods'             => 'GET',
                    'callback'            => array( $this, 'get_modules' ),
                    'permission_callback' => array( $this, 'catalogx_permission' ),
                ),
            )
        );

        register_rest_route(
            CatalogX()->rest_namespace,
            '/tour',
            array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_tour' ),
					'permission_callback' => array( $this, 'catalogx_permission' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'set_tour' ),
					'permission_callback' => array( $this, 'catalogx_permission' ),
				),
			)
        );

        register_rest_route(
            CatalogX()->rest_namespace,
            '/buttons',
            array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_buttons' ),
				'permission_callback' => array( $this, 'catalogx_permission' ),
			)
        );
    }

    /**
     * Get tour status
     *
     * @return \WP_Error|\WP_REST_Response
     */
    public function get_tour() {
        $status = CatalogX()->setting->get_option( 'catalogx_tour_active', false );
        return array( 'active' => $status );
    }

    /**
     * Set tour status
     *
     * Active boolean required
     * Catalogx tour active or not
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_Error|\WP_REST_Response
     */
    public function set_tour( $request ) {
        update_option( 'catalogx_tour_active', $request->get_param( 'active' ) );
        return array( 'success' => true );
    }

    /**
     * Save global settings
     *
     * Setting array required
     * All the settings of a particular id
     * SettingName string required
     * Give the setting id
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_Error|\WP_REST_Response
     */
    public function set_settings( $request ) {
        $all_details       = array();
        $get_settings_data = $request->get_param( 'setting' );
        $settingsname      = $request->get_param( 'settingName' );
        $settingsname      = str_replace( '-', '_', 'catalogx_' . $settingsname . '_settings' );

        // save the settings in database.
        CatalogX()->setting->update_option( $settingsname, $get_settings_data );

        do_action( 'catalogx_settings_after_save', $settingsname, $get_settings_data );

        $all_details['error'] = __( 'Settings Saved', 'catalogx' );

        // setup wizard settings.
        $action = $request->get_param( 'action' );

        if ( 'enquiry' === $action ) {
            $display_option = $request->get_param( 'displayOption' );
            $restrict_user  = $request->get_param( 'restrictUserEnquiry' );
            CatalogX()->setting->update_setting( 'is_disable_popup', $display_option, 'catalogx_all_settings_settings' );
            CatalogX()->setting->update_setting( 'enquiry_user_permission', $restrict_user, 'catalogx_all_settings_settings' );
        }

        if ( 'quote' === $action ) {
            $restrict_user = $request->get_param( 'restrictUserQuote' );
            CatalogX()->setting->update_setting( 'quote_user_permission', $restrict_user, 'catalogx_all_settings_settings' );
        }

        return rest_ensure_response( $all_details );
    }

    /**
     * Manage module setting. Active or Deactive modules.
     *
     * Id string required
     * Give the module id
     * Action string required
     * Give the action that is activate or deactivate
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return void
     */
    public function set_modules( $request ) {
        $module_id = $request->get_param( 'id' );
        $action    = $request->get_param( 'action' );

        // Setup wizard module.
        $modules = $request->get_param( 'modules' );
        if ( is_array( $modules ) ) {
            CatalogX()->modules->activate_modules( $modules );
        }
        // Handle the actions.
        switch ( $action ) {
            case 'activate':
                CatalogX()->modules->activate_modules( array( $module_id ) );
                break;

            default:
                CatalogX()->modules->deactivate_modules( array( $module_id ) );
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

    /**
     * Get the enquiry or quote button markup.
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_REST_Response The HTML response.
     */
    public function get_buttons( $request ) {
        $product_id  = $request->get_param( 'product_id' );
        $button_type = $request->get_param( 'button_type' );

        // Start output buffering.
        ob_start();

        if ( 'enquiry' === $button_type ) {
            EnquiryModule::init()->frontend->add_enquiry_button( intval( $product_id ) );
        }

        if ( 'quote' === $button_type ) {
            QuoteModule::init()->frontend->add_button_for_quote( intval( $product_id ) );
        }

        do_action( 'catalogx_get_buttons', $button_type, $product_id );

        // Return the output.
        return rest_ensure_response( array( 'html' => ob_get_clean() ) );
    }

    /**
     * Catalog rest api permission functions
     *
     * @return bool
     */
    public function catalogx_permission() {
        return current_user_can( 'manage_options' );
    }
}
