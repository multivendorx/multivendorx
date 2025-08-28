<?php

namespace MultiVendorX;

/**
 * MultiVendorX Frontend class
 *
 * @class 		Frontend class
 * @version		PRODUCT_VERSION
 * @author 		MultiVendorX
 */
class Frontend {
    /**
     * Frontend class construct function
     */
    public function __construct() {
        add_filter('template_include', array($this, 'vendor_dashboard_template'));

        // add_filter('woocommerce_login_redirect', array($this, 'multivendorx_store_login'), 10, 2);
    }

    public function vendor_dashboard_template($template) {
        //checking change later when all function ready
        if (  is_user_logged_in() && is_page() && has_shortcode(get_post()->post_content, 'multivendorx_store_dashboard') ) {
            return MultiVendorX()->plugin_path . 'templates/store-dashboard.php';
        }
        return $template;
    }

    public function multivendorx_store_login() {
        MultiVendorX()->plugin_path . 'templates/store-dashboard.php';
    }

}