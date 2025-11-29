<?php

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Commission_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'commission';

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
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
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

    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' );
    }

    // POST permission
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'edit_stores' );
    }

    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'edit_stores' );
    }

    // GET
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log(
                    'MVX REST Error: ' .
                    'Code=' . $error->get_error_code() . '; ' .
                    'Message=' . $error->get_error_message() . '; ' .
                    'Data=' . wp_json_encode( $error->get_error_data() ) . "\n\n"
                );
            }

            return $error;
        }
        try {
            // Check if CSV download is requested
            $format = $request->get_param( 'format' );
            if ( $format === 'csv' ) {
                return $this->download_csv( $request );
            }

            $storeId = $request->get_param( 'store_id' );

            if ( $format === 'reports' ) {
                $top_stores = $request->get_param( 'top_stores' );

                if ( $storeId ) {
                    // If a specific store ID is provided, return commission summary for that store
                    return CommissionUtil::get_commission_summary_for_store( $storeId );
                }

                if ( $top_stores ) {
                    // If top_stores is provided, return commission summary for top stores
                    return CommissionUtil::get_commission_summary_for_store( null, $top_stores, $top_stores );
                }

                // Default: return summary for all stores
                return CommissionUtil::get_commission_summary_for_store();
            }

            $limit      = max( intval( $request->get_param( 'row' ) ), 10 );
            $page       = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset     = ( $page - 1 ) * $limit;
            $count      = $request->get_param( 'count' );
            $status     = $request->get_param( 'status' );
            $start_date = date( 'Y-m-d 00:00:00', strtotime( sanitize_text_field( $request->get_param( 'startDate' ) ) ) );
            $end_date   = date( 'Y-m-d 23:59:59', strtotime( sanitize_text_field( $request->get_param( 'endDate' ) ) ) );

            // ADD THESE LINES FOR SORTING
            $orderBy = sanitize_text_field( $request->get_param( 'orderBy' ) );
            $order   = sanitize_text_field( $request->get_param( 'order' ) );

            // Prepare filter for CommissionUtil
            $filter = array(
                'perpage' => $limit,
                'page'    => $page,
            );

            if ( ! empty( $storeId ) ) {
                $filter['store_id'] = intval( $storeId );
            }

            if ( ! empty( $status ) ) {
                $filter['status'] = $status;
            }

            if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
                $filter['created_at'] = array(
                    'compare' => 'BETWEEN',
                    'value'   => array( $start_date, $end_date ),
                );
            }

            // ADD SORTING TO FILTER
            if ( ! empty( $orderBy ) && ! empty( $order ) ) {
                $filter['orderBy'] = $orderBy;
                $filter['order']   = $order;
            }

            if ( $count ) {
                global $wpdb;
                $table_name = "{$wpdb->prefix}" . Utill::TABLES['commission'];

                if ( ! empty( $storeId ) ) {
                    $total_count = $wpdb->get_var(
                        $wpdb->prepare(
                            "SELECT COUNT(*) FROM $table_name WHERE store_id = %d",
                            $storeId
                        )
                    );
                } else {
                    $total_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
                }

                return rest_ensure_response( (int) $total_count );
            }
            // Rest of your existing code remains the same...
            $commissions = CommissionUtil::get_commissions(
                $filter,
                false
            );

            $formatted_commissions = array();

            foreach ( $commissions as $commission ) {
                $store      = new Store( $commission->store_id );
                $store_name = $store ? $store->get( 'name' ) : '';

                $formatted_commissions[] = apply_filters(
                    'multivendorx_commission_table',
                    array(
                        'id'                    => (int) $commission->ID,
                        'orderId'               => (int) $commission->order_id,
                        'storeId'               => (int) $commission->store_id,
                        'storeName'             => $store_name,
                        'totalOrderAmount'      => $commission->total_order_value,
                        'netItemsCost'          => $commission->net_items_cost,
                        'marketplaceCommission' => $commission->marketplace_commission,
                        'storeEarning'          => $commission->store_earning,
                        'gatewayFee'            => $commission->gateway_fee,
                        'shippingAmount'        => $commission->store_shipping,
                        'taxAmount'             => $commission->store_tax,
                        'shippingTaxAmount'     => $commission->store_shipping_tax,
                        'storeDiscount'         => $commission->store_discount,
                        'adminDiscount'         => $commission->admin_discount,
                        'storePayable'          => $commission->store_payable,
                        'marketplacePayable'    => $commission->marketplace_payable,
                        'storeRefunded'         => $commission->store_refunded,
                        'currency'              => $commission->currency,
                        'status'                => $commission->status,
                        'commissionNote'        => $commission->commission_note,
                        'createdAt'             => $commission->created_at,
                        'updatedAt'             => $commission->updated_at,
                    ),
                    $commission
                );
            }

            // Prepare base filter (for store-specific counts)
            $base_filter = array();
            if ( ! empty( $storeId ) && ! current_user_can( 'manage_options' ) ) {
                $base_filter['store_id'] = intval( $storeId );
            }

            // Status-wise counts with store/date filters applied
            $all                = CommissionUtil::get_commissions( $base_filter, true, true );
            $paid               = CommissionUtil::get_commissions( array_merge( $base_filter, array( 'status' => 'paid' ) ), true, true );
            $unpaid             = CommissionUtil::get_commissions( array_merge( $base_filter, array( 'status' => 'unpaid' ) ), true, true );
            $refunded           = CommissionUtil::get_commissions( array_merge( $base_filter, array( 'status' => 'refunded' ) ), true, true );
            $partially_refunded = CommissionUtil::get_commissions( array_merge( $base_filter, array( 'status' => 'partially_refunded' ) ), true, true );
            $cancelled          = CommissionUtil::get_commissions( array_merge( $base_filter, array( 'status' => 'cancelled' ) ), true, true );

            $response = array(
                'commissions'        => $formatted_commissions,
                'all'                => $all,
                'paid'               => $paid,
                'unpaid'             => $unpaid,
                'refunded'           => $refunded,
                'partially_refunded' => $partially_refunded,
                'cancelled'          => $cancelled,
            );
            return rest_ensure_response( $response );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                'MVX REST Exception: ' .
                'Message=' . $e->getMessage() . '; ' .
                'File=' . $e->getFile() . '; ' .
                'Line=' . $e->getLine() . "\n\n"
            );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    private function download_csv( $request ) {
        $storeId    = $request->get_param( 'store_id' );
        $status     = $request->get_param( 'status' );
        $ids        = $request->get_param( 'ids' );
        $start_date = sanitize_text_field( $request->get_param( 'startDate' ) );
        $end_date   = sanitize_text_field( $request->get_param( 'endDate' ) );
        $page       = $request->get_param( 'page' );
        $per_page   = $request->get_param( 'row' );

        // Prepare filter for CommissionUtil - NO pagination by default
        $filter = array();

        if ( ! empty( $storeId ) ) {
            $filter['store_id'] = intval( $storeId );
        }

        if ( ! empty( $status ) ) {
            $filter['status'] = $status;
        }

        if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
            $filter['created_at'] = array(
                'compare' => 'BETWEEN',
                'value'   => array( date( 'Y-m-d 00:00:00', strtotime( $start_date ) ), date( 'Y-m-d 23:59:59', strtotime( $end_date ) ) ),
            );
        }

        // If specific IDs are requested (selected rows from bulk action)
        if ( ! empty( $ids ) ) {
            $filter['id__in'] = array_map( 'intval', explode( ',', $ids ) );
        }
        // If pagination parameters are provided (current page export from bulk action)
        elseif ( ! empty( $page ) && ! empty( $per_page ) ) {
            $filter['perpage'] = intval( $per_page );
            $filter['page']    = intval( $page );
        }
        // Otherwise, export ALL data with current filters (no pagination - from Export All button)

        // Fetch commissions
        $commissions = \MultiVendorX\Commission\CommissionUtil::get_commissions( $filter, false );

        if ( empty( $commissions ) ) {
            return new \WP_Error( 'no_data', __( 'No commission data found.', 'multivendorx' ), array( 'status' => 404 ) );
        }

        // CSV headers
        $headers = array(
            'ID',
            'Order ID',
            'Store Name',
            'Total Order Amount',
            'Commission Amount',
            'Facilitator Fee',
            'Gateway Fee',
            'Shipping Amount',
            'Tax Amount',
            'Commission Total',
            'Status',
            'Created At',
            'Commission Refunded',
            'Currency',
        );

        // Build CSV data
        $csv_output = fopen( 'php://output', 'w' );
        ob_start();

        // Add BOM for UTF-8 compatibility
        fwrite( $csv_output, "\xEF\xBB\xBF" );

        fputcsv( $csv_output, $headers );

        foreach ( $commissions as $commission ) {
            $store      = new \MultiVendorX\Store\Store( $commission->store_id );
            $store_name = $store ? $store->get( 'name' ) : '';

            fputcsv(
                $csv_output,
                array(
					$commission->ID,
					$commission->order_id,
					$store_name,
					$commission->total_order_amount,
					$commission->commission_amount,
					$commission->facilitator_fee,
					$commission->gateway_fee,
					$commission->shipping_amount,
					$commission->tax_amount,
					$commission->commission_total,
					$commission->status,
					$commission->created_at,
					$commission->commission_refunded,
					$commission->currency,
                )
            );
        }

        fclose( $csv_output );
        $csv = ob_get_clean();

        // Determine filename based on context
        $filename = 'commissions_';
        if ( ! empty( $ids ) ) {
            $filename .= 'selected_';
        } elseif ( ! empty( $page ) ) {
            $filename .= 'page_' . $page . '_';
        } else {
            $filename .= 'all_';
        }
        $filename .= date( 'Y-m-d' ) . '.csv';

        // Send headers for browser download
        header( 'Content-Type: text/csv; charset=UTF-8' );
        header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
        header( 'Pragma: no-cache' );
        header( 'Expires: 0' );

        echo $csv;
        exit;
    }

    public function get_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log(
                    'MVX REST Error: ' .
                    'Code=' . $error->get_error_code() . '; ' .
                    'Message=' . $error->get_error_message() . '; ' .
                    'Data=' . wp_json_encode( $error->get_error_data() ) . "\n\n"
                );
            }

            return $error;
        }
        try {
            // Get commission ID from request
            $id = absint( $request->get_param( 'id' ) );

            // Fetch raw commission data (stdClass)
            $commission = \MultiVendorX\Commission\CommissionUtil::get_commission_db( $id );
            if ( ! $commission || empty( $commission->ID ) ) {
                return new \WP_Error(
                    'not_found',
                    __( 'Commission not found', 'multivendorx' ),
                    array( 'status' => 404 )
                );
            }

            // Validate order ID
            if ( empty( $commission->order_id ) ) {
                return new \WP_Error(
                    'missing_order',
                    __( 'Order ID missing in commission data', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            $order_id = absint( $commission->order_id );
            $order    = wc_get_order( $order_id );

            if ( ! $order ) {
                return new \WP_Error(
                    'order_not_found',
                    __( 'Order not found', 'multivendorx' ),
                    array( 'status' => 404 )
                );
            }

            // Build line items
            $items = array();
            foreach ( $order->get_items() as $item_id => $item ) {
                $product = $item->get_product();

                $items[] = array(
                    'product_id' => $item->get_product_id(),
                    'name'       => $item->get_name(),
                    'sku'        => $product ? $product->get_sku() : '',
                    'price'      => wc_price( $order->get_item_subtotal( $item, false, true ) ),
                    'qty'        => $item->get_quantity(),
                    'total'      => wc_price( $order->get_line_total( $item, true, true ) ),
                );
            }

            // Prepare response
            $response = array(
                'commission_id'          => absint( $commission->ID ),
                'order_id'               => $order_id,
                'store_id'               => absint( $commission->store_id ),
                'status'                 => $commission->status,

                // Corrected variable mappings
                'amount'                 => wc_format_decimal( $commission->store_earning, 2 ),
                'shipping'               => wc_format_decimal( $commission->store_shipping, 2 ),
                'tax'                    => wc_format_decimal( $commission->store_tax, 2 ),
                'shipping_tax_amount'    => wc_format_decimal( $commission->store_shipping_tax, 2 ),

                // Total payable to vendor (your earlier 'commission_total' does not exist)
                'total'                  => wc_format_decimal( $commission->store_payable, 2 ),

                // Refund stored as store_refunded
                'commission_refunded'    => wc_format_decimal( $commission->store_refunded ?? 0, 2 ),

                'marketplace_commission' => wc_format_decimal( $commission->marketplace_commission, 2 ),
                'facilitator_fee'        => wc_format_decimal( $commission->facilitator_fee, 2 ),
                'gateway_fee'            => wc_format_decimal( $commission->gateway_fee, 2 ),
                'platform_fee'           => wc_format_decimal( $commission->platform_fee, 2 ),
                'discount_applied'       => wc_format_decimal( $commission->discount_applied, 2 ),

                'note'                   => $commission->commission_note,
                'created'                => $commission->created_at,
                'items'                  => $items,
            );

            return rest_ensure_response( $response );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                'MVX REST Exception: ' .
                'Message=' . $e->getMessage() . '; ' .
                'File=' . $e->getFile() . '; ' .
                'Line=' . $e->getLine() . "\n\n"
            );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log(
                    'MVX REST Error: ' .
                    'Code=' . $error->get_error_code() . '; ' .
                    'Message=' . $error->get_error_message() . '; ' .
                    'Data=' . wp_json_encode( $error->get_error_data() ) . "\n\n"
                );
            }

            return $error;
        }
        try {
            $order_id = absint( $request->get_param( 'orderId' ) );
            $action   = $request->get_param( 'action' );

            if ( $action == 'regenerate' ) {
                $order = wc_get_order( $order_id );
                if ( $order ) {
                    MultiVendorX()->order->admin->regenerate_order_commissions( $order );
                    return rest_ensure_response( array( 'success' => true ) );
                }
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                'MVX REST Exception: ' .
                'Message=' . $e->getMessage() . '; ' .
                'File=' . $e->getFile() . '; ' .
                'Line=' . $e->getLine() . "\n\n"
            );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
}
