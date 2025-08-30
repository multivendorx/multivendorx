<?php
/**
 * Catalogx Quote Button Section
 *
 * Override this template by copying it to yourtheme/woocommerce-catalog-enquiry/quote-button-template.php
 *
 * @author    MultiVendorX
 * @package   woocommerce-catalog-enquiry/templates
 * @version   6.0.0
 */

$data_variations          = ( isset( $variations ) && ! empty( $variations ) ) ? ' data-variation="' . $variations . '" ' : '';
$button_position_settings = CatalogX()->setting->get_setting( 'shop_page_button_position_setting', array() );
$position                 = array_search( 'quote_button', $button_position_settings, true );
$position                 = false !== $position ? $position : 0;
?>
<div class="catalogx-add-to-quote add-to-quote-<?php echo esc_attr( $args['product_id'] ); ?>" position = "<?php echo esc_attr( $position ); ?>">

    <div class="catalogx-add-button <?php echo ( $args['exists'] ) ? 'hide' : 'show'; ?>" style="display:<?php echo ( $args['exists'] ) ? 'none' : 'block'; ?>"  data-product_id="<?php echo esc_attr( $args['product_id'] ); ?>">
        <button href="#" class="<?php echo esc_attr( $args['class'] ); ?> wp-block-button__link button" style = "<?php echo esc_attr( $args['btn_css'] ); ?>" data-product_id="<?php echo esc_attr( $args['product_id'] ); ?>" data-wp_nonce="<?php echo esc_attr( $args['wpnonce'] ); ?>"><?php echo esc_html( $args['label'] ); ?></button>

    </div>
    <div
        class="catalogx_quote_add_item_product-response-<?php echo esc_attr( $args['product_id'] ); ?>"
        style="display:none" data-product_id="<?php echo esc_attr( $args['product_id'] ); ?>"></div>
        <div
            class="catalogx_quote_add_item_browse-list-<?php echo esc_attr( $args['product_id'] ); ?> quote_add_item_browse_message  <?php echo esc_attr( ( ! $args['exists'] ) ? 'hide' : 'show' ); ?> hide-when-removed"
            style="display:<?php echo esc_attr( ( ! $args['exists'] ) ? 'none' : 'block' ); ?>"
            data-product_id="<?php echo esc_attr( $args['product_id'] ); ?>">
            <a href="<?php echo esc_url( $args['rqa_url'] ); ?>" style = "<?php echo esc_attr( $args['btn_css'] ); ?>" class="wp-block-button__link button"><?php echo esc_html( $args['label_browse'] ); ?></a></div>
            <div
                class="catalogx_quote_add_item_response-
                <?php
                echo esc_attr( $args['product_id'] );
				echo esc_attr( ( ! $args['exists'] ) ? 'hide' : 'show' );
				?>
                hide-when-removed"
                data-product_id="<?php echo esc_attr( $args['product_id'] ); ?>"
                style="display:<?php echo ( ! $args['exists'] ) ? 'none' : 'block'; ?>">
            </div>
        </div>
<div class="clear"></div>