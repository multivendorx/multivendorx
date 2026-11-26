<?php
/**
 * Migration class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations\VuloForm;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Creates the store registration form in VuloForm the first time, from the starter template --
 * since a site might already have fields saved in the old `store_registration_from` block-
 * builder setting, this doesn't touch that option; the admin can rebuild/adjust fields inside
 * VuloForm's own editor afterward. `maybe_migrate()` is version-gated from `Install.php`'s
 * `do_migration()`; `ensure_form()` is also called on demand from the sibling
 * `Integration::get_admin_localize_data()`.
 */
class Migration {

    const MIGRATED_OPTION = 'multivendorx_vuloform_store_registration_migrated';

    /**
     * Run once per site (version-gated from `Install.php`'s `do_migration()`). Calls the same
     * `ensure_form()` that `Integration::get_admin_localize_data()` calls on demand, so the form
     * still exists even if the admin never opens the Registration settings tab.
     *
     * @return void
     */
    public static function maybe_migrate() {
        if ( get_option( self::MIGRATED_OPTION ) ) {
            return;
        }

        if ( ! class_exists( '\VuloForm\VuloForm' ) || ! function_exists( 'vuloform_render' ) ) {
            return;
        }

        // Only ever attempted once.
        update_option( self::MIGRATED_OPTION, time() );

        self::ensure_form();
    }

    /**
     * Ensures a store registration form exists (creating one from the starter template if
     * there's none configured yet), and that whichever form ends up configured -- freshly
     * created here, or one that already existed from before `Templates::applicant_field()` was
     * added -- has the hidden applicant-id field `Integration::maybe_register_store()` depends on.
     *
     * @return int 0 on failure.
     */
    public static function ensure_form() {
        $form_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( ! $form_id || ! vuloform_get_form( $form_id ) ) {
            $form_id = self::create_default_form();
        }

        if ( $form_id ) {
            self::ensure_applicant_field( $form_id );
        }

        return $form_id;
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

    /**
     * @param int $form_id Form to check/patch.
     * @return void
     */
    private static function ensure_applicant_field( $form_id ) {
        $form = VuloForm()->forms->get( $form_id );

        if ( ! $form ) {
            return;
        }

        $fields = $form['schema']['fields'] ?? array();

        foreach ( $fields as $field ) {
            if ( isset( $field['key'] ) && Templates::APPLICANT_FIELD_KEY === $field['key'] ) {
                return;
            }
        }

        $fields[]                 = Templates::applicant_field();
        $form['schema']['fields'] = $fields;

        VuloForm()->forms->update( $form_id, array( 'schema' => $form['schema'] ) );
    }
}
