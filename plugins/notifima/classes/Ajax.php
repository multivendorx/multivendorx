<?php
/**
 * Ajax class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Ajax class
 *
 * @class       Ajax class
 * @version     3.0.0
 * @author      MultiVendorX
 */
class Ajax {

    /**
     * Ajax constructor.
     */
    public function __construct() {
        add_action( 'wp_ajax_nopriv_get_subscription_form_for_variation', array( $this, 'get_subscription_form_for_variation' ) );
        add_action( 'wp_ajax_get_subscription_form_for_variation', array( $this, 'get_subscription_form_for_variation' ) );
    }

    
    /**
     * Get the subscription form for variation product through ajax call.
     *
     * @return never
     */
    public function get_subscription_form_for_variation() {
        if ( ! check_ajax_referer( 'notifima-security-nonce', 'nonce', false ) ) {
            wp_send_json_error( 'Invalid security token sent.' );
            wp_die();
        }
        $product_id   = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) : '';
        $variation_id = filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) ? filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT ) : '';
        $product      = wc_get_product( $product_id );
        $variation_product    = null;
        if ( $variation_id ) {
            $variation_product = new \WC_Product_Variation( $variation_id );
        }
        echo Notifima()->frontend->get_subscribe_form( $product, $variation_product );
        die();
    }
}
