<?php
/**
 * CatalogX Enquiry Email (Plain Text)
 *
 * @author  MultiVendorX
 * @version  6.0.0
 * @package CatalogX
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
$enquiry_data = $args['enquiry_data'];

echo esc_html( $args['email_heading'] ) . "\n\n";

echo sprintf( esc_html__( 'Dear Admin', 'catalogx' ) ) . "\n\n";
echo sprintf( esc_html__( 'Please find the product enquiry, details are given below', 'catalogx' ) ) . "\n\n";

echo "\n****************************************************\n\n";

$product_obj = wc_get_product( key( $args['product_id'] ?? array() ) );

echo "\n Product Name : " . esc_html( $product_obj ? $product_obj->get_name() : 'Dummy Product' );

if ( $product_obj && $product_obj->get_type() === 'variation' ) {
    if ( isset( $enquiry_data['variations'] ) && count( $enquiry_data['variations'] ) > 0 ) {
		foreach ( $enquiry_data['variations'] as $label => $value ) {
			$label = str_replace( 'attribute_pa_', '', $label );
			$label = str_replace( 'attribute_', '', $label );
			echo "\n" . esc_html( ucfirst( $label ) ) . ': ' . esc_html( ucfirst( $value ) );
		}
	} elseif ( $product_obj->get_attributes() ) {
		foreach ( $product_obj->get_attributes() as $label => $value ) {
			echo "\n" . esc_html( ucfirst( wc_attribute_label( $label ) ) ) . ': ' . esc_html( ucfirst( $value ) );
		}
	}
}

echo "\n\n Product link : " . esc_url( $product_obj ? $product_obj->get_permalink() : '#' );
if ( $product_obj && $product_obj->get_sku() ) {
    echo "\n\n Product SKU : " . esc_html( $product_obj->get_sku() );
}

echo "\n\n\n****************************************************\n\n";

echo "\n Customer Details : ";

echo "\n\n\n Name : " . esc_html( $enquiry_data['cust_name'] ?? 'John Doe' );

echo "\n\n Email : " . esc_html( $enquiry_data['cust_email'] ?? 'example@gmail.com' );
if ( isset( $enquiry_data['phone'] ) ) {
    echo "\n\n User Phone : " . esc_html( $enquiry_data['phone'] );
}
if ( isset( $enquiry_data['address'] ) ) {
    echo "\n\n User Address : " . esc_html( $enquiry_data['address'] );
}
if ( isset( $enquiry_data['subject'] ) ) {
    echo "\n\n User Subject : " . esc_html( $enquiry_data['subject'] );
}
if ( isset( $enquiry_data['comment'] ) ) {
    echo "\n\n User Comments : " . esc_html( $enquiry_data['comment'] );
}

echo "\n\n\n****************************************************\n\n";

// translators: %s is the site name.
echo esc_html( apply_filters( 'catalogx_email_footer_text', sprintf( __( '%s - Powered by CatalogX', 'catalogx' ), get_bloginfo( 'name', 'display' ) ) ) );
