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
 * One-time migration of the old block-builder store registration form fields into a VuloForm
 * form, so a site that already customized its registration form (`store_registration_from` under
 * `Utill::MULTIVENDORX_SETTINGS['registration']`) keeps those fields instead of starting over from
 * the starter template. `maybe_migrate()` is version-gated from `Install.php`'s `do_migration()`;
 * `ensure_form()` is also called on demand from the sibling `Integration::get_admin_localize_data()`.
 */
class Migration {

    const MIGRATED_OPTION = 'multivendorx_vuloform_store_registration_migrated';

    /**
     * Old block-builder type => VuloForm field type. `Install.php::do_migration()`'s own
     * normalization pass (`mvx_new_vendor_registration_form_data` => `store_registration_from`)
     * already collapses most legacy aliases (`textbox`, `vendor_paypal_email`, `vendor_phone`, ...)
     * down to these left-hand values before they ever reach this option, but a site whose data
     * predates that normalization -- or that was hand-edited -- may still have the raw alias, so
     * both are mapped here.
     */
    const TYPE_MAP = array(
        'text'         => 'text',
        'textbox'      => 'text',
        'email'        => 'email',
        'textarea'     => 'textarea',
        'phone'        => 'phone',
        'vendor_phone' => 'phone',
        'date'         => 'date',
        'time'         => 'time',
        'checkbox'     => 'checkboxes',
        'checkboxes'   => 'checkboxes',
        'multiselect'  => 'checkboxes',
        'multi-select' => 'checkboxes',
        'radio'        => 'radio',
        'dropdown'     => 'select',
        'select'       => 'select',
        'attachment'   => 'file',
        'richtext'     => 'consent',
    );

    /**
     * Old field types that aren't a real form field, or that VuloForm already owns as a
     * form-level setting rather than a field (recaptcha) -- there's nothing meaningful to
     * convert these to.
     */
    const SKIP_TYPES = array( 'button', 'title', 'p_title', 'divider', 'separator', 'recaptcha' );

    /**
     * Run once per site (version-gated from `Install.php`'s `do_migration()`). Calls the same
     * `ensure_form()` that `Integration::get_admin_localize_data()` calls on demand, so the form
     * still exists -- migrated from legacy fields if there are any -- even if the admin never
     * opens the Registration settings tab.
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
     * Ensures a store registration form exists: the one already configured, the site's legacy
     * block-builder fields migrated across, or -- if there's nothing to migrate -- a fresh one
     * from the starter template. Whichever form ends up configured is also patched with the
     * hidden applicant-id field `Integration::maybe_register_store()` depends on, since a
     * migrated or pre-`Templates::applicant_field()` form won't have it yet.
     *
     * @return int 0 on failure.
     */
    public static function ensure_form() {
        $form_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( $form_id && vuloform_get_form( $form_id ) ) {
            self::ensure_applicant_field( $form_id );
            return $form_id;
        }

        $old_fields = self::old_fields();

        if ( $old_fields ) {
            $schema  = self::schema_from_old_fields( $old_fields, __( 'Register your store', 'multivendorx' ), array( Templates::applicant_field() ) );
            $form_id = (int) VuloForm()->forms->create( __( 'Store registration form', 'multivendorx' ), $schema, 'published' );
        } else {
            $form_id = self::create_default_form();
        }

        if ( $form_id ) {
            MultiVendorX()->setting->update_setting(
                'vuloform_store_registration_form_id',
                $form_id,
                Utill::MULTIVENDORX_SETTINGS['registration']
            );
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

        return (int) VuloForm()->forms->create(
            $templates[ Templates::TEMPLATE_ID ]['title'],
            $templates[ Templates::TEMPLATE_ID ]['schema'],
            'published'
        );
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

    /**
     * The site's customized `store_registration_from.formfieldlist`, if any -- a brand new site
     * (or one that never touched the old block-builder form) has none, and `ensure_form()` falls
     * back to the starter template instead.
     *
     * @return array
     */
    private static function old_fields() {
        $settings = MultiVendorX()->setting->get_option( Utill::MULTIVENDORX_SETTINGS['registration'], array() );
        $fields   = $settings['store_registration_from']['formfieldlist'] ?? array();

        return is_array( $fields ) ? $fields : array();
    }

    /**
     * Maps the old block-builder field list shape ({id, type, label, name, required?,
     * placeholder?, options?}, plus a composite `address` type carrying its own nested `fields`)
     * to a VuloForm form schema.
     *
     * @param array  $old_fields   The old `formfieldlist` array.
     * @param string $submit_label Fallback submit button label (a 'button' entry overrides it).
     * @param array  $extra_fields Infrastructure fields (e.g. the hidden applicant-id field) the
     *                             caller wants appended as-is, since the legacy field list never
     *                             had anything equivalent to convert.
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

            // The address block isn't a field of its own -- its nested `fields` (address,
            // address_2, city, state, country, zip, each already keyed to match
            // `Stores::create_item()`'s `$registration_allowed_meta`) convert individually.
            if ( 'address' === $type ) {
                foreach ( (array) ( $old_field['fields'] ?? array() ) as $address_field ) {
                    $fields[] = self::mapped_field( $address_field, (string) ( $address_field['type'] ?? 'text' ), $address_field['key'] ?? null );
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
     * @param array       $old_field Old field.
     * @param string      $type      Old field type.
     * @param string|null $key       Explicit key, for the address block's sub-fields (already
     *                                correctly keyed); otherwise derived from `name`/`id`.
     * @return array VuloForm field.
     */
    private static function mapped_field( array $old_field, $type, $key = null ) {
        $field = array(
            'type'     => self::TYPE_MAP[ $type ] ?? 'text',
            'key'      => $key ?? sanitize_key( (string) ( $old_field['name'] ?? $old_field['id'] ?? '' ) ),
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
