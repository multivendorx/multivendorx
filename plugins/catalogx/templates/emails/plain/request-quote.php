<?php
/**
 * CatalogX Email Request quote (Plain Text)
 *
 * @author  MultiVendorX
 * @version  6.0.0
 * @package CatalogX
 */

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.
/* translators: %s: Show the admin name. */
echo '= ' . sprintf( esc_html__( 'Dear %s', 'catalogx' ), esc_html( $args['admin'] ?? 'Admin' ) ) . " =\n\n";
echo esc_html__( 'You have received a new quote request from a customer for the following product:', 'catalogx' ) . "\n\n";
$customer_data = $args['customer_data'];

// Products Table.
if ( ! empty( $args['products'] ) ) {
    foreach ( $args['products'] as $item ) {
        $_product = wc_get_product( $item['product_id'] );
        /* translators: %s: Show the product name. */
        echo sprintf( esc_html__( 'Product: %s', 'catalogx' ), esc_html( $_product->get_title() ) ) . "\n";
        /* translators: %s: Show the quantity of the product. */
        echo sprintf( esc_html__( 'Qty: %s', 'catalogx' ), esc_html( $item['quantity'] ) ) . "\n\n";
        /* translators: %s: Show the price of the product. */
        echo sprintf( esc_html__( 'Price: %s', 'catalogx' ), esc_html( $_product->get_regular_price() ) ) . "\n\n";
    }
} else {
    /* translators: %s: Show the product name. */
    echo sprintf( esc_html__( 'Product: %s', 'catalogx' ), esc_html( 'Dummy Product' ) ) . "\n";
    /* translators: %s: Show the quantity of the product. */
    echo sprintf( esc_html__( 'Qty: %s', 'catalogx' ), absint( 1 ) ) . "\n";
    /* translators: %s: Show the price of the product. */
    echo sprintf( esc_html__( 'Price: %s', 'catalogx' ), esc_html( 100 ) ) . "\n\n";
}

echo "\n" . esc_html__( 'Customer Details:', 'catalogx' ) . "\n";
echo esc_html__( 'Customer Name:', 'catalogx' ) . ' ' . esc_html( $customer_data['name'] ?? 'John Doe' ) . "\n";
echo esc_html__( 'Email:', 'catalogx' ) . ' ' . esc_html( $customer_data['email'] ?? 'example@gmail.com' ) . "\n\n";

if ( ! empty( $customer_data['details'] ) ) {
    echo esc_html__( 'Additional Details:', 'catalogx' ) . "\n";
    echo esc_html( $customer_data['details'] ) . "\n";
}

do_action( 'catalogx_email_footer', $email );
