<?php
/**
 * Frontend class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Fontend class constructor functions
     */
    public function __construct() {
        add_action( 'wp', array( $this, 'display_price_and_description' ) );
        // Enqueue frontend scripts.
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
    }

    /**
     * Enqueue script
     *
     * @return void
     */
    public function enqueue_frontend_assets() {
        FrontendScripts::enqueue_frontend_assets();
        if ( is_product() || is_shop() || is_account_page() ) {
            FrontendScripts::enqueue_style( 'catalogx-frontend-style' );
        }
    }

    /**
     * Display product price and description in single product page.
     *
     * @return void
     */
    public function display_price_and_description() {
        $price_hide_product_page = CatalogX()->setting->get_setting( 'hide_product_price' );
        if ( $price_hide_product_page && is_product() ) {
            add_filter( 'woocommerce_show_variation_price', '__return_false' );
            remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_price', 10 );
            remove_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_price', 10 );
            // for block support.
            add_filter( 'woocommerce_get_price_html', '__return_empty_string' );
        }

        $desc_hide_product_page = CatalogX()->setting->get_setting( 'hide_product_desc' );
        if ( $desc_hide_product_page ) {
            remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_excerpt', 20 );
            // for block support.
            add_filter( 'woocommerce_short_description', '__return_empty_string' );
            add_filter( 'render_block_core/post-excerpt', '__return_empty_string' );
        }
    }
}