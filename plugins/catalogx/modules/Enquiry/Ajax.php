<?php
/**
 * Enquiry module Ajax class file
 *
 * @package CatalogX
 */

namespace CatalogX\Enquiry;

/**
 * CatalogX Enquiry Module Ajax class
 *
 * @class       Ajax class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Ajax {
    /**
     * Ajax class constructor function.
     */
    public function __construct() {
        add_action( 'wp_ajax_add_variation_for_enquiry_mail', array( $this, 'add_variation_for_enquiry_mail' ) );
		add_action( 'wp_ajax_nopriv_add_variation_for_enquiry_mail', array( $this, 'add_variation_for_enquiry_mail' ) );
    }

    /**
     * Handle Ajax request to store variation data for enquiry mail.
     *
     * @return void
     */
    public function add_variation_for_enquiry_mail() {
        $product_id = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT );

        if ( $product_id ) {
            $variation_payload = filter_input( INPUT_POST, 'variation_payload', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
            set_transient( 'variation_list', $variation_payload, 30 * MINUTE_IN_SECONDS );
        }

        wp_die();
    }
}
