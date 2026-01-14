<?php

/**
 * Store Single Product Tab Template.
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-single-product-tab.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

use MultiVendorX\Store\Store;
use MultiVendorX\Privacy\Util;

global $product;
$html = '';
$store = Store::get_store($product->get_id(), 'product');
if ($store) {
    $html .= apply_filters('mvx_before_seller_info_tab', '');

    $details = Util::show_store_info($product->get_id());
    $store_branding_details = MultiVendorX()->setting->get_setting('store_branding_details', array());

    if ($details) {
        // Filter to control whether to show "Meet our ..." format.
        $show_meet_text = apply_filters('mvx_show_meet_seller_text', true, $details);

        if ($show_meet_text) {
            $store_url       = esc_url(MultiVendorX()->store->storeutil->get_store_url($store->get_id()));
            $store_name_link = sprintf(
                '<a href="%1$s">%2$s</a>',
                $store_url,
                esc_html($details['name'])
            );

            $heading_text = sprintf(
                // translators: %1$s is the vendor/owner name, %2$s is the clickable store name link.
                __('Meet our %1$s of shop %2$s', 'multivendorx'),
                esc_html($details['owner_name']),
                $store_name_link
            );
        } else {
            $heading_text = esc_html($details['name']);
        }

        // Start vendor info block.
        $html .= '<div class="product-store-info">';
        $html .= '<div class="header">';

        if (in_array('show_store_logo_next_to_products', $store_branding_details, true)) {
            $html .= $details['logo_html'];
        }

        $html .= '<div class="heading-wrapper">';

        if (in_array('show_store_name', $store_branding_details, true)) {
            $html .= '<h4 class="heading">' . $heading_text . '</h4>';
        }

        if ( in_array( 'show_store_ratings', $store_branding_details, true ) ) {
            $rating_value = number_format( (float) $details['overall_reviews'], 1 );
            $review_count = (int) ( $details['total_reviews'] ?? 0 );
        
            $html .= '<div class="store-rating">
                <i class="dashicons dashicons-star-filled"></i><i class="dashicons dashicons-star-filled"></i><i class="dashicons dashicons-star-filled"></i><i class="dashicons dashicons-star-filled"></i><i class="dashicons dashicons-star-filled"></i> '
                . esc_html( $rating_value ) .
                ' <span>(' . esc_html( $review_count ) . ')</span>
            </div>';
        }
        
        $html .= '</div></div>';
        
        $store_contact_details = MultiVendorX()->setting->get_setting('store_contact_details', array());

        if (in_array('show_store_owner_info', $store_contact_details, true) && ! empty($details['address'])) {
            $html .= '<div class="store-info"> <i class="adminlib-location"></i>' . esc_html($details['address']) . '</div>';
        }

        if (in_array('show_store_description', $store_branding_details, true) && ! empty($details['description'])) {
            $html .= '<div class="store-description">' . apply_filters('the_content', $details['description']) . '</div>';
        }

        if ( in_array( 'show_store_phone', $store_contact_details, true ) && ! empty( $details['phone'] ) ) {
            $html .= '<div class="store-info"><i class="dashicons dashicons-phone"></i>'
                . esc_html( $details['phone'] ) .
            '</div>';
        }
        

        if ( in_array( 'show_store_email', $store_contact_details, true ) && ! empty( $details['email'] ) ) {
            $html .= '<div class="store-info"><i class="dashicons dashicons-email"></i> '
                . esc_html( $details['email'] ) .
            '</div>';
        }

        $html .= '<a class="button wp-element-button" href="' . esc_url(MultiVendorX()->store->storeutil->get_store_url($store->get_id())) . '">'
            // translators: %1$s is the store/vendor name.
            . sprintf(__('More Products from %1$s', 'multivendorx'), $store->get('name')) . '</a>';

        $html .= '</div>'; // .mvx-vendor-info
    }

    $html .= apply_filters('mvx_after_seller_info_tab', '');

    echo wp_kses_post($html);

    do_action('mvx_after_vendor_tab');
}
