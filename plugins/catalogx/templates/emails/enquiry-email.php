<?php
/**
 * CatalogX Enquiry Email
 *
 * Override this template by copying it to yourtheme/woocommerce-catalog-enquiry/emails/enquiry-email.php
 *
 * @author    MultiVendorX
 * @package   CatalogX
 * @version   6.0.0
 */

use CatalogX\Emails\EmailHTMLConverter;
defined( 'ABSPATH' ) || exit;

do_action( 'catalogx_email_header',  $args['email_heading'] );
$enquiry_data = $args['enquiry_data'];

$settings = get_option(
	'catalogx_enquiry_email_temp_settings',
	array()
);

$template_data = $settings['enquiry_email_template'] ?? array();

$template_id = $template_data['activeEmailTemplateId'] ?? '';

$template = array();

foreach ( $template_data['emailTemplates'] ?? array() as $email_template ) {

	if ( $template_id === ( $email_template['id'] ?? '' ) ) {
		$template = $email_template;
		break;
	}
}

$email_html = '';

if ( ! empty( $template['blocks'] ) ) {
	$product_obj = wc_get_product( key( $args['product_id'] ) );
	$email_html = EmailHTMLConverter::convert( $template['blocks'],array(
		'{customer_name}'  => $enquiry_data['user_name'],
		'{customer_email}' => $enquiry_data['user_email'],
		'{product_name}'   => $product_obj ? $product_obj->get_name() : 'Dummy Product',
		'{product_link}'   => $product_obj ? $product_obj->get_permalink() : '#',
	) );
}
?>

<div style="width:600px;margin:0 auto;">
	<?php echo wp_kses_post( $email_html ); ?>
</div>

<?php do_action( 'catalogx_email_footer', $email ); ?>