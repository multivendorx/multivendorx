
<?php
/**
 * Notifima Subscriber Report Email
 *
 * Override this template by copying it to yourtheme/woocommerce-product-stock-alert/emails/subscriber-report-email.php
 *
 * @author    MultiVendorX
 * @package   notifima/templates
 * @version   3.1.10
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
} // Exit if accessed directly.

do_action( 'woocommerce_email_header', $args['email_heading'] );

$subscribers = $args['subscribers'];
$start_date  = $args['start_date'];
$end_date    = $args['end_date'];

$total_subscribers = array_sum( wp_list_pluck( $subscribers, 'count' ) );
?>

<p>
    <?php
    printf(
        /* translators: 1: Start date, 2: End date. */
        esc_html__(
            'Here is your subscriber report for the period %1$s to %2$s.',
            'notifima'
        ),
        esc_html( $start_date ),
        esc_html( $end_date )
    );
    ?>
</p>

<h3><?php esc_html_e( 'Subscriber Report', 'notifima' ); ?></h3>

<?php if ( ! empty( $subscribers ) ) : ?>

    <table cellspacing="0" cellpadding="6" style="width: 100%; border: 1px solid #eee;" border="1" bordercolor="#eee">
        <thead>
            <tr>
                <th scope="col" style="text-align: left; border: 1px solid #eee;">
                    <?php esc_html_e( 'Product ID', 'notifima' ); ?>
                </th>
                <th scope="col" style="text-align: left; border: 1px solid #eee;">
                    <?php esc_html_e( 'Product Name', 'notifima' ); ?>
                </th>
                <th scope="col" style="text-align: right; border: 1px solid #eee;">
                    <?php esc_html_e( 'Subscriber Count', 'notifima' ); ?>
                </th>
            </tr>
        </thead>

        <tbody>
            <?php foreach ( $subscribers as $subscriber ) : ?>
                <tr>
                    <td style="text-align: left; border: 1px solid #eee;">
                        <?php echo esc_html( $subscriber['product_id'] ); ?>
                    </td>
                    <td style="text-align: left; border: 1px solid #eee;">
                        <?php echo esc_html( $subscriber['product_name'] ); ?>
                    </td>
                    <td style="text-align: right; border: 1px solid #eee;">
                        <?php echo esc_html( $subscriber['count'] ); ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>

        <tfoot>
            <tr>
                <th colspan="2" style="text-align: right; border: 1px solid #eee;">
                    <?php esc_html_e( 'Total Subscribers', 'notifima' ); ?>
                </th>
                <th style="text-align: right; border: 1px solid #eee;">
                    <?php echo esc_html( $total_subscribers ); ?>
                </th>
            </tr>
        </tfoot>
    </table>

<?php else : ?>

    <p>
        <?php esc_html_e( 'No subscribers were found during this reporting period.', 'notifima' ); ?>
    </p>

<?php endif; ?>

<?php do_action( 'woocommerce_email_footer' ); ?>
