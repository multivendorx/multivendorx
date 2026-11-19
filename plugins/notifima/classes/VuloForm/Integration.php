<?php
/**
 * Integration class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloForm in as Notifima's subscription form builder.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new Installer();
        new Templates();
        new SubscriptionBridge();
        new PreviewRest();

        add_filter( 'notifima_subscribe_form_localize_data', array( $this, 'localize_data' ) );
    }

    /**
     * @param array $data Data already localized to the `subscription` object.
     * @return array
     */
    public function localize_data( $data ) {
        $data['vuloform_form_id']        = (int) Notifima()->setting->get_setting( 'vuloform_subscription_form_id', 0 );
        $data['vuloform_rest_namespace'] = 'vuloform/v1';

        return $data;
    }
}
