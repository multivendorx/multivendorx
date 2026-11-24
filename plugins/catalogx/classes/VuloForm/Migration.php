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
     * admin_init-triggered attempt -- just calls the same `ensure_form()` that `PreviewRest` calls
     * on demand, so a site gets its form migrated even if the admin never opens the Enquiry Form
     * settings tab. Sharing one method is what matters here, not which trigger runs it first: both
     * `admin_init` (this) and `rest_api_init` (PreviewRest, when the settings tab's preview panel
     * fetches) can plausibly fire first depending on the admin's own navigation, and whichever
     * does must reach the same decision -- migrate the legacy fields if there are any, otherwise
     * fall back to the starter template -- or whichever runs first "wins" with the wrong form and
     * the real migration never gets a second chance.
     *
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

        $this->ensure_form();
    }

    /**
     * The form to use: whichever is already configured, a site's legacy enquiry-form fields
     * migrated across, or -- if there's nothing to migrate -- a fresh one from the starter
     * template. Safe to call from multiple places (this class's own `admin_init` check and
     * `PreviewRest`'s on-demand preview) since it only ever creates a form when none is configured
     * yet.
     *
     * @return int 0 on failure.
     */
    public function ensure_form() {
        $form_id = (int) CatalogX()->setting->get_setting( 'vuloform_enquiry_form_id', 0 );

        if ( $form_id && vuloform_get_form( $form_id ) ) {
            return $form_id;
        }

        $old_fields = $this->old_fields();

        if ( $old_fields ) {
            $schema  = FieldMapper::schema( $old_fields, __( 'Send enquiry', 'catalogx' ), Templates::infrastructure_fields() );
            $form_id = (int) VuloForm()->forms->create( __( 'Enquiry form', 'catalogx' ), $schema, 'published' );
        } elseif ( class_exists( '\VuloForm\Forms\Templates' ) ) {
            $templates = \VuloForm\Forms\Templates::all();

            if ( isset( $templates[ Templates::TEMPLATE_ID ] ) ) {
                $form_id = (int) VuloForm()->forms->create(
                    $templates[ Templates::TEMPLATE_ID ]['title'],
                    $templates[ Templates::TEMPLATE_ID ]['schema'],
                    'published'
                );
            }
        } else {
            $form_id = 0;
        }

        if ( $form_id ) {
            CatalogX()->setting->update_setting(
                'vuloform_enquiry_form_id',
                $form_id,
                Utill::CATALOGX_SETTINGS['enquiry-form-customization']
            );
        }

        return $form_id;
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
