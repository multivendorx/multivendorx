<?php
/**
 * Templates class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX's starter template for the store registration form, added via VuloForm's
 * `vuloform_templates` filter.
 */
class Templates {

    const TEMPLATE_ID = 'multivendorx_store_registration';

    /**
     * Templates constructor.
     */
    public function __construct() {
        add_filter( 'vuloform_templates', array( $this, 'add_templates' ) );
    }

    /**
     * @param array $templates Existing templates, id => {title, desc, icon, category, schema}.
     * @return array
     */
    public function add_templates( $templates ) {
        if ( ! class_exists( '\VuloForm\Forms\Schema' ) || ! class_exists( '\VuloForm\Forms\Templates' ) ) {
            return $templates;
        }

        $settings                    = \VuloForm\Forms\Schema::default_settings();
        $settings['submit_label']    = __( 'Register your store', 'multivendorx' );
        $settings['notifications'][] = \VuloForm\Forms\Templates::admin_notification( 'email' );

        $templates[ self::TEMPLATE_ID ] = array(
            'title'    => __( 'Store registration (MultiVendorX)', 'multivendorx' ),
            'desc'     => __( 'Store name, description, contact details and address for a new vendor application.', 'multivendorx' ),
            'icon'     => 'store',
            'category' => __( 'MultiVendorX', 'multivendorx' ),
            'schema'   => \VuloForm\Forms\Schema::sanitize(
                array(
                    'fields'   => self::fields(),
                    'settings' => $settings,
                )
            ),
        );

        return $templates;
    }

    /**
     * The store registration form's fields. Every field's default is `{query:<key>}` so the
     * React embed (VuloFormEmbed.tsx) can prefill it with the vendor's own already-saved store
     * data when they're re-editing an existing registration, by passing it as query params.
     *
     * @return array
     */
    public static function fields() {
        return array(
            array(
                'type'     => 'text',
                'key'      => 'name',
                'label'    => __( 'Store name', 'multivendorx' ),
                'required' => true,
                'default'  => '{query:name}',
            ),
            array(
                'type'     => 'email',
                'key'      => 'email',
                'label'    => __( 'Email', 'multivendorx' ),
                'required' => true,
                'default'  => '{user:email}',
            ),
            array(
                'type'    => 'textarea',
                'key'     => 'description',
                'label'   => __( 'Store description', 'multivendorx' ),
                'default' => '{query:description}',
            ),
            array(
                'type'    => 'phone',
                'key'     => 'phone',
                'label'   => __( 'Phone', 'multivendorx' ),
                'default' => '{query:phone}',
            ),
            array(
                'type'    => 'email',
                'key'     => 'paypal_email',
                'label'   => __( 'PayPal email', 'multivendorx' ),
                'default' => '{query:paypal_email}',
            ),
            array(
                'type'    => 'text',
                'key'     => 'address',
                'label'   => __( 'Address', 'multivendorx' ),
                'default' => '{query:address}',
            ),
            self::applicant_field(),
        );
    }

    /**
     * Bakes the real user id in at embed time, since submission is cookie-less and anonymous.
     *
     * @return array
     */
    public static function applicant_field() {
        return array(
            'type'    => 'hidden',
            'key'     => self::APPLICANT_FIELD_KEY,
            'default' => '{user:id}',
        );
    }

    const APPLICANT_FIELD_KEY = 'applicant_user_id';
}
