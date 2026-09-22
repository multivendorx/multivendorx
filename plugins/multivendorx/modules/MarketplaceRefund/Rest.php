<?php
/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\MarketplaceRefund;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Refund controller.
 *
 * @class       Module class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Rest extends \WP_REST_Controller {


    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'refunds';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
        add_filter( 'woocommerce_rest_shop_order_schema', array( $this, 'add_refund_status' ) );
    }

    public function add_refund_status( $schema ) {
        $schema['properties']['status']['enum'][] = 'refund-requested';
        return $schema;
    }

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Get all refunds filtered by store, search, and date.
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'read_shop_orders', 'edit_shop_orders' ) );
    }

    /**
     * Get all refunds filtered by store, search, and date.
     *
     * @param \WP_REST_Request $request REST request object containing filters like:
     *                                   'row', 'page', 'store_id', 'search_action',
     *                                   'search_value', 'order_by', 'order', 'start_date', 'end_date'.
     * @return \WP_REST_Response|\WP_Error
     * @throws \Exception If an unexpected error occurs while fetching refunds.
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            // Parameters.
            $limit         = max( 100, (int) $request->get_param( 'row' ) );
            $page          = max( 1, (int) $request->get_param( 'page' ) );
            $store_id      = $request->get_param( 'store_id' );
            $search_action = strtolower( $request->get_param( 'search_action' ) );
            $search_value  = strtolower( trim( $request->get_param( 'search_value' ) ) );
            $order_by      = $request->get_param( 'order_by' );
            $order         = strtolower( $request->get_param( 'order' ) ) === 'asc' ? 'ASC' : 'DESC';
            $start_date    = $request->get_param( 'start_date' );
            $end_date      = $request->get_param( 'end_date' );

            // Pagination offset (Woo requires this).
            $offset = ( $page - 1 ) * $limit;

            if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
                $store_id = (int) MultiVendorX()->active_store;

                if ( ! StoreUtil::current_user_can_manage_store( $store_id ) ) {
                    return new \WP_Error(
                        'forbidden',
                        __( 'You cannot view refunds for this store.', 'multivendorx' ),
                        array( 'status' => 403 )
                    );
                }
            }

            $meta_query = array();

            if ( $store_id ) {
                $meta_query[] = array(
                    'key'     => Utill::POST_META_SETTINGS['store_id'],
                    'value'   => $store_id,
                    'compare' => '=',
                );
            } else {
                $meta_query[] = array(
                    'key'     => Utill::POST_META_SETTINGS['store_id'],
                    'compare' => 'EXISTS',
                );
            }

            // Date filter (BETWEEN only, site timezone aware).
            $date_filter = '';
            $normalized  = Utill::normalize_date_range( $start_date, $end_date );

            if ( $normalized['start_date'] && $normalized['end_date'] ) {
                $date_filter = $normalized['start_date'] . '...' . $normalized['end_date'];
            }

            // Count query (for correct totals).
            $count_args = array(
                'type'       => 'shop_order_refund',
                'meta_query' => $meta_query, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                'return'     => 'ids',
            );

            if ( $date_filter ) {
                $count_args['date_created'] = $date_filter;
            }

            $total = count( wc_get_orders( $count_args ) );

            // Build main query.
            $args = array(
                'type'       => 'shop_order_refund',
                'meta_query' => $meta_query, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                'limit'      => $limit,
                'offset'     => $offset,
                'return'     => 'objects',
                'paginate'   => false,
            );

            if ( $date_filter ) {
                $args['date_created'] = $date_filter;
            }

            if ( in_array( $order_by, array( 'date', 'order_id' ), true ) ) {
                $args['orderby'] = 'order_id' === $order_by ? 'ID' : 'date';
                $args['order']   = $order;
            }

            // Fetch refunds.
            $refunds = wc_get_orders( $args );

            // Search filtering (after fetch).
            if ( $search_action && $search_value ) {
                $refunds = array_filter(
                    $refunds,
                    function ( $refund ) use ( $search_action, $search_value ) {
                        $order = wc_get_order( $refund->get_parent_id() );
                        if ( ! $order ) {
                            return false;
                        }

                        switch ( $search_action ) {
                            case 'order_id':
                                return (string) $order->get_id() === $search_value;

                            case 'customer':
                                $name  = strtolower( $order->get_formatted_billing_full_name() );
                                $email = strtolower( $order->get_billing_email() );
                                return ( false !== strpos( $name, $search_value ) ) || ( false !== strpos( $email, $search_value ) );

                            default:
                                return true;
                        }
                    }
                );
                $refunds = array_values( $refunds );
            }

            // Build response data.
            $refund_list = array_map(
                function ( $refund ) {
                    $store_id   = $refund->get_meta( Utill::POST_META_SETTINGS['store_id'] );
                    $store      = new Store( $store_id );
                    $store_name = $store->exists() ? $store->get( 'name' ) : '';

                    $order = wc_get_order( $refund->get_parent_id() );

                    $customer_id    = $order ? $order->get_customer_id() : 0;
                    $customer_name  = $order ? $order->get_formatted_billing_full_name() : '';
                    $customer_email = $order ? $order->get_billing_email() : '';

                    return array(
                        'refund_id'          => $refund->get_id(),
                        'store_id'           => $store_id,
                        'store_name'         => $store_name,
                        'order_id'           => $refund->get_parent_id(),
                        'amount'             => $refund->get_amount(),
                        'reason'             => $refund->get_reason(),
                        'customer_reason'    => $order ? $order->get_meta( Utill::ORDER_META_SETTINGS['customer_refund_reason'], true ) : '',
                        'currency'           => $refund->get_currency(),
                        'date_created'       => $refund->get_date_created()
                            ? Utill::multivendorx_rest_prepare_date_response( $refund->get_date_created()->date_i18n( 'Y-m-d H:i:s' ) )
                            : '',
                        'date_created_gmt'   => $refund->get_date_created()
                            ? Utill::multivendorx_rest_prepare_date_response( $refund->get_date_created()->date_i18n( 'Y-m-d H:i:s' ), true )
                            : '',
                        'status'             => $refund->get_status(),
                        'customer_id'        => $customer_id,
                        'customer_name'      => $customer_name,
                        'customer_email'     => $customer_email,
                        'customer_edit_link' => $customer_id
                            ? admin_url( 'user-edit.php?user_id=' . $customer_id )
                            : '',
                    );
                },
                $refunds
            );

            // Manual sort for order_id if needed.
            if ( 'order_id' === $order_by ) {
                usort(
                    $refund_list,
                    fn ( $a, $b ) =>
                        ( 'ASC' === $order )
                            ? $a['order_id'] <=> $b['order_id']
                            : $b['order_id'] <=> $a['order_id']
                );
            }

            $response = rest_ensure_response( $refund_list );
            $response->header( 'X-WP-Total', $total );
            $response->header( 'X-WP-TotalPages', (int) ceil( $total / $limit ) );

            return $response;
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }
}
