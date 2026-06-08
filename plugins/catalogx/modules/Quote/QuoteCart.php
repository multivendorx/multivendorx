<?php
/**
 * Modules REST API Quote Cart controller
 *
 * @package catalogx
 */

namespace CatalogX\Quote;

use CatalogX\Utill;


defined( 'ABSPATH' ) || exit;

/**
 * catalogx REST API Quote Cart controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      catalogx
 */
class QuoteCart extends \WP_REST_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'quote-cart';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            CatalogX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            CatalogX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array( $this, 'delete_item' ),
                    'permission_callback' => array( $this, 'delete_item_permissions_check' ), // Only admins can delete.
                ),
            )
        );
    }

    /**
     * Get items permissions check.
     *
     * @param object $request The request object.
     */
    public function get_items_permissions_check( $request ) {
        $user_id = CatalogX()->current_user_id;
        // For non-logged in user.
        if ( 0 === $user_id ) {
            return true;
        }

        // Check if user is admin or customer.
        return current_user_can( 'read' ) || current_user_can( 'manage_options' );
    }

    /**
     * Update item permissions check.
     *
     * @param object $request The request object.
     */
    public function update_item_permissions_check( $request ) {
        $user_id = CatalogX()->current_user_id;
        // For non-logged in user.
        if ( 0 === $user_id ) {
            return true;
        }

        // Check if user is admin or customer.
        return current_user_can( 'read' ) || current_user_can( 'manage_options' );
    }

    /**
     * Update item permissions check.
     *
     * @param object $request The request object.
     */
    public function delete_item_permissions_check( $request ) {
        $user_id = CatalogX()->current_user_id;
        // For non-logged in user.
        if ( 0 === $user_id ) {
            return true;
        }

        // Check if user is admin or customer.
        return current_user_can( 'read' ) || current_user_can( 'manage_options' );
    }

    /**
     * Get all items.
     *
     * @param object $request The request object.
     */
    public function get_items( $request ) {
        $nonce_validation = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_validation ) ) {
            return $nonce_validation;
        }

        try {
            $row  = $request->get_param( 'row' );
            $page = $request->get_param( 'page' );

            // Get all cart data.
            $all_cart_data = CatalogX()->quotecart->get_cart_contents();

            // Calculate pagination.
            $total_items = count( $all_cart_data );
            $offset      = ( $page - 1 ) * $row;

            // Slice data for current page.
            $paginated_cart_data = array_slice( $all_cart_data, $offset, $row );

            // Prepare the quote list.
            $quote_list = array();
            foreach ( $paginated_cart_data as $key => $item ) {
                $product   = wc_get_product( $item['product_id'] );
                $thumbnail = $product->get_image( apply_filters( 'catalogx_quote_cart_item_thumbnail_size', array( 84, 84 ) ) );
                $name      = '';
                if ( $item['variation'] ) {
                    foreach ( $item['variation'] as $label => $value ) {
                        $label = str_replace( array( 'attribute_pa_', 'attribute_' ), '', $label );
                        $name .= '<br>' . ucfirst( $label ) . ': ' . ucfirst( $value );
                    }
                }

                $product_price = (float) $product->get_price();
                $quantity      = isset( $item['quantity'] ) ? $item['quantity'] : 1;
                $subtotal      = $product_price * $quantity;

                $quote_list[] = apply_filters(
                    'catalogx_quote_list_data',
                    array(
                        'key'      => $key,
                        'id'       => $product->get_id(),
                        'image'    => $thumbnail,
                        'name'     => $product->get_name() . ( $name ? $name : '' ),
                        'quantity' => $item['quantity'],
                        'total'    => wc_price( $subtotal ),
                    ),
                    $product
                );
            }

            return rest_ensure_response(
                array(
                    'count'    => $total_items,
                    'response' => $quote_list,
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

    /**
     * Update an item.
     *
     * @param object $request The request object.
     */
    public function update_item( $request ) {

        $nonce_validation = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_validation ) ) {
            return $nonce_validation;
        }

        try {
            $products = $request->get_param( 'products' );

            foreach ( $products as $key => $product ) {
                $product_id = $product['id'];
                $quantity   = $product['quantity'];
                CatalogX()->quotecart->update_cart_item( $product['key'], 'quantity', $quantity );
                $update_msg = __( 'Quote cart updated!', 'catalogx' );
            }

            return rest_ensure_response( array( 'msg' => $update_msg ) );
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'catalogx' ),
                array( 'status' => 500 )
            );
        }
    }


    /**
     * Delete an item.
     *
     * @param object $request The request object.
     */
    public function delete_item( $request ) {

        $nonce_validation = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_validation ) ) {
            return $nonce_validation;
        }

        try {
            $product_id = $request->get_param( 'productId' );
            $key        = $request->get_param( 'key' );
            $status     = false;
            if ( $product_id && isset( $key ) ) {
                $status = CatalogX()->quotecart->remove_cart_item( $key );
            }
            return rest_ensure_response(
                array(
                    'status'    => $status,
                    'cart_data' => CatalogX()->quotecart->get_cart_contents(),
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
