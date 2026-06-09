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
        // add quote table css (didi)
        // if ( is_product() || is_shop() || is_account_page() ) {
            FrontendScripts::enqueue_style( 'catalogx-frontend-style' );
        // }
    }
}