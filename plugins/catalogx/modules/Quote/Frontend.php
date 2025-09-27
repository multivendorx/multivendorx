<?php
/**
 * Quote module Frontend class file
 *
 * @package CatalogX
 */

namespace CatalogX\Quote;

use CatalogX\Utill;
use CatalogX\FrontendScripts;

/**
 * CatalogX Quote Module Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor functions
     */
    public function __construct() {
        if ( ! Util::is_available() ) {
			return;
        }

        $display_quote_button = CatalogX()->setting->get_setting( 'quote_user_permission', array() );
        if ( ! empty( $display_quote_button ) && ! is_user_logged_in() ) {
            return;
        }
        add_action( 'display_shop_page_button', array( $this, 'catalogx_add_quote_button' ) );
        add_action( 'woocommerce_after_shop_loop_item', array( $this, 'add_button_for_quote' ), 11 );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

        // Quote button shortcode.
        add_shortcode( 'catalogx_quote_button', array( $this, 'catalogx_quote_button_shortcode' ) );
    }

    /**
     * Enqueue frontend js
     *
     * @return void
     */
    public function enqueue_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::localize_scripts( 'catalogx-add-to-quote-cart-script' );
        if ( is_shop() || is_product() ) {
            FrontendScripts::enqueue_script( 'catalogx-add-to-quote-cart-script' );
        }
    }

    /**
     * Adds quote button on shop page via hook.
     *
     * @return void
     */
    public function catalogx_add_quote_button() {
        global $product;
        $render_button = CatalogX()->render_quote_btn_via;
        if ( empty( trim( CatalogX()->render_quote_btn_via ) ) ) {
            CatalogX()->render_quote_btn_via = 'hook';
            $this->add_button_for_quote( $product->get_id() );
        }
    }

    /**
     * Add quote button in single product page and shop page
     *
     * @param int|\WC_Product|null $product_obj Product object or ID. Falls back to global $product if null.
     * @return void
     */
    public function add_button_for_quote( $product_obj ) {
        global $product;

        $product_obj = is_int( $product_obj ) ? wc_get_product( $product_obj ) : ( $product_obj ? $product_obj : $product );

        if ( empty( $product_obj ) ) {
            return;
        }

        // Exclusion settings for shop and single product page.
        if ( ! Util::is_available_for_product( $product_obj->get_id() ) ) {
            return;
        }

        $quote_btn_text      = Utill::get_translated_string( 'add_to_quote', 'Add to Quote' );
        $view_quote_btn_text = Utill::get_translated_string( 'view_quote', 'View Quote' );

        $button_settings  = CatalogX()->setting->get_setting( 'quote_button' );
        $button_css       = Utill::get_button_styles( $button_settings );
        $button_hover_css = Utill::get_button_styles( $button_settings, true );

        if ( $button_hover_css ) {
            echo '<style>
                .catalogx-add-request-quote-button:hover{
                ' . esc_html( $button_hover_css ) . '
                } 
            </style>';
        }

        $quote_btn_text = ! empty( $button_settings['button_text'] ) ? $button_settings['button_text'] : $quote_btn_text;
        CatalogX()->util->get_template(
            'quote-button-template.php',
            array(
				'class'        => 'catalogx-add-request-quote-button ',
				'btn_css'      => $button_css,
				'wpnonce'      => wp_create_nonce( 'add-quote-' . $product_obj->get_id() ),
				'product_id'   => $product_obj->get_id(),
				'label'        => $quote_btn_text,
				'label_browse' => $view_quote_btn_text,
				'rqa_url'      => CatalogX()->quotecart->get_request_quote_page_url(),
				'exists'       => CatalogX()->quotecart->exists_in_cart( $product_obj->get_id() ),
            )
        );
    }

    /**
     * Quote button shortcode
     *
     * @param array $attr Shortcode attribute.
     * @return string
     */
    public function catalogx_quote_button_shortcode( $attr ) {
        global $product;
        if ( empty( trim( CatalogX()->render_quote_btn_via ) ) ) {
            CatalogX()->render_quote_btn_via = 'shortcode';
            ob_start();
            $product_id = isset( $attr['product_id'] ) ? (int) $attr['product_id'] : $product->get_id();
            $this->add_button_for_quote( $product_id );
            return ob_get_clean();
        }
    }
}
