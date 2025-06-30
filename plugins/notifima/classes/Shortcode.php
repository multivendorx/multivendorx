<?php
/**
 * Shortcode class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Shortcode class
 *
 * @class       Shortcode class
 * @version     PRODUCT_VERSION
 * @author      MultivendorX
 */
class Shortcode {

    /**
     * Shortcode constructor.
     */
    public function __construct() {
        // Product Notifima Subscription Form Shortcode.
        add_shortcode( 'notifima_subscription_form', array( $this, 'notifima_subscription_form' ) );
    }

    /**
     * Display Notifima subscription form.
     *
     * @param array $attr Shortcode attributes. Default empty array.
     *
     * @return string HTML content of the subscription form.
     */
    public function notifima_subscription_form( $attr ) {
        ob_start();
        $product_id = isset( $attr['product_id'] ) ? (int) $attr['product_id'] : null;

        do_action( 'notifima_before_subscription_form' );

        Notifima()->frontend->display_product_subscription_form( $product_id );

        do_action( 'notifima_after_subscription_form' );

        return ob_get_clean();
    }
}
