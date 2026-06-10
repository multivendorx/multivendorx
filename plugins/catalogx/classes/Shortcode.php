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
}
