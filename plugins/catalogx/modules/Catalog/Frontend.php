<?php
/**
 * Catalog module Frontend class file
 *
 * @package CatalogX
 */

namespace CatalogX\Catalog;

/**
 * CatalogX Catalog Module Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        // Check the exclusion.
        if ( ! Util::is_available() ) {
			return;
        }

        // Cart page redirect settings.
        add_action( 'template_redirect', array( $this, 'catalogx_redirect_page' ), 10 );

        // Display single product page description box.
        add_action( 'woocommerce_product_meta_start', array( self::class, 'show_description_box' ) );

        // Hooks for exclusions.
        add_filter( 'woocommerce_get_price_html', array( $this, 'exclude_price_for_selected_product' ), 10, 2 );

        add_filter( 'woocommerce_loop_add_to_cart_link', array( $this, 'exclude_add_to_cart_button' ), 10, 2 );

        add_action( 'woocommerce_single_product_summary', array( $this, 'remove_add_to_cart_on_single_product_page' ), 5 );

    }

    /**
     * Redirect cart and checkout page to home page
     *
     * @return void
     */
    public static function catalogx_redirect_page() {
        if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
            return;
        }
        // For exclusion.
        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $product_id = $cart_item['product_id'];
            if ( ! Util::is_available_for_product( $product_id ) ) {
                return;
            }
        }

        // Get setting for sales enabled.
        $sales_enabled = CatalogX()->setting->get_setting( 'enable_cart_checkout' );

        // Check sales enabled setting is enable or not.
        if ( ! empty( $sales_enabled ) ) {
			return;
        }

        // Get cart and checkout page id.
        $cart_page_id     = wc_get_page_id( 'cart' );
        $checkout_page_id = wc_get_page_id( 'checkout' );

        // Redirect to redirect url if page is cart page or checkout page.
        if ( is_page( $cart_page_id ) || is_page( $checkout_page_id ) ) {
            wp_safe_redirect( home_url() );
            exit;
        }
    }

    /**
     * Display single product page description box
     *
     * @return void
     */
    public static function show_description_box() {
        global $post;

        if ( ! Util::is_available_for_product( $post->ID ) ) {
            return;
        }

        ?>
        <div class="desc-box">
            <?php
            $catalog_per_product_desc = get_post_meta( $post->ID, 'catalog_per_product_desc', true );
            $input_box                = ! empty( $catalog_per_product_desc ) ? $catalog_per_product_desc : CatalogX()->setting->get_setting( 'additional_input' );
            if ( $input_box ) {
				?>
                <div class="desc">
                    <?php echo wp_kses_post( $input_box ); ?>
                </div>
            <?php } ?>
        </div>
        <?php
    }

    /**
     * Price exclusion for shop page
     *
     * @param string      $price   The original price HTML.
     * @param \WC_Product $product The WooCommerce product object.
     * @return string              The modified (or original) price HTML.
     */
    public function exclude_price_for_selected_product( $price, $product ) {
        $price_hide_product_page = CatalogX()->setting->get_setting( 'hide_product_price' );

        if ( Util::is_available_for_product( $product->get_id() ) && $price_hide_product_page && is_shop() ) {
            return '';
        }

        return $price;
    }

    /**
     * Shop page add to cart button exclusion for block
     *
     * @param string      $button  The HTML for the add to cart button.
     * @param \WC_Product $product The WooCommerce product object.
     * @return string              The modified (or original) button HTML.
     */
    public function exclude_add_to_cart_button( $button, $product ) {
        if ( ! Util::is_available_for_product( $product->get_id() ) ) {
            return $button;
        }

        return empty( CatalogX()->setting->get_setting( 'enable_cart_checkout' ) ) ? '' : $button;
    }

    /**
     * Single product page add to cart button exclusion
     *
     * @return void
     */
    public function remove_add_to_cart_on_single_product_page() {
        global $post;

        if ( Util::is_available_for_product( $post->ID ) && is_product() && empty( CatalogX()->setting->get_setting( 'enable_cart_checkout' ) ) ) {
            remove_action( 'woocommerce_single_variation', 'woocommerce_single_variation_add_to_cart_button', 20 );
            // for block support.
            remove_action( 'woocommerce_simple_add_to_cart', 'woocommerce_simple_add_to_cart', 30 );
        }
    }

}