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
    }

    /**
     * Function to enqueue and localize necessary scripts.
     *
     * @return void
     */
    public function frontend_scripts() {
        if ( CatalogX()->modules->is_active( 'quote' ) ) {
            FrontendScripts::load_scripts();
            FrontendScripts::localize_scripts( 'catalogx-quote-cart-script' );
            FrontendScripts::enqueue_script( 'catalogx-quote-cart-script' );
            FrontendScripts::enqueue_style( 'catalogx-frontend-style' );
        }
    }

    /**
     * Display the request quote container and enqueue necessary frontend scripts.
     *
     * @return string HTML output for the request quote section.
     */
    public function display_request_quote() {
        $this->frontend_scripts();
        ob_start();
        ?>
        <div id="request-quote-list">
        </div>
        <?php
        return ob_get_clean();
    }
}
