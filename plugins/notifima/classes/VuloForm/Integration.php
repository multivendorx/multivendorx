<?php
/**
 * Integration class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloForm;

use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloForm in as Notifima's subscription form builder, auto-creating the subscription
 * form from Notifima's starter template on first use, since there's no manual picker.
 *
 * No preview REST route here: the Subscription Form Designer settings tab (`zyra`'s
 * `FormPreview`) fetches the form's embed HTML straight from VuloForm's own public, cross-origin
 * `/public/forms/{id}/embed` endpoint -- the same one the frontend subscription form's
 * `VuloFormEmbed` already uses. This class is only responsible for resolving/auto-creating the
 * form id and the install-state check, both localized as plain values via
 * `get_admin_localize_data()` (`FrontendScripts::localize_scripts()`) rather than fetched.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new Installer();
        new Templates();

        add_filter( 'notifima_subscribe_form_localize_data', array( $this, 'localize_data' ) );
    }

    /**
     * @param array $data Data already localized to the `subscription` object.
     * @return array
     */
    public function localize_data( $data ) {
        $data['vuloform_form_id']        = (int) Notifima()->setting->get_setting( 'vuloform_subscription_form_id', 0 );
        $data['vuloform_rest_namespace'] = 'vuloform/v1';

        return $data;
    }

    /**
     * The install-state/form-id data the Subscription Form Designer settings tab's `FormPreview`
     * needs, localized into `appLocalizer` rather than fetched over REST.
     *
     * @return array {installed, plugin_url, can_activate, form_id}
     */
    public static function get_admin_localize_data() {
        // "Installed" (active) means VuloForm's classes autoload -- they only do while active.
        $installed = class_exists( '\VuloForm\VuloForm' );

        if ( $installed ) {
            return array(
                'installed'    => true,
                'plugin_url'   => '',
                'can_activate' => false,
                'form_id'      => self::resolve_form_id(),
            );
        }

        if ( ! function_exists( 'is_plugin_active' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $plugin_file   = 'vuloform/vuloform.php';
        $file_present  = file_exists( WP_PLUGIN_DIR . '/' . $plugin_file );

        return array(
            'installed'    => false,
            'plugin_url'   => $file_present
                ? wp_nonce_url( self_admin_url( 'plugins.php?action=activate&plugin=' . $plugin_file ), 'activate-plugin_' . $plugin_file )
                : admin_url( 'plugin-install.php?s=VuloForm&tab=search&type=term' ),
            'can_activate' => $file_present,
            'form_id'      => 0,
        );
    }

    /**
     * The form to use: the one already configured, or a freshly created one from the starter
     * template.
     *
     * @return int 0 on failure.
     */
    private static function resolve_form_id() {
        $stored_id = (int) Notifima()->setting->get_setting( 'vuloform_subscription_form_id', 0 );

        if ( $stored_id && vuloform_get_form( $stored_id ) ) {
            return $stored_id;
        }

        return self::create_default_form();
    }

    /**
     * @return int 0 when VuloForm's template classes aren't available or creation failed.
     */
    private static function create_default_form() {
        if ( ! class_exists( '\VuloForm\Forms\Templates' ) ) {
            return 0;
        }

        $templates = \VuloForm\Forms\Templates::all();

        if ( ! isset( $templates['notifima_back_in_stock'] ) ) {
            return 0;
        }

        $form_id = (int) VuloForm()->forms->create(
            $templates['notifima_back_in_stock']['title'],
            $templates['notifima_back_in_stock']['schema'],
            'published'
        );

        if ( $form_id ) {
            // Explicit option key -- Setting::get_option_key() can't find one for a key saved
            // for the first time.
            Notifima()->setting->update_setting(
                'vuloform_subscription_form_id',
                $form_id,
                Utill::NOTIFIMA_SETTINGS['subscription-form-designer']
            );
        }

        return $form_id;
    }
}
