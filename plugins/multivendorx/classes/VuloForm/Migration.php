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
     * Ensures a store registration form exists (creating one from the starter template if
     * there's none configured yet), and that whichever form ends up configured -- freshly
     * created here, or one that already existed from before `Templates::applicant_field()` was
     * added -- has the hidden applicant-id field `SubmissionBridge` depends on.
     *
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

        $form_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( ! $form_id ) {
            $form_id = $this->create_default_form();
        }

        if ( $form_id ) {
            $this->ensure_applicant_field( $form_id );
        }
    }

    /**
     * @return int 0 on failure.
     */
    private function create_default_form() {
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
    private function ensure_applicant_field( $form_id ) {
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
