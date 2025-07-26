<?php

namespace MultiVendorX;

/**
 * MultiVendorX Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultivendorX
 */
class Frontend {
    /**
     * Frontend class construct function
     */
    public function __construct() {
        add_filter( 'template_include', array( $this, 'vendor_dashboard_template' ) );
    }

    public function vendor_dashboard_template( $template ) {
		if ( is_page() && has_shortcode( get_post()->post_content, 'multivendorx_vendor_dashboard' ) ) {
			return MultiVendorX()->plugin_path . 'templates/vendor-dashboard.php';
		}
		return $template;
	}
}
