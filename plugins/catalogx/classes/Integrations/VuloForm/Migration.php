<?php
/**
 * Migration class file.
 *
 * @package CatalogX
 */

namespace CatalogX\Integrations\VuloForm;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * One-time migration of the old block-builder enquiry form fields into a VuloForm form, so a
 * site that already customized its enquiry form keeps those fields instead of starting over
 * from the starter template. Used by the sibling `Integration` class, which hooks
 * `maybe_migrate()` to `admin_init` and calls `ensure_form()` on demand from
 * `get_admin_localize_data()`.
 */
class Migration {

    const MIGRATED_OPTION = 'catalogx_vuloform_enquiry_migrated';

    /**
     * Old block-builder type => VuloForm field type.
     */
    const TYPE_MAP = array(
        'text'         => 'text',
        'email'        => 'email',
        'textarea'     => 'textarea',
        'phone'        => 'phone',
        'date'         => 'date',
        'time'         => 'time',
        'checkboxes'   => 'checkboxes',
        'multi-select' => 'checkboxes',
        'radio'        => 'radio',
        'dropdown'     => 'select',
        'attachment'   => 'file',
        'richtext'     => 'consent',
    );

    /**
     * Old field types that aren't a real form field. `custom-recaptcha` is the free-form's old
     * captcha toggle -- VuloForm's own recaptcha is a form-level setting, not a field, so there's
     * nothing meaningful to convert it to.
     */
    const SKIP_TYPES = array( 'button', 'title', 'section', 'recaptcha', 'custom-recaptcha' );

    /**
     * admin_init-triggered attempt -- just calls the same `ensure_form()` that
     * `Integrations\VuloForm\Integration::get_admin_localize_data()` calls on demand, so a site
     * gets its form migrated even if the admin never opens the Enquiry Form settings tab. Sharing
     * one method is what matters here, not which trigger runs it first: both `admin_init` (this)
     * and the settings tab's own `appLocalizer` resolution (the other caller) can plausibly fire
     * first depending on the admin's own navigation, and whichever does must reach the same
     * decision -- migrate the legacy fields if there are any, otherwise fall back to the starter
     * template -- or whichever runs first "wins" with the wrong form and the real migration
     * never gets a second chance.
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
     * The form to use: whichever is already configured, a site's legacy enquiry-form fields
     * migrated across, or -- if there's nothing to migrate -- a fresh one from the starter
     * template. Safe to call from multiple places (`maybe_migrate()`'s own `admin_init` check and
     * `Integrations\VuloForm\Integration::get_admin_localize_data()`'s on-demand resolution)
     * since it only ever creates a form when none is configured yet.
     *
     * @return int 0 on failure.
     */
    public static function ensure_form() {
        $form_id = (int) CatalogX()->setting->get_setting( 'vuloform_enquiry_form_id', 0 );

        if ( $form_id && vuloform_get_form( $form_id ) ) {
            return $form_id;
        }

        $old_fields = self::old_fields();

        if ( $old_fields ) {
            $schema  = self::schema_from_old_fields( $old_fields, __( 'Send enquiry', 'catalogx' ), Templates::infrastructure_fields() );
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
     * The real, free-tier-editable field list is `free_enquiry_form` -- toggled on/off per field
     * via the (now-retired) Settings UI, with phone/address/subject/comment/fileupload/captcha as
     * real possibilities alongside name/email. `enquiry_form_builder.formfieldlist` looks similar
     * but is CatalogX Pro's drag-and-drop builder: on a free-tier site it never moves from its
     * hardcoded name/email placeholder defaults (both `not_editable`), so reading it instead of
     * `free_enquiry_form` silently drops everything the site owner actually configured. Only fall
     * back to the builder list when there's truly nothing in the free form to migrate -- that
     * covers a Pro site whose owner only ever touched the builder.
     *
     * @return array
     */
    private static function old_fields() {
        $settings = CatalogX()->setting->get_option( Utill::CATALOGX_SETTINGS['enquiry-form-customization'], array() );
        $tabs     = $settings['enquiry_form_tabs'] ?? array();

        $free_fields = is_array( $tabs['free_enquiry_form'] ?? null ) ? $tabs['free_enquiry_form'] : array();

        $free_fields = array_values(
            array_filter(
                $free_fields,
                static function ( $field ) {
                    // 'filesize-limit' is a size-limit setting for the 'fileupload' field, not a
                    // field of its own -- VuloForm's 'file' field type has its own max_size_mb.
                    return empty( $field['disabled'] ) && 'filesize-limit' !== ( $field['name'] ?? '' );
                }
            )
        );

        if ( $free_fields ) {
            return $free_fields;
        }

        $builder_fields = $tabs['enquiry_form_builder']['formfieldlist'] ?? array();

        return is_array( $builder_fields ) ? $builder_fields : array();
    }

    /**
     * Maps the old block-builder field list shape ({id, type, label, required?, placeholder?,
     * name, options?}) to a VuloForm form schema. CatalogX Pro's wholesale migration
     * (`CatalogXPro\Integrations\VuloForm\Migration::schema_from_old_fields()`) keeps its own copy rather than
     * depending on this one across the PSR-4 plugin boundary.
     *
     * @param array  $old_fields   The old `formfieldlist` array.
     * @param string $submit_label Fallback submit button label (a 'button' entry overrides it).
     * @param array  $extra_fields Infrastructure fields (e.g. hidden `product_id`/`user_id`) the
     *                             caller's own starter template carries, appended as-is since the
     *                             legacy field list never had anything equivalent to convert.
     * @return array Sanitized VuloForm schema ({version, fields, settings}).
     */
    private static function schema_from_old_fields( array $old_fields, $submit_label, array $extra_fields = array() ) {
        $fields = array();

        foreach ( $old_fields as $old_field ) {
            $type = (string) ( $old_field['type'] ?? '' );

            if ( 'button' === $type ) {
                if ( ! empty( $old_field['label'] ) ) {
                    $submit_label = (string) $old_field['label'];
                }
                continue;
            }

            if ( in_array( $type, self::SKIP_TYPES, true ) ) {
                continue;
            }

            $fields[] = self::mapped_field( $old_field, $type );
        }

        foreach ( $extra_fields as $extra_field ) {
            $fields[] = $extra_field;
        }

        $settings                    = \VuloForm\Forms\Schema::default_settings();
        $settings['submit_label']    = $submit_label;
        $settings['notifications'][] = \VuloForm\Forms\Templates::admin_notification( 'email' );

        return \VuloForm\Forms\Schema::sanitize(
            array(
                'fields'   => $fields,
                'settings' => $settings,
            )
        );
    }

    /**
     * @param array  $old_field Old field.
     * @param string $type      Old field type.
     * @return array VuloForm field.
     */
    private static function mapped_field( array $old_field, $type ) {
        $field = array(
            'type'     => self::TYPE_MAP[ $type ] ?? 'text',
            'key'      => sanitize_key( (string) ( $old_field['name'] ?? $old_field['id'] ?? '' ) ),
            'label'    => (string) ( $old_field['label'] ?? '' ),
            'required' => ! empty( $old_field['required'] ),
        );

        if ( ! empty( $old_field['placeholder'] ) ) {
            $field['placeholder'] = (string) $old_field['placeholder'];
        }

        if ( 'richtext' === $type ) {
            $field['consent_text'] = (string) ( $old_field['label'] ?? '' );
        }

        if ( ! empty( $old_field['options'] ) && is_array( $old_field['options'] ) ) {
            $field['options'] = array_map(
                static function ( $option ) {
                    return array(
                        'label' => (string) ( $option['label'] ?? '' ),
                        'value' => (string) ( $option['value'] ?? $option['label'] ?? '' ),
                    );
                },
                $old_field['options']
            );
        }

        return $field;
    }
}
