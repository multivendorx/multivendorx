<?php
/**
 * The template for displaying single product page vendor tab 
 *
 * Override this template by copying it to yourtheme/MultiVendorX/policies-tab.php
 *
 * @author 		MultiVendorX
 * @package MultiVendorX/Templates
 * @version   2.3.0
 */

use MultiVendorX\Store\StoreUtil;

$store_id = $args['store_id'];
$policies = StoreUtil::get_store_policies($store_id);

if (empty($policies)) {
    echo 'No policy found.';
}
?>
<div class="mvx-product-policies">
    <?php if( !empty($policies['store_policy']) ){ ?>
    <div class="mvx-shipping-policies policy">
        <h2 class="mvx_policies_heading heading"><?php echo esc_html_e('Store Policy', 'multivendorx'); ?></h2>
        <div class="mvx_policies_description description" ><?php echo wp_kses_post($policies['store_policy']); ?></div>
    </div>
    <?php } if( !empty($policies['shipping_policy']) ){ ?>
    <div class="mvx-shipping-policies policy">
        <h2 class="mvx_policies_heading heading"><?php echo esc_html_e('Shipping Policy', 'multivendorx'); ?></h2>
        <div class="mvx_policies_description description" ><?php echo wp_kses_post($policies['shipping_policy']); ?></div>
    </div>
    <?php } if( !empty($policies['refund_policy']) ){ ?>
    <div class="mvx-refund-policies policy">
        <h2 class="mvx_policies_heading heading heading"><?php echo esc_html_e('Refund Policy', 'multivendorx'); ?></h2>
        <div class="mvx_policies_description description" ><?php echo wp_kses_post($policies['refund_policy']); ?></div>
    </div>
    <?php } if( !empty($policies['cancellation_policy']) ){ ?>
    <div class="mvx-cancellation-policies policy">
        <h2 class="mvx_policies_heading heading"><?php echo esc_html_e('Cancellation / Return / Exchange Policy', 'multivendorx'); ?></h2>
        <div class="mvx_policies_description description" ><?php echo wp_kses_post($policies['cancellation_policy']); ?></div>
    </div>
    <?php } ?>
</div>