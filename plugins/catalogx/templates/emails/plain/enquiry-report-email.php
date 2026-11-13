<?php
/**
 * CatalogX Enquiry Report Email (Plain Text)
 *
 * @author  MultiVendorX
 * @version 6.1.9
 * @package CatalogX
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$enquiries  = $args['enquiries'] ?? array();
$start_date = $args['start_date'] ?? '';
$end_date   = $args['end_date'] ?? '';

echo esc_html( wp_strip_all_tags( $email_heading ) ) . "\n\n";

echo esc_html__( 'Hello,', 'catalogx' ) . "\n\n";

printf(
	/* translators: 1: report start date, 2: report end date. */
	esc_html__( 'Here is the product enquiry summary for the period %1$s to %2$s.', 'catalogx' ),
	esc_html( $start_date ),
	esc_html( $end_date )
);

echo "\n\n";

if ( ! empty( $enquiries ) && is_array( $enquiries ) ) {

	echo esc_html__( 'Product Enquiry Details:', 'catalogx' ) . "\n\n";

	foreach ( $enquiries as $product_data ) {

		echo esc_html__( 'Product Name: ', 'catalogx' ) . esc_html( $product_data['product_name'] ?? '' ) . "\n";

		echo esc_html__( 'Enquiry Count: ', 'catalogx' ) . esc_html( $product_data['count'] ?? 0 ) . "\n\n";
	}

} else {

	echo esc_html__( 'There were no product enquiries during this reporting period. We will include new enquiries in your next report.', 'catalogx' ) . "\n\n";

}

echo "\n****************************************************\n\n";

// translators: %s: site name.
echo esc_html(
	wp_strip_all_tags(
		apply_filters(
			'catalogx_email_footer_text',
			sprintf(
				__( '%s - Powered by CatalogX', 'catalogx' ),
				get_bloginfo( 'name', 'display' )
			)
		)
	)
);
