<?php
/**
 * Notifima Product Back In Stock Email
 *
 * Override this template by copying it to yourtheme/woocommerce-product-stock-alert/emails/html/ProductBackInStockEmail.php
 *
 * @author    MultiVendorX
 * @package   notifima/templates
 * @version   1.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
} // Exit if accessed directly

do_action( 'woocommerce_email_header', $args['email_heading'], $email );
$product = $args['product'];
?>

<p>
<?php
printf( esc_html__( 'Hi there. You have subscribed to a product. Your subscribed product is available now. Product details are shown below for your reference:', 'notifima' ) );

$is_prices_including_tax = esc_html( get_option( 'woocommerce_prices_include_tax' ) );
?>
<h3><?php esc_html_e( 'Product Details', 'notifima' ); ?></h3>
<table cellspacing="0" cellpadding="6" style="width: 100%; border: 1px solid #eee;" border="1" bordercolor="#eee">
	<thead>
		<tr>
			<th scope="col" style="text-align:left; border: 1px solid #eee;"><?php esc_html_e( 'Product', 'notifima' ); ?></th>
			<th scope="col" style="text-align:left; border: 1px solid #eee;"><?php esc_html_e( 'Price', 'notifima' ); ?></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th scope="col" style="text-align:left; border: 1px solid #eee;"><?php echo !empty($product) ? esc_html( $product->get_name() ) : "Dummy Product"; ?>
			
			</th>
			<th scope="col" style="text-align:left; border: 1px solid #eee;">
				<?php
                    echo !empty($product) ? wp_kses_post( wc_price( wc_get_price_to_display( $product ) ) ) : '$20.00';
					echo esc_html( ( isset( $is_prices_including_tax ) && ( 'yes' !== $is_prices_including_tax ) ) ? WC()->countries->ex_tax_or_vat() : WC()->countries->inc_tax_or_vat() );
				?>
			</th>
		</tr>
	</tbody>
</table>

<?php if (!empty($product)) { ?>
	<p style="margin-top: 15px !important;"><?php printf( esc_html__( 'Following is the product link : ', 'notifima' ) ); ?><a href="<?php echo esc_url( $product->get_permalink() ); ?>"><?php echo esc_html( wp_strip_all_tags( $product->get_name() ) ); ?></a></p>
<?php } ?>

<h3><?php esc_html_e( 'Customer Details', 'notifima' ); ?></h3>
<p>
	<strong><?php esc_html_e( 'Email', 'notifima' ); ?> : </strong>
	<a target="_blank" href="mailto:<?php echo esc_html( $args['customer_email'] ); ?>"><?php echo !empty($args['customer_email']) ? esc_html( $args['customer_email'] ) : 'test@example.com'; ?></a>
</p>

</p>
<?php
do_action( 'woocommerce_email_footer' );
