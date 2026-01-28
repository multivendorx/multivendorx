<?php

namespace MultiVendorX;

use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class Coupon
{

    public function __construct()
    {
        add_filter('woocommerce_coupon_is_valid_for_product', array($this, 'restrict_coupon_by_product_store'), 10, 4);
    }
    
    /**
     * Logic: If the product's Store ID does not match the Coupon's Store ID, 
     * return false so no discount is applied to this item.
     */
    public function restrict_coupon_by_product_store($is_valid, $product, $coupon, $values)
    {
        // 1. Get the Store ID assigned to the Coupon
        $coupon_store = get_post_meta(
            $coupon->get_id(),
            Utill::POST_META_SETTINGS['store_id'],
            true
        );

        if (empty($coupon_store)) {
            return $is_valid;
        }

        $product_store = get_post_meta(
            $product->get_id(),
            Utill::POST_META_SETTINGS['store_id'],
            true
        );

        // This ensures the coupon amount is only deducted from matching products.
        if ((int) $product_store !== (int) $coupon_store) {
            return false;
        }

        return $is_valid;
    }
}
