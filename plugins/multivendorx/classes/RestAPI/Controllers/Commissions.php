<?php

/**
 * MultiVendorX REST API Controller for Commission
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Controller for Commission.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Commissions extends \WP_REST_Controller {




    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'commission';

    /**
     * Register routes.
     *
     * @return void
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

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                    'args'                => array(
                        'id' => array( 'required' => true ),
                    ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );
    }

    /**
     * GET permission check.
     *
     * @param object $request Request data.
     * @return bool
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' ); // phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * PUT permission check.
     *
     * @param object $request Request data.
     * @return bool
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'edit_stores' ); // phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * GET all commissions.
     *
     * @param object $request Request data.
     * @return object
     */
    public function get_items( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            // Check if CSV download is requested.
            $store_id = $request->get_param( 'store_id' );

            if ( 'reports' === $format ) {
                $top_stores = $request->get_param( 'top_stores' );
                $dashboard  = $request->get_param( 'dashboard' );
                $start_date = $request->get_param( 'start_date' );
                $end_date   = $request->get_param( 'end_date' );
                $args       = array(
                    'start_date' => $start_date,
                    'end_date'   => $end_date,
                );

                if ( $dashboard ) {
                    if ( get_transient( Utill::MULTIVENDORX_TRANSIENT_KEYS['report_transient'] . $store_id ) ) {
                        return get_transient( Utill::MULTIVENDORX_TRANSIENT_KEYS['report_transient'] . $store_id );
                    }
                    $results = CommissionUtil::get_commission_summary_for_store( $store_id, $dashboard, false, null, $args );
                    if ( ! empty( $results ) ) {
                        set_transient( Utill::MULTIVENDORX_TRANSIENT_KEYS['report_transient'] . $store_id, $results, DAY_IN_SECONDS );
                    }
                    return $results;
                }

                if ( $store_id ) {
                    return CommissionUtil::get_commission_summary_for_store( $store_id );
                }

                if ( $top_stores ) {
                    return CommissionUtil::get_commission_summary_for_store( null, false, $top_stores, $top_stores );
                }

                return CommissionUtil::get_commission_summary_for_store();
            }

            $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
            $page   = max( intval( $request->get_param( 'page' ) ), 1 );
            $status = $request->get_param( 'status' );
            $ids    = $request->get_param( 'ids' );

            $range = Utill::normalize_date_range(
                $request->get_param( 'start_date' ),
                $request->get_param( 'end_date' )
            );

            // Sorting params.
            $order_by      = sanitize_text_field( $request->get_param( 'order_by' ) );
            $order         = sanitize_text_field( $request->get_param( 'order' ) );
            $search_action = sanitize_text_field( $request->get_param( 'search_action' ) );
            $search_value  = sanitize_text_field( $request->get_param( 'search_value' ) );

            // Prepare filter.
            $filter = array();

            if ( ! empty( $store_id ) ) {
                $filter['store_id'] = intval( $store_id );
            }

            if ( ! empty( $status ) ) {
                $filter['status'] = $status;
            }

            if ( ! empty( $range['start_date'] ) && ! empty( $range['end_date'] ) ) {
                $filter['start_date'] = $range['start_date'];
                $filter['end_date']   = $range['end_date'];
            }
            if ( ! empty( $search_value ) && is_numeric( $search_value ) ) {
                unset( $filter['start_date'], $filter['end_date'] );
                switch ( $search_action ) {
                    case 'commission_id':
                        $filter['ID'] = (int) $search_value;
                        break;

                    case 'order_id':
                        $filter['order_id'] = (int) $search_value;
                        break;

                    case 'all':
                    default:
                        $filter['ID']        = (int) $search_value;
                        $filter['order_id']  = (int) $search_value;
                        $filter['condition'] = 'OR';
                        break;
                }
            }
            if ( $ids ) {
                $filter['ID'] = $ids;
            }
            // Default: latest first
            $filter['orderBy'] = $order_by ?: 'created_at';
            $filter['order']   = strtolower( $order ) === 'asc' ? 'ASC' : 'DESC';

            // Fetch commissions.
            $commissions = CommissionUtil::get_commission_information(
                array_merge(
                    $filter,
                    array(
                        'limit'  => $limit,
                        'offset' => ( $page - 1 ) * $limit,
                    )
                )
            );

            $formatted_commissions = array();

            foreach ( $commissions as $commission ) {
                $formatted_commissions[] = $this->prepare_item_for_response( $commission, $request );
            }

            // Base filter for counts.
            $base_filter = array();

            if ( ! empty( $store_id ) ) {
                $base_filter['store_id'] = (int) $store_id;
            }

            // Commission statuses to count.
            $statuses = array(
                'all'                => null,
                'paid'               => 'paid',
                'unpaid'             => 'unpaid',
                'refunded'           => 'refunded',
                'partially_refunded' => 'partially_refunded',
                'cancelled'          => 'cancelled',
            );

            // Build response.
            $response = rest_ensure_response( $formatted_commissions );

            foreach ( $statuses as $key => $status ) {
                $filter = $base_filter;

                if ( $status ) {
                    $filter['status'] = $status;
                }

                $filter['count'] = true;

                $count = CommissionUtil::get_commission_information( $filter );

                if ( 'all' === $key ) {
                    $response->header( 'X-WP-Total', (int) $count );
                } else {
                    $response->header(
                        'X-WP-Status-' . ucfirst( str_replace( '_', '-', $key ) ),
                        (int) $count
                    );
                }
            }
            return $response;
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get a single commission.
     *
     * @param object $request The request object.
     */
    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            MultiVendorX()->util->log( $error );
            return $error;
        }

        try {
            $id = absint( $request->get_param( 'id' ) );

            $commission = CommissionUtil::get_commission_information( array( 'ID' => $id ) );

            $data = $this->prepare_item_for_response( $commission, true );

            return rest_ensure_response( $data );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }


    /**
     * Update a commission.
     *
     * @param object $request The request object.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $order_id = absint( $request->get_param( 'orderId' ) );
            $action   = $request->get_param( 'action' );

            if ( 'regenerate' === $action ) {
                $order = wc_get_order( $order_id );
                if ( $order ) {
                    MultiVendorX()->order->admin->regenerate_order_commissions( $order );
                    return rest_ensure_response( array( 'success' => true ) );
                }
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
    public function prepare_item_for_response( $commission, $with_items = false ) {

        $store      = new Store( $commission['store_id'] ?? 0 );
        $store_name = $store ? $store->get( Utill::STORE_SETTINGS_KEYS['name'] ) : '';

        $data = array(
            'id'                     => (int) ( $commission['ID'] ?? 0 ),
            'order_id'               => (int) ( $commission['order_id'] ?? 0 ),
            'store_id'               => (int) ( $commission['store_id'] ?? 0 ),
            'store_name'             => $store_name,
            'status'                 => $commission['status'] ?? '',
            'currency'               => $commission['currency'] ?? '',

            'total_order_amount'     => (float) ( $commission['total_order_value'] ?? 0 ),
            'net_items_cost'         => (float) ( $commission['net_items_cost'] ?? 0 ),

            'marketplace_commission' => (float) ( $commission['marketplace_commission'] ?? 0 ),
            'marketplace_payable'    => (float) ( $commission['marketplace_payable'] ?? 0 ),

            'store_earning'          => (float) ( $commission['store_earning'] ?? 0 ),
            'store_payable'          => (float) ( $commission['store_payable'] ?? 0 ),
            'store_refunded'         => (float) ( $commission['store_refunded'] ?? 0 ),

            'shipping_amount'        => (float) ( $commission['store_shipping'] ?? 0 ),
            'tax_amount'             => (float) ( $commission['store_tax'] ?? 0 ),
            'shipping_tax_amount'    => (float) ( $commission['store_shipping_tax'] ?? 0 ),

            'store_discount'         => (float) ( $commission['store_discount'] ?? 0 ),
            'admin_discount'         => (float) ( $commission['admin_discount'] ?? 0 ),
            'discount_applied'       => (float) ( $commission['discount_applied'] ?? 0 ),

            'gateway_fee'            => (float) ( $commission['gateway_fee'] ?? 0 ),
            'facilitator_fee'        => (float) ( $commission['facilitator_fee'] ?? 0 ),
            'platform_fee'           => (float) ( $commission['platform_fee'] ?? 0 ),

            'commission_note'        => $commission['commission_note'] ?? '',
            'created_at'             => Utill::multivendorx_rest_prepare_date_response( $commission['created_at'] ?? '' ),
            'updated_at'             => Utill::multivendorx_rest_prepare_date_response( $commission['updated_at'] ?? '' ),
        );

        if ( $with_items && ! empty( $commission['order_id'] ) ) {
            $order = wc_get_order( absint( $commission['order_id'] ) );
            $items = array();

            if ( $order ) {
                foreach ( $order->get_items() as $item_id => $item ) {
                    $product = $item->get_product();

                    $items[] = array(
                        'product_id' => $item->get_product_id(),
                        'name'       => $item->get_name(),
                        'sku'        => $product ? $product->get_sku() : '',
                        'price'      => (float) $order->get_item_subtotal( $item, false, true ),
                        'quantity'   => (int) $item->get_quantity(),
                        'total'      => (float) $order->get_line_total( $item, true, true ),
                    );
                }
            }

            $data['items'] = $items;
        }

        return apply_filters(
            'multivendorx_commission_formatted',
            $data,
            $commission
        );
    }
}
