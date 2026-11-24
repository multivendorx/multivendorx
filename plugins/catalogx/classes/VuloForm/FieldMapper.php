<?php
/**
 * FieldMapper class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * Maps the old block-builder field list shape ({id, type, label, required?, placeholder?, name,
 * options?}) to a VuloForm form schema. Shared by CatalogX's enquiry migration and CatalogX
 * Pro's wholesale migration -- both store fields built by the same `block-builder` field type.
 */
class FieldMapper {

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
     * @param array  $old_fields   The old `formfieldlist` array.
     * @param string $submit_label Fallback submit button label (a 'button' entry overrides it).
     * @param array  $extra_fields Infrastructure fields (e.g. hidden `product_id`/`user_id`) the
     *                             caller's own starter template carries, appended as-is since the
     *                             legacy field list never had anything equivalent to convert.
     * @return array Sanitized VuloForm schema ({version, fields, settings}).
     */
    public static function schema( array $old_fields, $submit_label, array $extra_fields = array() ) {
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

            $fields[] = self::field( $old_field, $type );
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
    private static function field( array $old_field, $type ) {
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
