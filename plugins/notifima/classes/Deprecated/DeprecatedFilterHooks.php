<?php
/**
 * DeprecatedFilterHooks class file.
 *
 * @package Notifima
 */

namespace Notifima\Deprecated;

/**
 * Deprecated action hooks
 *
 * @package Notifima
 */

defined( 'ABSPATH' ) || exit;

/**
 * Handles deprecation notices and triggering of legacy action hooks.
 */
class DeprecatedFilterHooks extends \WC_Deprecated_Hooks {

    /**
     * Array of deprecated hooks we need to handle.
     * Format of 'new' => 'old'.
     *
     * @var array
     */
    protected $deprecated_hooks = array(
        'woo_product_stock_alert_do_complete_additional_task' => 'dc_wc_product_stock_alert_do_complete_additional_task',
        'woo_product_stock_alert_add_vendor'            => 'dc_wc_product_stock_alert_add_vendor',
        'woocommerce_email_subject_stock_manager'       => 'woocommerce_email_subject_stock_alert',
        'woocommerce_email_heading_stock_manager'       => 'woocommerce_email_heading_stock_alert',
        'woo_stock_manager_product_data'                => 'woo_stock_alert_product_data',
        'woo_stock_manager_subscribers_list_headers'    => 'woo_stock_alert_subscribers_list_headers',
        'woo_stock_manager_pro_settings_lists'          => 'woocommerce_stock_alert_pro_settings_lists',
        'woo_stock_manager_pro_active'                  => 'woo_stock_alert_pro_active',
        'woo_stock_manager_settings'                    => 'stockalert_settings',
        'is_stock_manager_pro_inactive'                 => 'is_stock_alert_pro_inactive',
        'notifima_admin_localize_scripts'               => 'stock_manager_settings',
        'stock_manager_do_complete_additional_task'     => 'woo_stock_manager_do_complete_additional_task',
        'stock_manager_is_accept_email_address'         => 'woo_stock_manager_is_accept_email_address',
        'stock_manager_new_subscriber_added'            => 'woo_stock_manager_new_subscriber_added',
        'stock_manager_accept_email'                    => 'woo_stock_manager_accept_email',
        'notifima_subscription_form_additional_fields'  => 'woocommerce_product_stock_alert_form_additional_fields',
        'notifima_recaptcha_enabled'                    => 'woo_stock_manager_recaptcha_enabled',
        'notifima_subscription_form_fields_separator'   => 'woo_fileds_separator',
        'notifima_add_fields_in_subscription_form'      => 'woo_stock_manager_fileds_array',
        'notifima_display_product_lead_time'            => 'stock_manager_display_product_lead_time',
        'notifima_register_settings_keys'               => 'stockmanager_register_settings_keys',
        'notifima_add_vendor_email_in_subscriber_email' => 'woo_stock_manager_add_vendor',
        'notifima_product_types_in_subscribers'         => 'stock_manager_product_types',
        'notifima_all_subscribers_list'                 => 'stock_alert_subscribers_list_data',
    );

    /**
     * Array of versions on each hook has been deprecated.
     *
     * @var array
     */
    protected $deprecated_version = array(
        'dc_wc_product_stock_alert_add_vendor'             => '2.0.0',
        'dc_wc_product_stock_alert_do_complete_additional_task' => '2.0.0',
        'woocommerce_email_subject_stock_alert'            => '2.4.0',
        'woocommerce_email_heading_stock_alert'            => '2.4.0',
        'is_stock_alert_pro_inactive'                      => '2.4.0',
        'woo_stock_alert_product_data'                     => '2.4.0',
        'woo_product_stock_alert_add_vendor'               => '2.4.0',
        'woocommerce_product_stock_alert_form_additional_fields' => '2.4.0',
        'woo_stock_alert_recaptcha_enableed'               => '2.4.0',
        'woo_stock_alert_fileds_array'                     => '2.4.0',
        'woo_product_stock_alert_do_complete_additional_task' => '2.4.0',
        'woo_stock_alert_is_accept_email_address'          => '2.4.0',
        'woo_product_stock_alert_new_subscriber_added'     => '2.4.0',
        'woo_product_stock_alert_accept_email'             => '2.4.0',
        'woo_stock_alert_subscribers_list_headers'         => '2.4.0',
        'woocommerce_stock_alert_pro_settings_lists'       => '2.4.0',
        'woo_stock_alert_pro_active'                       => '2.4.0',
        'stockalert_settings'                              => '2.4.0',
        'woo_stock_manager_fileds_array'                   => '2.4.2',
        'woo_fileds_separator'                             => '2.4.2',
        'woo_stock_manager_recaptcha_enabled'              => '2.4.2',
        'woo_stock_manager_do_complete_additional_task'    => '2.4.2',
        'woo_stock_manager_is_accept_email_address'        => '2.4.2',
        'woo_stock_manager_new_subscriber_added'           => '2.4.2',
        'woo_stock_manager_accept_email'                   => '2.4.2',
        'woo_stock_manager_subscribers_list_headers'       => '2.4.2',
        'woo_stock_manager_pro_settings_lists'             => '2.4.2',
        'woo_stock_manager_add_vendor'                     => '2.4.2',
        'product_backin_stock_send_admin'                  => '2.4.2',
        'is_stock_manager_pro_inactive'                    => '2.5.17',
        'stock_manager_settings'                           => '2.5.17',
        'stock_manager_do_complete_additional_task'        => '2.5.17',
        'stock_manager_is_accept_email_address'            => '2.5.17',
        'stock_manager_new_subscriber_added'               => '2.5.17',
        'stock_manager_accept_email'                       => '2.5.17',
        'woocommerce_stock_manager_form_additional_fields' => '2.5.17',
        'stock_manager_recaptcha_enabled'                  => '2.5.17',
        'stock_manager_form_fileds_separator'              => '2.5.17',
        'stock_manager_fileds_array'                       => '2.5.17',
        'stock_manager_display_product_lead_time'          => '2.5.17',
        'stockmanager_register_settings_keys'              => '2.5.17',
        'stock_manager_add_vendor'                         => '2.5.17',
        'stock_manager_product_types'                      => '2.5.17',
        'stock_alert_subscribers_list_data'                => '2.5.17',

    );

    /**
     * Hook into the new hook so we can handle deprecated hooks once fired.
     *
     * @param string $hook_name Hook name.
     */
    public function hook_in( $hook_name ) {
        add_filter( $hook_name, array( $this, 'maybe_handle_deprecated_hook' ), -1000, 8 );
    }

    /**
     * If the old hook is in-use, trigger it.
     *
     * @param  string $new_hook          New hook name.
     * @param  string $old_hook          Old hook name.
     * @param  array  $new_callback_args New callback args.
     * @param  mixed  $return_value      Returned value.
     * @return mixed
     */
    public function handle_deprecated_hook( $new_hook, $old_hook, $new_callback_args, $return_value ) {
        if ( has_filter( $old_hook ) ) {
            $this->display_notice( $old_hook, $new_hook );
            $return_value = $this->trigger_hook( $old_hook, $new_callback_args );
        }

        return $return_value;
    }

    /**
     * Fire off a legacy hook with it's args.
     *
     * @param  string $old_hook          Old hook name.
     * @param  array  $new_callback_args New callback args.
     * @return mixed
     */
    protected function trigger_hook( $old_hook, $new_callback_args ) {
        return apply_filters_ref_array( $old_hook, $new_callback_args );
    }
}
