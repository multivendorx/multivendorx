<?php
/**
 * The template for displaying single product page vendor tab
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-policy.php
 *
 * @package MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

use MultiVendorX\StorePolicy\Util;

$store_id = $args['store_id'];
$policies = Util::get_store_policies( $store_id );
if ( empty( $policies ) ) {
    echo 'No policy found.';
}
    $policies_list = array(
        'store_policy'        => __( 'Store Policy', 'multivendorx' ),
        'shipping_policy'     => __( 'Shipping Policy', 'multivendorx' ),
        'refund_policy'       => __( 'Refund Policy', 'multivendorx' ),
        'cancellation_policy' => __( 'Cancellation / Return / Exchange Policy', 'multivendorx' ),
    );

    foreach ( $policies_list as $key => $label ) :
        if ( ! empty( $policies[ $key ] ) ) :
			?>
            <div class="accordion-item">
                <div class="accordion-header"><?php echo esc_html( $label ); ?></div>
                <div class="accordion-body"><?php echo wp_kses_post( $policies[ $key ] ); ?></div>
            </div>
			<?php
        endif;
    endforeach;
?>
