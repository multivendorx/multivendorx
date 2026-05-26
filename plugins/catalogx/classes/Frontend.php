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
        add_action( 'init', array( $this, 'register_button_group_position' ) );
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
     * Register button group display function in shop pages.
     *
     * @return void
     */
    public function register_button_group_position() {
        // Get shop page button settings.
        $position_settings = CatalogX()->setting->get_setting( 'shop_page_position_setting', array() );

        // Priority of collide position.
        $position_priority = 1;

        // Position after a particular section.
        $position_after = 'sku_category';

        // If position settings exists.
        if ( $position_settings ) {
            // Get the collide position priority.
            $position_priority = array_search( 'custom_button', array_keys( $position_settings ), true ) + 1;

            // Get the position after.
            $position_after = $position_settings['custom_button'];
        }

        // Display button group in a hooked based on position setting.
        $hook_map = array(
            'sku_category'        => 'woocommerce_product_meta_end',
            'add_to_cart'         => 'woocommerce_after_add_to_cart_button',
            'product_description' => 'woocommerce_before_add_to_cart_form',
            'price_section'       => 'woocommerce_single_product_summary',
        );

        $hook = $hook_map[ $position_after ] ?? 'woocommerce_single_product_summary';

        // Determine priority based on hook
        $priority = match ( $position_after ) {
            'price_section' => 10 + $position_priority,
            default         => 99 + $position_priority,
        };

        add_action( $hook, array( $this, 'add_button_group' ), $priority );
    }

    /**
     * Display all button group
     *
     * @return void
     */
    public function add_button_group() {
        ?>
            <div class="single-product-page-action-btn-catalogx">
                <?php do_action( 'display_shop_page_button' ); ?>
            </div>
        <?php
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