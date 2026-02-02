<?php

/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Privacy;

use MultiVendorX\Store\Store;

/**
 * MultiVendorX Store Policy Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {

    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        $privacy_settings = MultiVendorX()->setting->get_setting( 'store_branding_details', array() );
        if ( ! empty( $privacy_settings ) ) {
            // Add store tab in single product page.
            add_filter( 'woocommerce_product_tabs', array( $this, 'add_store_tab_in_single_product' ) );
        }

        if ( in_array( 'show_store_name', $privacy_settings, true ) ) {
            // Add sold by in cart page.
            add_action( 'woocommerce_get_item_data', array( $this, 'add_sold_by_in_cart' ), 30, 2 );
            // Add sold by in shop page.
            add_action( 'woocommerce_after_shop_loop_item', array( $this, 'add_sold_by_in_shop_and_single_product_page' ), 6 );
            // Add sold by in single product page.
            add_action( 'woocommerce_product_meta_start', array( $this, 'add_sold_by_in_shop_and_single_product_page' ), 25 );
        }
    }
    /**
     * Add store tab in single product page
     *
     * @param array $tabs Tabs.
     */
    public function add_store_tab_in_single_product( $tabs ) {
        global $product;
        if ( $product ) {
            $store = Store::get_store( $product->get_id(), 'product' );
            if ( $store ) {
                $title         = __( 'Store', 'multivendorx' );
                $tabs['store'] = array(
                    'title'    => $title,
                    'priority' => 20,
                    'callback' => array( $this, 'woocommerce_product_store_tab' ),
                );
            }
        }
        return $tabs;
    }

    /**
     * Store tab content
     */
    public function woocommerce_product_store_tab() {
        MultiVendorX()->util->get_template( 'store/store-single-product-tab.php' );
    }

    /**
     * Add store name in cart.
     *
     * @param array $item_data Existing item data array.
     * @param array $cart_item Cart item data.
     * @return array Modified item data.
     */
    public function add_sold_by_in_cart( $item_data, $cart_item ) {
        if ( apply_filters( 'multivendorx_sold_by_text_in_cart_checkout', true, $cart_item['product_id'] ) ) {
            $product_id = $cart_item['product_id'];
            $details    = Util::show_store_info( $product_id );

            if ( ! empty( $details ) ) {
                $sold_by_text = apply_filters(
                    'multivendorx_sold_by_text',
                    __( 'Sold By', 'multivendorx' ),
                    $product_id
                );

                $item_data[] = array(
                    'name'  => esc_html( $sold_by_text ),
                    'value' => esc_html( $details['name'] ),
                );
            }
        }

        return $item_data;
    }
    /**
     * Add store name in shop and single product page
     */
    public function add_sold_by_in_shop_and_single_product_page() {
        global $post;

        if ( apply_filters( 'multivendorx_sold_by_text_after_products_shop_page', true, $post->ID ) ) {
            $details = Util::show_store_info( ( $post->ID ) );

            if ( ! empty( $details ) ) {
                $sold_by_text = apply_filters( 'multivendorx_sold_by_text', __( 'Sold By', 'multivendorx' ), $post->ID );

                echo '<a class="by-store-name-link" style="display:block;" target="_blank" href="'
                    . esc_url( MultiVendorX()->store->storeutil->get_store_url( $details['id'] ) ) . '">'
                    . esc_html( $sold_by_text ) . ' '
                    . esc_html( $details['name'] )
                    . '</a>';
            }
        }
    }
}
