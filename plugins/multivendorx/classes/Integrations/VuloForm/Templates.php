<?php
/**
 * Templates class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX's starter template for the store registration form, added via VuloForm's
 * `vuloform_templates` filter.
 */
class Templates {

    const TEMPLATE_ID = 'multivendorx_store_registration';

    /**
     * Key of the locked "account status" field (see `locked_login_field()`) -- fixed so
     * `Integration::render_login_field()`/`ensure_login_field_present()` can find it regardless
     * of label/position, and shared with `Migration::ensure_form()`.
     */
    const LOGIN_FIELD_KEY = 'multivendorx_account_status';

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
            // Makes `VuloForm\Forms\Templates::all()` stamp `settings.template` = self::TEMPLATE_ID
            // onto every form created from this template, persisted in that form's own schema --
            // what `Integration::lock_login_field()`'s `vuloform_locked_fields`/`locked` data and
            // zyra's `FormBuilder` (`lockOf()`) key the locked "account status" field's
            // undeletable-in-the-builder behaviour on.
            'plugin'   => 'multivendorx',
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
            self::locked_login_field(),
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
                'type'              => 'phone',
                'key'               => 'phone',
                'label'             => __( 'Phone', 'multivendorx' ),
                'default'           => '{query:phone}',
                // Without this, VuloForm mishandles the field's nested value as a plain string.
                'show_country_code' => true,
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
        );
    }

    /**
     * The locked "account status" field shown above the rest of the fields: a login/"already
     * logged in as X" section, same as the old block-builder form's first step. It's a normal
     * VuloForm `html` field so it appears in the builder (the admin can drag `page_break` fields
     * around it, same as any other field), but its content here is only a placeholder --
     * `Integration::render_login_field()` always overrides it with fresh, per-request markup via
     * VuloForm's `vuloform_render_field` filter, and `Integration::ensure_login_field_present()`
     * re-adds it on save if an admin removes it from the builder, so it can't actually be deleted
     * or hand-edited in VuloForm despite looking like an ordinary field there.
     *
     * @return array
     */
    public static function locked_login_field() {
        return array(
            'type'    => 'html',
            'key'     => self::LOGIN_FIELD_KEY,
            'label'   => __( 'Woocommerce login/registration block', 'multivendorx' ),
            'content' => __( 'This fields are non editable.', 'multivendorx' ),
        );
    }
}
