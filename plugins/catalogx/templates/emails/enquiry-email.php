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
$form_settings = CatalogX()->setting->get_setting('enquiry_form_tabs', []);

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
	$replacements = [
		'{text_enter_the_text}'  => $enquiry_data['user_name'] ?? '',
    	'{email_email}' => $enquiry_data['user_email'] ?? '',
	];

	$form_fields = $form_settings['enquiry_form_builder']['formfieldlist'] ?? [];

	foreach ( $enquiry_data['user_enquiry_fields'] as $submitted_field ) {
		$matched_field = current(
			array_filter(
				$form_fields,
				fn( $field ) => isset( $field['name'] ) &&
					strtolower( $field['name'] ) === strtolower( $submitted_field['name'] )
			)
		);

		if ( empty( $matched_field ) ) {
			continue;
		}

		$tag = sprintf(
			'{%s_%s}',
			str_replace( '-', '_', sanitize_title( $matched_field['name'] ) ),
			str_replace( '-', '_', sanitize_title( $matched_field['label'] ?? '' ) )
		);

		$replacements[ $tag ] = $submitted_field['value'] ?? '';
	}
	$email_html = EmailHTMLConverter::convert( $template['blocks'], $replacements );
}
?>

<div style="width:600px;margin:0 auto;">
	<?php echo wp_kses_post( $email_html ); ?>
</div>

<?php do_action( 'catalogx_email_footer', $email ); ?>