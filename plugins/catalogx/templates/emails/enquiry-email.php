<?php
/**
 * Request Quote Email
 *
 * @package CatalogX
 */

require_once __DIR__ . '/EmailHTMLConverter.php';
defined( 'ABSPATH' ) || exit;

do_action( 'catalogx_email_header', $email_heading );

$settings = get_option(
	'catalogx_enquiry_email_temp_settings',
	array()
);

$template_data = $settings['store_registration_form'] ?? array();

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
	$email_html = EmailHTMLConverter::convert( $template['blocks'] );
}
?>

<div style="width:600px;margin:0 auto;">
	<?php echo wp_kses_post( $email_html ); ?>
</div>



<?php do_action( 'catalogx_email_footer', $email ); ?>