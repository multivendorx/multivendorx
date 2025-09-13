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

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
do_action( 'catalogx_email_header', $args['email_heading'] );
$enquiry_data = $args['enquiry_data'];
?>
<body>
    <div style="width:600px; margin: 0 auto; ">
        <div class="email-container">
                <div style="width:100%; background: #557DA1; padding: 40px 30px; border: 1px solid #557DA1;">
                    <h2 style="font-family: Arial; line-height: 43px; text-align: center; color: #fff; font-size: 46px; font-weight: 700; margin: 0;padding: 0 0 0px 0;">
                        <?php echo esc_html__( 'New Product Enquiry', 'catalogx' ) ?>
                    </h2>
                </div>
            
                <div style="width: 100%;">
            <p><?php esc_html_e( 'Dear Admin', 'catalogx' ); ?>,</p>
            <p><?php esc_html_e( 'Please find the product enquiry, details are given below', 'catalogx' ); ?>.</p>
            <h3 style="font-size: 20px; color:#557da1; "><?php esc_html_e( 'Product Details', 'catalogx' ); ?></h3>
            <div class="table-wrapper">
                <table cellspacing="0" cellpadding="6" style="width: 100%; border: 1px solid #eee;" border="1" bordercolor="#eee">
                    <thead>
                        <tr>
                            <th scope="col"><?php esc_html_e( 'Product', 'catalogx' ); ?></th>
                            <th scope="col"><?php esc_html_e( 'Product Url', 'catalogx' ); ?></th>
                            <th scope="col"><?php esc_html_e( 'Product SKU', 'catalogx' ); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        if ( is_array( $args['product_id'] ) && count( $args['product_id'] ) > 1 ) {
                            foreach ( $args['product_id'] as $product_id => $value ) {
                                $product_obj = wc_get_product( $product_id );
                                ?>
                                <tr>
                                <td scope="col"><?php echo esc_html( $product_obj->get_name() ); ?>
                                <?php
								if ( 'variation' === $product_obj->get_type() ) {
									if ( isset( $enquiry_data['variations'] ) && count( $enquiry_data['variations'] ) > 0 ) {
										foreach ( $enquiry_data['variations'] as $label => $value ) {
											$label = str_replace( 'attribute_pa_', '', $label );
											$label = str_replace( 'attribute_', '', $label );
											echo '<br>' . esc_html( ucfirst( $label ) ) . ': ' . esc_html( ucfirst( $value ) );
										}
									} elseif ( $product_obj->get_attributes() ) {
										foreach ( $product_obj->get_attributes() as $label => $value ) {
											echo '<br>' . esc_html( ucfirst( wc_attribute_label( $label ) ) ) . ': ' . esc_html( ucfirst( $value ) );
										}
									}
								}
								?>
                                </td>
                                <td scope="col"><a href="<?php echo esc_url( $product_obj->get_permalink() ); ?>" target="_blank"><?php echo esc_html( $product_obj->get_title() ); ?></a></td>
                                <?php if ( $product_obj->get_sku() ) { ?>
                                <td scope="col"><?php echo esc_html( $product_obj->get_sku() ); ?></td>
                                <?php } else { ?>
                                    <td scope="col"><?php echo '-'; ?></td>
                                <?php } ?>
                            </tr>
								<?php
                            }
                        } else {
                            $product_obj = wc_get_product( key( $args['product_id'] ?? array() ) );
                            ?>
                            <tr>
                            <td scope="col"><?php echo esc_html( $product_obj ? $product_obj->get_name() : 'Dummy Product' ); ?>
                            <?php
							if ( $product_obj && $product_obj->get_type() === 'variation' ) {
								if ( isset( $enquiry_data['variations'] ) && count( $enquiry_data['variations'] ) > 0 ) {
									foreach ( $enquiry_data['variations'] as $label => $value ) {
										$label = str_replace( 'attribute_pa_', '', $label );
										$label = str_replace( 'attribute_', '', $label );
										echo '<br>' . esc_html( ucfirst( $label ) ) . ': ' . esc_html( ucfirst( $value ) );
									}
								} elseif ( $product_obj->get_attributes() ) {
									foreach ( $product_obj->get_attributes() as $label => $value ) {
										echo '<br>' . esc_html( ucfirst( wc_attribute_label( $label ) ) ) . ': ' . esc_html( ucfirst( $value ) );
									}
								}
							}
							?>
                            </td>
                            <td scope="col"><a href="<?php echo esc_url( $product_obj ? $product_obj->get_permalink() : '#' ); ?>" target="_blank"><?php echo esc_html( $product_obj ? $product_obj->get_title() : 'Dummy title' ); ?></a></td>
                            <?php if ( $product_obj && $product_obj->get_sku() ) { ?>
                            <td scope="col"><?php echo esc_html( $product_obj->get_sku() ); ?></td>
                            <?php } else { ?>
                                <td scope="col"><?php echo '-'; ?></td>
                            <?php } ?>
                        </tr>
							<?php
                        }
                        ?>
                    </tbody>
                </table>
            </div>
            <h3 style="font-size: 20px; color:#557da1; margin-top: 1rem;"  ><?php esc_html_e( 'Customer Details', 'catalogx' ); ?></h3>
            <p>
                <strong><?php esc_html_e( 'Name', 'catalogx' ); ?> : </strong>
                <?php echo esc_html( $enquiry_data['user_name'] ?? 'John Doe' ); ?>
            </p>
            <p>
                <strong><?php esc_html_e( 'Email', 'catalogx' ); ?> : </strong>
                <a target="_blank" href="mailto:<?php echo esc_html( $enquiry_data['user_email'] ?? 'example@gmail.com' ); ?>"><?php echo esc_html( $enquiry_data['user_email'] ?? 'example@gmail.com' ); ?></a>
            </p>
            <?php
            foreach ( $enquiry_data['user_enquiry_fields'] as $field ) {
                if ( isset( $field['name'] ) && isset( $field['value'] ) ) {
                    if ( 'phone' === $field['name'] ) {
						?>
                        <p>
                            <strong><?php esc_html_e( 'User Phone : ', 'catalogx' ); ?></strong>
                            <?php echo esc_html( $field['value'] ); ?>
                        </p>
						<?php
                    }
                    if ( 'address' === $field['name'] ) {
						?>
                        <p>
                            <strong><?php esc_html_e( 'User Address : ', 'catalogx' ); ?></strong>
                            <?php echo esc_html( $field['value'] ); ?>
                        </p>
						<?php
                    }
                    if ( 'subject' === $field['name'] ) {
						?>
                        <p>
                            <strong><?php esc_html_e( 'User Subject : ', 'catalogx' ); ?></strong>
                            <?php echo esc_html( $field['value'] ); ?>
                        </p>
						<?php
                    }
                    if ( 'comment' === $field['name'] ) {
						?>
                        <p>
                            <strong><?php esc_html_e( 'User Comments : ', 'catalogx' ); ?></strong>
                            <?php echo esc_html( $field['value'] ); ?>
                        </p>
						<?php
                    }
                }
            }
            ?>
            </div>
        </div>
        <table cellspacing="0" cellpadding="10" border="0" width="100%">
            <tbody>
                <tr>
                    <td colspan="2" valign="middle" align="center">
                    <?php /* translators: %s: email footer which display the site name. */ ?>
                    <p><?php echo esc_html( apply_filters( 'catalogx_email_footer_text', sprintf( __( '%s - Powered by CatalogX', 'catalogx' ), get_bloginfo( 'name', 'display' ) ) ) ); ?></a>.</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>