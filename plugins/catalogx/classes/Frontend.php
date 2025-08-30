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
        add_action( 'init', array( $this, 'display_button_group' ) );
        add_action( 'wp', array( $this, 'display_price_and_description' ) );
        // Enqueue frontend scripts.
        add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );
    }

    /**
     * Enqueue script
     *
     * @return void
     */
    public function frontend_scripts() {
        FrontendScripts::load_scripts();
        if ( is_product() || is_shop() || is_account_page() ) {
            FrontendScripts::enqueue_style( 'catalogx-frontend-style' );
        }
    }

    /**
     * Register button group display function in shop pages.
     *
     * @return void
     */
    public function display_button_group() {
        // Get shop page button settings.
        $position_settings = CatalogX()->setting->get_setting( 'shop_page_possition_setting', array() );

        // Priority of colide position.
        $possiton_priority = 1;

        // Possiotion after a particular section.
        $possition_after = 'sku_category';

        // If possition settings exists.
        if ( $position_settings ) {
            // Get the colide possition priority.
            $possiton_priority = array_search( 'custom_button', array_keys( $position_settings ), true ) + 1;

            // Get the possition after.
            $possition_after = $position_settings['custom_button'];
        }

        // Display button group in a hooked based on possition setting.
        switch ( $possition_after ) {
            case 'sku_category':
                add_action( 'woocommerce_product_meta_end', array( $this, 'add_button_group' ), 99 + $possiton_priority );
                break;
            case 'add_to_cart':
                add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'add_button_group' ), 99 + $possiton_priority );
                break;
            case 'product_description':
                add_action( 'woocommerce_before_add_to_cart_form', array( $this, 'add_button_group' ), 99 + $possiton_priority );
                break;
            case 'price_section':
                add_action( 'woocommerce_single_product_summary', array( $this, 'add_button_group' ), 10 + $possiton_priority );
                break;
            default:
                add_action( 'woocommerce_single_product_summary', array( $this, 'add_button_group' ), 6 + $possiton_priority );
                break;
        }
    }

    /**
     * Display all button group
     *
     * @return void
     */
    public function add_button_group() {
        ?>
        <!-- single-product-page-action-btn-catalogx -->
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