<?php
/**
 * Templates class file.
 *
 * @package CatalogX
 */

namespace CatalogX\Integrations\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX's starter template for the enquiry form, added via VuloForm's `vuloform_templates` filter.
 */
class Templates {

    const TEMPLATE_ID = 'catalogx_enquiry';

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
        $settings['submit_label']    = __( 'Send enquiry', 'catalogx' );
        $settings['notifications'][] = \VuloForm\Forms\Templates::admin_notification( 'email' );

        $templates[ self::TEMPLATE_ID ] = array(
            'title'    => __( 'Enquiry form (CatalogX)', 'catalogx' ),
            'desc'     => __( 'Name, email and a message for a product enquiry.', 'catalogx' ),
            'icon'     => 'contact-form',
            'category' => __( 'CatalogX', 'catalogx' ),
            'schema'   => \VuloForm\Forms\Schema::sanitize(
                array(
                    'fields'   => array_merge(
                        array(
                            array(
                                'type'     => 'text',
                                'key'      => 'name',
                                'label'    => __( 'Name', 'catalogx' ),
                                'required' => true,
                                'default'  => '{user:name}',
                            ),
                            array(
                                'type'     => 'email',
                                'key'      => 'email',
                                'label'    => __( 'Email', 'catalogx' ),
                                'required' => true,
                                'default'  => '{user:email}',
                            ),
                            array(
                                'type'              => 'phone',
                                'key'               => 'phone',
                                'label'             => __( 'Phone (optional)', 'catalogx' ),
                                // Without this, VuloForm mishandles the field's nested value as a plain string.
                                'show_country_code' => true,
                            ),
                            array(
                                'type'     => 'textarea',
                                'key'      => 'message',
                                'label'    => __( 'Message', 'catalogx' ),
                                'required' => true,
                            ),
                        ),
                        self::infrastructure_fields()
                    ),
                    'settings' => $settings,
                )
            ),
        );

        return $templates;
    }

    /**
     * Hidden fields the enquiry flow depends on regardless of which fields the admin put in the
     * form -- `SubmissionBridge`/the embed's `forceHiddenFieldValues()` always look for these by
     * key. Shared with `FieldMapper::schema()` so a form built from a site's legacy field list
     * (which has nothing equivalent to convert) still gets them.
     *
     * @return array
     */
    public static function infrastructure_fields() {
        return array(
            array(
                'type'    => 'hidden',
                'key'     => 'product_id',
                'label'   => __( 'Product', 'catalogx' ),
                // From the `?product_id=` param the embed call is made with.
                'default' => '{query:product_id}',
            ),
            array(
                'type'    => 'hidden',
                'key'     => 'quantity',
                'label'   => __( 'Quantity', 'catalogx' ),
                'default' => '{query:quantity}',
            ),
            array(
                'type'    => 'hidden',
                'key'     => 'user_id',
                'label'   => __( 'User', 'catalogx' ),
                // VuloForm's own submission never carries cookies, so the logged-in
                // user's real id is staged into the page URL at embed time instead.
                'default' => '{query:user_id}',
            ),
        );
    }
}
