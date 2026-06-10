<?php
/**
 * Modules REST API Quote controller
 *
 * @package catalogx
 */

namespace CatalogX\Quote;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * catalogx REST API Quote controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      catalogx
 */
class QuoteAdd extends \WP_REST_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'quote/add';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            CatalogX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => '__return_true',
                ),
            )
        );
    }

    /**
     * Get items permissions check.
     *
     * @param object $request The request object.
     */
    public function create_item_permissions_check( $request ) {
        $user_id = CatalogX()->current_user_id;
        // For non-logged in user.
        if ( 0 === $user_id ) {
            return true;
        }

        // Check if user is admin or customer.
        return current_user_can( 'read' ) || current_user_can( 'manage_options' );
    }


    /**
     * create an item.
     *
     * @param object $request The request object.
     */
    public function create_item( $request ) {

        $nonce_validation = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_validation ) ) {
            return $nonce_validation;
        }

        try {
            $return  = 'false';
            $message = '';
            $errors  = array();

            $product_id = absint(
                $request->get_param( 'product_id' )
            );

            $variation_id = absint(
                $request->get_param( 'variation_id' )
            );

            $postdata = $request->get_params();

            $is_valid_variation = ( null !== $variation_id )
                ? ( false !== $variation_id )
                : true;

            $is_valid = $product_id && $is_valid_variation;

            if ( ! $is_valid ) {

                $errors[] = __(
                    'Error occurred while adding product to Request a Quote list.',
                    'catalogx'
                );

            } else {

                $return = CatalogX()->quotecart->add_quote_item( $postdata );

            }

            if ( 'true' === $return ) {

                $message = __(
                    'Product added to quote list.',
                    'catalogx'
                );

            } elseif ( 'exists' === $return ) {

                $message = __(
                    'Product already in your quote list.',
                    'catalogx'
                );

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
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'catalogx' ),
                array( 'status' => 500 )
            );
        }
    }
}
