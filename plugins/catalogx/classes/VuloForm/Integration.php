<?php
/**
 * Integration class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloForm in as the enquiry form builder, for every CatalogX site.
 *
 * No preview REST route here: the Enquiry form settings tab (`zyra`'s `FormPreview`) fetches the
 * form's embed HTML straight from VuloForm's own public, cross-origin `/public/forms/{id}/embed`
 * endpoint. This class is only responsible for resolving/auto-creating the form id (via
 * `Migration::ensure_form()`, so a legacy-field migration or a freshly created starter-template
 * form is reused rather than duplicated here) and the install-state check, both localized as
 * plain values via `get_admin_localize_data()` rather than fetched.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new Installer();
        new Templates();
        new SubmissionBridge();
        new Migration();
    }

    /**
     * The install-state/form-id data the Enquiry form settings tab's `FormPreview` needs,
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
                'form_id'      => ( new Migration() )->ensure_form(),
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
}
