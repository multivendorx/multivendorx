<?php
/**
 * Migration class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloForm;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * One-time migration of the old block-builder enquiry form fields into a VuloForm form, so a
 * site that already customized its enquiry form keeps those fields instead of starting over
 * from the starter template.
 */
class Migration {

    const MIGRATED_OPTION = 'catalogx_vuloform_enquiry_migrated';

    /**
     * Migration constructor.
     */
    public function __construct() {
        add_action( 'admin_init', array( $this, 'maybe_migrate' ) );
    }

    /**
     * @return void
     */
    public function maybe_migrate() {
        if ( get_option( self::MIGRATED_OPTION ) ) {
            return;
        }

        if ( ! class_exists( '\VuloForm\VuloForm' ) || ! function_exists( 'vuloform_render' ) ) {
            return;
        }

        // Only ever attempted once.
        update_option( self::MIGRATED_OPTION, time() );

        // Already has a configured form -- nothing from the legacy builder to bring across.
        if ( (int) CatalogX()->setting->get_setting( 'vuloform_enquiry_form_id', 0 ) ) {
            return;
        }

        $old_fields = $this->old_fields();

        if ( ! $old_fields ) {
            return;
        }

        $schema  = FieldMapper::schema( $old_fields, __( 'Send enquiry', 'catalogx' ) );
        $form_id = (int) VuloForm()->forms->create( __( 'Enquiry form', 'catalogx' ), $schema, 'published' );

        if ( $form_id ) {
            CatalogX()->setting->update_setting(
                'vuloform_enquiry_form_id',
                $form_id,
                Utill::CATALOGX_SETTINGS['enquiry-form-customization']
            );
        }
    }

    /**
     * @return array
     */
    private function old_fields() {
        $settings = CatalogX()->setting->get_option( Utill::CATALOGX_SETTINGS['enquiry-form-customization'], array() );
        $fields   = $settings['enquiry_form_tabs']['enquiry_form_builder']['formfieldlist'] ?? array();

        return is_array( $fields ) ? $fields : array();
    }
}
