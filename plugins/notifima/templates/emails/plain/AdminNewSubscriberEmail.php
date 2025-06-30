<?php
/**
 * Notifima Admin New Subscriber Email (Plain Text)
 *
 * Override this template by copying it to yourtheme/woocommerce-product-stock-alert/emails/plain/AdminNewSubscriberEmail.php
 *
 * @author    MultiVendorX
 * @package   notifima/templates
 * @version   1.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo esc_html( $args['email_heading'] ) . "\n\n";

$product = isset( $args['product'] ) ? $args['product'] : null;

echo esc_html__( 'Hi there. A customer has subscribed to a product on your shop. Product details are shown below for your reference:', 'notifima' ) . "\n\n";

echo "****************************************************\n\n";

// Product Name
echo esc_html__( 'Product Name:', 'notifima' ) . ' ';
echo ! empty( $product ) ? esc_html( $product->get_name() ) : esc_html__( 'Dummy Product', 'notifima' );
echo "\n";

// Product Price
echo esc_html__( 'Product Price:', 'notifima' ) . ' ';
echo ! empty( $product ) ? esc_html( wc_price( wc_get_price_to_display( $product ) ) ) : esc_html__( '$20.00', 'notifima' );
echo "\n";

// Product Link
if ( ! empty( $product ) ) {
    echo esc_html__( 'Product Link:', 'notifima' ) . ' ' . esc_url( $product->get_permalink() ) . "\n";
}

echo "\n****************************************************\n\n";

// Customer Details
echo esc_html__( 'Customer Email:', 'notifima' ) . ' ';
echo ! empty( $args['customer_email'] ) ? esc_html( $args['customer_email'] ) : esc_html__( 'test@example.com', 'notifima' );
echo "\n\n";

echo "****************************************************\n\n";

echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
