
<?php
/**
 * Notifima Subscriber Report Email (Plain Text)
 *
 * Override this template by copying it to yourtheme/woocommerce-product-stock-alert/emails/plain/subscriber-report-email.php
 *
 * @author    MultiVendorX
 * @package   notifima/templates
 * @version   3.1.10
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo esc_html( $args['email_heading'] ) . "\n\n";

$subscribers = $args['subscribers'];
$start_date  = $args['start_date'];
$end_date    = $args['end_date'];

echo esc_html__(
    'Here is your subscriber report for the selected reporting period.',
    'notifima'
) . "\n\n";

echo esc_html__( 'Report Period:', 'notifima' ) . ' ';
echo esc_html( $start_date ) . ' - ' . esc_html( $end_date ) . "\n\n";

echo "****************************************************\n\n";

if ( ! empty( $subscribers ) ) {

    foreach ( $subscribers as $subscriber ) {

        // Product ID.
        echo esc_html__( 'Product ID:', 'notifima' ) . ' ';
        echo esc_html( $subscriber['product_id'] ) . "\n";

        // Product Name.
        echo esc_html__( 'Product Name:', 'notifima' ) . ' ';
        echo esc_html( $subscriber['product_name'] ) . "\n";

        // Subscriber Count.
        echo esc_html__( 'Subscriber Count:', 'notifima' ) . ' ';
        echo esc_html( $subscriber['count'] ) . "\n";

        echo "\n----------------------------------------------------\n\n";
    }

    // Total Subscribers.
    echo esc_html__( 'Total Subscribers:', 'notifima' ) . ' ';
    echo esc_html( array_sum( wp_list_pluck( $subscribers, 'count' ) ) ) . "\n";

} else {

    echo esc_html__(
        'No subscribers were found during this reporting period.',
        'notifima'
    ) . "\n";
}

echo "\n****************************************************\n\n";

echo esc_html(
    apply_filters(
        'woocommerce_email_footer_text',
        get_option( 'woocommerce_email_footer_text' )
    )
);
