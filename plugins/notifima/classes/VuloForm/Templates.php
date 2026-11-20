<?php
/**
 * Templates class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima's starter templates, added via VuloForm's `vuloform_templates` filter.
 */
class Templates {

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

        $templates['notifima_back_in_stock'] = $this->back_in_stock_template();

        return $templates;
    }

    /**
     * @return array {title, desc, icon, category, schema}
     */
    private function back_in_stock_template() {
        $settings                    = \VuloForm\Forms\Schema::default_settings();
        $settings['submit_label']    = __( 'Notify me', 'notifima' );
        $settings['notifications'][] = \VuloForm\Forms\Templates::admin_notification( 'email' );

        return array(
            'title'    => __( 'Back in stock notification (Notifima)', 'notifima' ),
            'desc'     => __( 'Collects an email address to notify a visitor when this product is back in stock.', 'notifima' ),
            'icon'     => 'bell',
            'category' => __( 'Notifima', 'notifima' ),
            'schema'   => \VuloForm\Forms\Schema::sanitize(
                array(
                    'fields'   => array(
                        array(
                            'type'        => 'email',
                            'key'         => 'email',
                            'label'       => __( 'Email', 'notifima' ),
                            'placeholder' => __( 'Enter your email', 'notifima' ),
                            'required'    => true,
                            'default'     => '{user:email}',
                        ),
                        array(
                            'type'    => 'hidden',
                            'key'     => 'product_id',
                            'label'   => __( 'Product', 'notifima' ),
                            // From the `?product_id=` param VuloFormEmbed.tsx passes to the embed call.
                            'default' => '{query:product_id}',
                        ),
                    ),
                    'settings' => $settings,
                )
            ),
        );
    }
}
