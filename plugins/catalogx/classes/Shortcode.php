<?php
/**
 * Shortcode class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Shortcode class
 *
 * @class       Shortcode class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Shortcode {
    /**
     * Shortcode class construct function
     */
    public function __construct() {
        // For quote page.
        add_shortcode( 'catalogx_request_quote', array( $this, 'display_request_quote' ) );
        add_shortcode( 'catalogx_excluded_products', array( $this, 'excluded_products' ) );

        add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );
    }

    /**
     * Function to enqueue and localize necessary scripts.
     *
     * @return void
     */
    public function frontend_scripts() {
        wp_deregister_style( 'wc-blocks-style' );
        if ( CatalogX()->modules->is_active( 'quote' ) ) {
            FrontendScripts::enqueue_frontend_assets();
            FrontendScripts::enqueue_script( 'catalogx-quote-cart-view-script' );
            FrontendScripts::localize_scripts( 'catalogx-quote-cart-view-script' );
        }
        FrontendScripts::enqueue_script( 'catalogx-excluded-products-view-script' );
        FrontendScripts::localize_scripts( 'catalogx-excluded-products-view-script' );
        FrontendScripts::enqueue_style( 'catalogx-frontend-style' );
    }

    /**
     * Display the request quote container and enqueue necessary frontend scripts.
     *
     * @return string HTML output for the request quote section.
     */
    public function display_request_quote() {
        ob_start();
        ?>
        <div id="request-quote-list">
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Display excluded products.
     *
     * @param array $attributes Block or shortcode attributes.
     * @return string HTML container for excluded products.
     */
    public function excluded_products( $attributes ) {
        $attributes = shortcode_atts(
            array(
                'include_types' => '',
            ),
            $attributes,
            'catalogx_excluded_products'
        );

        $json_attrs = esc_attr(
            wp_json_encode(
                array(
                    'includeTypes' => array_filter( array_map( 'trim', explode( ',', $attributes['include_types'] ) ) ),
                )
            )
        );

        return '<div id="catalogx-excluded-products" data-attributes="' . $json_attrs . '"></div>';
    }

}
