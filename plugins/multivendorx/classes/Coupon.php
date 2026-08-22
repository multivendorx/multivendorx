<?php
/**
 * MultiVendorX Coupon restrictions class.
 *
 * Handles store-specific coupon validation in WooCommerce.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Coupon class.
 *
 * Restricts coupons so they are only valid for products from the same store.
 */
class Coupon {

    /**
     * Constructor.
     *
     * Hooks the coupon validation filter.
     */
    public function __construct() {
        add_filter( 'woocommerce_coupon_is_valid_for_product', array( $this, 'restrict_coupon_by_product_store' ), 10, 4 );
    }

    /**
     * Restrict coupon usage by product store.
     *
     * If the product's store ID does not match the coupon's store ID,
     * the coupon will be considered invalid for that product.
     *
     * @param bool        $is_valid Whether the coupon is valid.
     * @param \WC_Product $product  Product object being validated.
     * @param \WC_Coupon  $coupon   Coupon object being applied.
     * @param array       $values    Additional values passed by WooCommerce.
     *
     * @return bool True if coupon is valid for this product, false otherwise.
     */
    public function restrict_coupon_by_product_store( $is_valid, $product, $coupon, $values ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
        $coupon_store = get_post_meta(
            $coupon->get_id(),
            Utill::POST_META_SETTINGS['store_id'],
            true
        );

        if ( empty( $coupon_store ) ) {
            return $is_valid;
        }

        $product_id = $product->is_type( 'variation' ) ? $product->get_parent_id(): $product->get_id();

        $product_store = get_post_meta(
            $product_id,
            Utill::POST_META_SETTINGS['store_id'],
            true
        );

        // Ensure the coupon amount is only deducted from matching products.
        if ( (int) $product_store !== (int) $coupon_store ) {
            return false;
        }

        return $is_valid;
    }
}
