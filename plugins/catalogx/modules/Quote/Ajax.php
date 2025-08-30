<?php
/**
 * Quote module Ajax class file
 *
 * @package CatalogX
 */

namespace CatalogX\Quote;

/**
 * CatalogX Quote Module Ajax class
 *
 * @class       Ajax class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Ajax {
    /**
     * Ajax class constructor functions.
     */
    public function __construct() {
        // quote.
        add_action( 'wp_ajax_quote_added_in_list', array( $this, 'add_item_in_cart' ) );
        add_action( 'wp_ajax_nopriv_quote_added_in_list', array( $this, 'add_item_in_cart' ) );
    }

    /**
     * Add item in quote cart
     */
    public function add_item_in_cart() {
        $return             = 'false';
        $message            = '';
        $product_id         = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT );
        $variation_id       = filter_input( INPUT_POST, 'variation_id', FILTER_VALIDATE_INT );
        $is_valid_variation = ( null !== $variation_id ) ? ( false !== $variation_id ) : true;

        $is_valid = $product_id && $is_valid_variation ? true : false;

        $postdata = filter_input_array( INPUT_POST, FILTER_SANITIZE_FULL_SPECIAL_CHARS );

        if ( ! $is_valid ) {
            $errors[] = __( 'Error occurred while adding product to Request a Quote list.', 'catalogx' );
        } else {
            $return = CatalogX()->quotecart->add_cart_item( $postdata );
        }

        if ( 'true' === $return ) {
            $message = __( 'Product added to quote list.', 'catalogx' );
        } elseif ( 'exists' === $return ) {
            $message = __( 'Product already in your quote list.', 'catalogx' );
        } else {
            $message = $errors;
        }

        wp_send_json(
            array(
				'result'  => $return,
				'message' => $message,
				'rqa_url' => CatalogX()->quotecart->get_request_quote_page_url(),
            )
        );
    }
}
