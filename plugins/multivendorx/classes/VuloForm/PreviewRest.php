<?php
/**
 * PreviewRest class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\VuloForm;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * No preview REST route here: the Registration settings tab (`zyra`'s `FormPreview`) fetches the
 * form's embed HTML straight from VuloForm's own public, cross-origin `/public/forms/{id}/embed`
 * endpoint. This class is only responsible for resolving/auto-creating the store registration
 * form id and the install-state check, both localized as plain values via
 * `get_admin_localize_data()` rather than fetched.
 */
class PreviewRest {

    /**
     * The install-state/form-id data the Registration settings tab's `FormPreview` needs,
     * localized into `appLocalizer` rather than fetched over REST.
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

        $plugin_file  = 'vuloform/vuloform.php';
        $file_present = file_exists( WP_PLUGIN_DIR . '/' . $plugin_file );

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
        $stored_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

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

        if ( ! isset( $templates[ Templates::TEMPLATE_ID ] ) ) {
            return 0;
        }

        $form_id = (int) VuloForm()->forms->create(
            $templates[ Templates::TEMPLATE_ID ]['title'],
            $templates[ Templates::TEMPLATE_ID ]['schema'],
            'published'
        );

        if ( $form_id ) {
            MultiVendorX()->setting->update_setting(
                'vuloform_store_registration_form_id',
                $form_id,
                Utill::MULTIVENDORX_SETTINGS['registration']
            );
        }

        return $form_id;
    }
}
