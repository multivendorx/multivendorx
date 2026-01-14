<?php
/**
 * The template for displaying single product page vendor tab
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-single-product-policy-tab.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

use MultiVendorX\StorePolicy\Util;

global $product;
$policies = Util::get_store_policies( 0, $product->get_id() );
?>
<div class="multivendorx-product-policies">
    <?php if ( ! empty( $policies['store_policy'] ) ) { ?>
    <div class="multivendorx-shipping-policies policy">
        <h2 class="multivendorx-policies-heading heading"><?php esc_html_e( 'Store Policy', 'multivendorx' ); ?></h2>
        <p class="multivendorx-policies-description description" ><?php echo wp_kses_post( $policies['store_policy'] ); ?></p>
    </div>
    <?php } if ( ! empty( $policies['shipping_policy'] ) ) { ?>
    <div class="multivendorx-shipping-policies policy">
        <h2 class="multivendorx-policies-heading heading"><?php esc_html_e( 'Shipping Policy', 'multivendorx' ); ?></h2>
        <p class="multivendorx-policies-description description" ><?php echo wp_kses_post( $policies['shipping_policy'] ); ?></p>
    </div>
    <?php } if ( ! empty( $policies['refund_policy'] ) ) { ?>
    <div class="multivendorx-refund-policies policy">
        <h2 class="multivendorx-policies-heading heading heading"><?php esc_html_e( 'Refund Policy', 'multivendorx' ); ?></h2>
        <p class="multivendorx-policies-description description" ><?php echo wp_kses_post( $policies['refund_policy'] ); ?></p>
    </div>
    <?php } if ( ! empty( $policies['cancellation_policy'] ) ) { ?>
    <div class="multivendorx-cancellation-policies policy">
        <h2 class="multivendorx-policies-heading heading"><?php esc_html_e( 'Cancellation / Return / Exchange Policy', 'multivendorx' ); ?></h2>
        <p class="multivendorx-policies-description description" ><?php echo wp_kses_post( $policies['cancellation_policy'] ); ?></p>
    </div>
    <?php } ?>
</div>
