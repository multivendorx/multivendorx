<?php
/**
 * CatalogX Enquiry Report Email
 *
 * @package CatalogX
 * @version 6.1.9
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

do_action( 'catalogx_email_header', $args['email_heading'] );

$enquiries  = $args['enquiries'] ?? array();
$start_date = $args['start_date'] ?? '';
$end_date   = $args['end_date'] ?? '';
?>

<body>
	<div style="width:600px; margin:0 auto;">
		<div class="email-container">

			<div style="width:100%; background:#557DA1; padding:30px;">
				<h2 style="font-family:Arial; text-align:center; color:#fff; font-size:36px; font-weight:700; margin:0;">
					<?php esc_html_e( 'Enquiry Report', 'catalogx' ); ?>
				</h2>
			</div>

			<div style="width:100%;">

				<p><?php esc_html_e( 'Hello,', 'catalogx' ); ?></p>

				<p>
					<?php
					printf(
						/* translators: 1: report start date, 2: report end date. */
						esc_html__( 'Here is the product enquiry summary for the period %1$s to %2$s.', 'catalogx' ),
						esc_html( $start_date ),
						esc_html( $end_date )
					);
					?>
				</p>

				<?php if ( ! empty( $enquiries ) && is_array( $enquiries ) ) { ?>

					<table cellspacing="0" cellpadding="10" style="width:100%; border:1px solid #eee;" border="1" bordercolor="#eee">
						<thead>
							<tr>
								<th scope="col" align="left">
									<?php esc_html_e( 'Product Name', 'catalogx' ); ?>
								</th>
								<th scope="col" align="center">
									<?php esc_html_e( 'Enquiry Count', 'catalogx' ); ?>
								</th>
							</tr>
						</thead>

						<tbody>
							<?php foreach ( $enquiries as $product_data ) { ?>
								<tr>
									<td>
										<?php echo esc_html( $product_data['product_name'] ?? '' ); ?>
									</td>
									<td align="center">
										<?php echo esc_html( $product_data['count'] ?? 0 ); ?>
									</td>
								</tr>
							<?php } ?>
						</tbody>
					</table>

				<?php } else { ?>

					<p style="padding:15px; background:#f7f7f7; border:1px solid #eee;">
						<?php esc_html_e( 'There were no product enquiries during this reporting period. We will include new enquiries in your next report.', 'catalogx' ); ?>
					</p>

				<?php } ?>

			</div>
		</div>

		<table cellspacing="0" cellpadding="10" border="0" width="100%">
			<tbody>
				<tr>
					<td valign="middle" align="center">
						<p>
							<?php
							echo wp_kses_post(
								apply_filters(
									'catalogx_email_footer_text',
									sprintf(
										__( '%s - Powered by CatalogX', 'catalogx' ),
										get_bloginfo( 'name', 'display' )
									)
								)
							);
							?>
						</p>
					</td>
				</tr>
			</tbody>
		</table>

	</div>
</body>
