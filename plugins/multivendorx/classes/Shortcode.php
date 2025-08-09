<?php

namespace MultiVendorX;

/**
 * MultiVendorX Shortcode class
 *
 * @class 		Shortcode class
 * @version		PRODUCT_VERSION
 * @author 		MultiVendorX
 */
class Shortcode {
    /**
     * Shortcode class construct function
     */
    public function __construct() {
        add_shortcode( 'multivendorx_vendor_dashboard', [ $this, 'display_vendor_dashboard' ] );
    }

    public function frontend_scripts() {
            wp_enqueue_script( 'wp-element' );
            FrontendScripts::load_scripts();
            FrontendScripts::enqueue_script( 'multivendorx-dashboard-components-script' );
            FrontendScripts::enqueue_script( 'multivendorx-dashboard-script' );
    }

    public function display_vendor_dashboard() {
        $this->frontend_scripts();
        ob_start();

        MultiVendorX()->plugin_path . 'templates/vendor-dashboard.php';
        // <div id="multivendorx-vendor-dashboard">
        // </div> 
        return ob_get_clean();
    }
    
} 