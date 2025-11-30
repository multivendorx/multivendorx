<?php
use MultiVendorX\Store\StoreUtil;

global $product;
$html = '';

$store = StoreUtil::get_products_store( $product->get_id() );
if ( $store ) {
    $html .= apply_filters( 'mvx_before_seller_info_tab', '' );

    $details = MultiVendorX()->frontend->show_store_info( $product->get_id() );
    if ( $details ) {
        // Filter to control whether to show "Meet our ..." format
        $show_meet_text = apply_filters( 'mvx_show_meet_seller_text', true, $details );

        if ( $show_meet_text ) {
            $store_url       = esc_url( MultiVendorX()->store->storeutil->get_store_url( $store->get_id() ) );
            $store_name_link = sprintf(
                '<a href="%1$s">%2$s</a>',
                $store_url,
                esc_html( $details['name'] )
            );

            $heading_text = sprintf(
                __( 'Meet our %1$s of shop %2$s', 'multivendorx' ),
                esc_html( $details['owner_name'] ),
                $store_name_link
            );
        } else {
            $heading_text = esc_html( $details['name'] );
        }

        // Start vendor info block
        $html .= '<div class="product-store-info">';
        $html .= '<div class="header">' . $details['logo_html'];
        $html .= '<div class="heading-wrapper"> <h4 class="heading">' . $heading_text . '</h4>';

        $rating_html = '<div class="admin-badge yellow"> <i class="adminlib-star"></i> 4.0 <span>(4523)</span></div> '
            // . apply_filters('mvx_follow_button_html', '', $store->get_id(), get_current_user_id())
            . '</div> </div>';
        $html .= $rating_html;

        if ( ! empty( $details['address'] ) ) {
            $html .= '<div class="store-info"> <i class="adminlib-location"></i>' . esc_html( $details['address'] ) . '</div>';
        }

        $store_details = MultiVendorX()->setting->get_setting( 'store_branding_details', array() );
        if ( in_array( 'show_store_description', $store_details ) && ! empty( $details['description'] ) ) {
            $html .= '<div class="store-description">' . apply_filters( 'the_content', $details['description'] ) . '</div>';
        }

        if ( ! empty( $details['phone'] ) ) {
            $html .= '<div class="store-info"><i class="adminlib-form-phone"></i>' . esc_html( $details['phone'] ) . '</div>';
        }

        if ( ! empty( $details['email'] ) ) {
            $html .= '<div class="store-info"><i class="adminlib-mail"></i> ' . esc_html( $details['email'] ) . '</div>';
        }

        $html .= '<a class="button product_type_simple" href="' . esc_url( MultiVendorX()->store->storeutil->get_store_url( $store->get_id() ) ) . '">'
            . sprintf( __( 'More Products from %1$s', 'multivendorx' ), $store->get( 'name' ) ) . '</a>';

        $html .= '</div>'; // .mvx-vendor-info
    }

    $html .= apply_filters( 'mvx_after_seller_info_tab', '' );

    echo $html;

    do_action( 'mvx_after_vendor_tab' );
}
