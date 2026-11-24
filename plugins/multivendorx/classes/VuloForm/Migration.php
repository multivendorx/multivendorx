<?php
/**
 * Migration class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\VuloForm;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Creates the store registration form in VuloForm the first time, from the starter template --
 * since a site might already have fields saved in the old `store_registration_from` block-
 * builder setting, this doesn't touch that option; the admin can rebuild/adjust fields inside
 * VuloForm's own editor afterward.
 */
class Migration {

    const MIGRATED_OPTION = 'multivendorx_vuloform_store_registration_migrated';

    /**
     * Migration constructor.
     */
    public function __construct() {
        add_action( 'admin_init', array( $this, 'maybe_create_default_form' ) );
    }

    /**
     * @return void
     */
    public function maybe_create_default_form() {
        if ( get_option( self::MIGRATED_OPTION ) ) {
            return;
        }

        if ( ! class_exists( '\VuloForm\VuloForm' ) || ! function_exists( 'vuloform_render' ) ) {
            return;
        }

        // Only ever attempted once.
        update_option( self::MIGRATED_OPTION, time() );

        // Already has a configured form -- nothing to do.
        if ( (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 ) ) {
            return;
        }

        if ( ! class_exists( '\VuloForm\Forms\Templates' ) ) {
            return;
        }

        $templates = \VuloForm\Forms\Templates::all();

        if ( ! isset( $templates[ Templates::TEMPLATE_ID ] ) ) {
            return;
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
    }
}
