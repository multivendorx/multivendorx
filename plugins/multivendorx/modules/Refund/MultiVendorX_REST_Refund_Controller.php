<?php

namespace MultiVendorX\Refund;

use MultiVendorX\Store\Store;
defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Refund_Controller extends \WP_REST_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'refund';

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

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
				// [
				// 'methods'             => \WP_REST_Server::CREATABLE, // Add POST method
				// 'callback'            => [ $this, 'update_item' ],
				// 'permission_callback' => [ $this, 'update_item_permissions_check' ],
				// ],
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );
    }

    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read_shop_orders' ) || current_user_can( 'edit_shop_orders' );
    }

    public function update_item_permissions_check( $request ) {
        return current_user_can( 'edit_shop_orders' );
    }


    /**
     * Get all refunds filtered by store, search, and date.
     * 100% WooCommerce-native (no raw SQL).
     */
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
            // Parameters
            $limit         = max( 1, intval( $request->get_param( 'row' ) ) );
            $page          = max( 1, intval( $request->get_param( 'page' ) ) );
            $count_only    = filter_var( $request->get_param( 'count' ), FILTER_VALIDATE_BOOLEAN );
            $store_id      = $request->get_param( 'store_id' );
            $search_action = strtolower( $request->get_param( 'searchAction' ) );
            $search_field  = strtolower( trim( $request->get_param( 'searchField' ) ) );
            $order_by      = $request->get_param( 'orderBy' );
            $order         = strtolower( $request->get_param( 'order' ) ) === 'asc' ? 'ASC' : 'DESC';
            $start_date    = $request->get_param( 'startDate' );
            $end_date      = $request->get_param( 'endDate' );

            // Build meta query
            $meta_query = array();
            if ( ! empty( $store_id ) ) {
                $meta_query[] = array(
                    'key'     => 'multivendorx_store_id',
                    'value'   => $store_id,
                    'compare' => '=',
                );
            } else {
                $meta_query[] = array(
                    'key'     => 'multivendorx_store_id',
                    'compare' => 'EXISTS',
                );
            }

            // 🗓 Date filter
            $date_filter = '';
            if ( $start_date || $end_date ) {
                $start = $start_date ? gmdate( 'Y-m-d 00:00:00', strtotime( $start_date ) ) : '';
                $end   = $end_date ? gmdate( 'Y-m-d 23:59:59', strtotime( $end_date ) ) : '';
                if ( $start && $end ) {
                    $date_filter = $start . '...' . $end;
                } elseif ( $start ) {
                    $date_filter = '>' . $start;
                } elseif ( $end ) {
                    $date_filter = '<' . $end;
                }
            }

            // If count only — return minimal data (fast)
            if ( $count_only ) {
                $count_args = array(
                    'type'       => 'shop_order_refund',
                    'meta_query' => $meta_query,
                    'return'     => 'ids',
                );

                $refund_ids = wc_get_orders( $count_args );
                return rest_ensure_response( count( $refund_ids ) );
            }

            // Build full query (for listing)
            $args = array(
                'type'       => 'shop_order_refund',
                'meta_query' => $meta_query,
                'limit'      => $limit,
                'paged'      => $page,
                'return'     => 'objects',
                'paginate'   => false,
            );

            if ( $date_filter ) {
                $args['date_created'] = $date_filter;
            }

            if ( in_array( $order_by, array( 'date', 'order_id' ), true ) ) {
                $args['orderby'] = $order_by === 'order_id' ? 'ID' : 'date';
                $args['order']   = $order;
            }

            // Fetch refunds
            $refunds = wc_get_orders( $args );

            // Search filtering (only after fetching)
            if ( $search_action && $search_field ) {
                $refunds = array_filter(
                    $refunds,
                    function ( $refund ) use ( $search_action, $search_field ) {
                        /** @var WC_Order_Refund $refund */
                        $order = wc_get_order( $refund->get_parent_id() );
                        if ( ! $order ) {
                            return false;
                        }

                        switch ( $search_action ) {
                            case 'order_id':
                                return (string) $order->get_id() === $search_field;

                            case 'customer':
                                $name  = strtolower( $order->get_formatted_billing_full_name() );
                                $email = strtolower( $order->get_billing_email() );
                                return str_contains( $name, $search_field ) || str_contains( $email, $search_field );

                            default:
                                return true;
                        }
                    }
                );
            }

            // Build response
            $refund_list = array_map(
                function ( $refund ) {
                    /** @var WC_Order_Refund $refund */
                    $store_id   = $refund->get_meta( 'multivendorx_store_id' );
                    $store      = new Store( $store_id );
                    $store_name = $store ? $store->get( 'name' ) : '';

                    $order = wc_get_order( $refund->get_parent_id() );

                    $customer_id    = $order ? $order->get_customer_id() : 0;
                    $customer_name  = $order ? $order->get_formatted_billing_full_name() : '';
                    $customer_email = $order ? $order->get_billing_email() : '';

                    // Build admin edit link if the customer exists
                    $customer_edit_link = $customer_id
                    ? admin_url( 'user-edit.php?user_id=' . $customer_id )
                    : '';

                    return array(
                        'refund_id'          => $refund->get_id(),
                        'store_id'           => $store_id,
                        'store_name'         => $store_name,
                        'order_id'           => $refund->get_parent_id(),
                        'amount'             => $refund->get_amount(),
                        'reason'             => $refund->get_reason(),
                        'customer_reason'    => $order ? $order->get_meta( '_customer_refund_reason', true ) : '',
                        'currency'           => $refund->get_currency(),
                        'date'               => $refund->get_date_created()
                                                    ? $refund->get_date_created()->date_i18n( 'Y-m-d H:i:s' )
                                                    : '',
                        'status'             => $refund->get_status(),
                        'customer_id'        => $customer_id,
                        'customer_name'      => $customer_name,
                        'customer_email'     => $customer_email,
                        'customer_edit_link' => $customer_edit_link,
                    );
                },
                $refunds
            );

            // Sort by order_id manually if needed
            if ( $order_by === 'order_id' ) {
                usort( $refund_list, fn( $a, $b ) => ( $order === 'ASC' ? $a['order_id'] <=> $b['order_id'] : $b['order_id'] <=> $a['order_id'] ) );
            }

            return rest_ensure_response( array_values( $refund_list ) );
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
        $refund_info = $request->get_param( 'payload' );

        $order_id      = $refund_info['orderId'] ? absint( $refund_info['orderId'] ) : 0;
        $refund_amount = wc_format_decimal( $refund_info['refundAmount'], wc_get_price_decimals() );
        // $refunded_amount = wc_format_decimal(sanitize_text_field(wp_unslash($_POST['refunded_amount'])), wc_get_price_decimals());
        $items                  = $refund_info['items'] ?? array();
        $refund_reason          = sanitize_text_field( $refund_info['reason'] );
        $restock_refunded_items = 'true' === $refund_info['restock'];
        $refund                 = false;
        $response_data          = array();

        try {
            $order = wc_get_order( $order_id );

            $parent_order_id  = $order->get_parent_id();
            $parent_order     = wc_get_order( $parent_order_id );
            $parent_items_ids = array_keys( $parent_order->get_items( array( 'line_item', 'fee', 'shipping' ) ) );

            $order_items = $order->get_items();
            $max_refund  = wc_format_decimal( $order->get_total() - $order->get_total_refunded(), wc_get_price_decimals() );

            if ( ! $refund_amount || $max_refund < $refund_amount || $refund_amount < 0 ) {
                return new \WP_Error( 'invalid_amount', __( 'Invalid refund amount.', 'multivendorx' ), array( 'status' => 400 ) );
            }

            // if ($refunded_amount !== wc_format_decimal($order->get_total_refunded(), wc_get_price_decimals())) {
            // throw new \Exception(__('Error processing refund. Please try again.', 'multivendorx'));
            // }

            // Prepare line items which we are refunding.
            $line_items        = array();
            $parent_line_items = array();

            $item_keys = array_keys( $items );

            foreach ( $item_keys as $item_id ) {
                $line_items[ $item_id ] = array(
                    'qty'          => 0,
                    'refund_total' => 0,
                    'refund_tax'   => array(),
                );
                $parent_item_id         = $this->get_vendor_parent_order_item_id( $item_id );
                if ( $parent_item_id && in_array( $parent_item_id, $parent_items_ids ) ) {
                    $parent_line_items[ $parent_item_id ] = array(
                        'qty'          => 0,
                        'refund_total' => 0,
                        'refund_tax'   => array(),
                    );
                }
            }

            foreach ( $items as $item_id => $value ) {
                $qty   = isset( $value['qty'] ) ? max( $value['qty'], 0 ) : 0;
                $total = isset( $value['total'] ) ? $value['total'] : 0;
                $tax   = isset( $value['tax'] ) ? $value['tax'] : 0;

                $line_items[ $item_id ]['qty']          = $qty;
                $line_items[ $item_id ]['refund_total'] = wc_format_decimal( $total );
                $line_items[ $item_id ]['refund_tax']   = wc_format_decimal( $tax );

                $parent_item_id = $this->get_vendor_parent_order_item_id( $item_id );

                if ( $parent_item_id && in_array( $parent_item_id, $parent_items_ids ) ) {
                    $parent_line_items[ $parent_item_id ]['qty']          = $qty;
                    $parent_line_items[ $parent_item_id ]['refund_total'] = wc_format_decimal( $total );
                    $parent_line_items[ $parent_item_id ]['refund_tax']   = wc_format_decimal( $tax );
                }
            }

            if ( $line_items ) {
                // Create the refund object.
                $refund = wc_create_refund(
                    array(
						'amount'         => $refund_amount,
						'reason'         => $refund_reason,
						'order_id'       => $order_id,
						'line_items'     => $line_items,
						'refund_payment' => false,
						'restock_items'  => $restock_refunded_items,
					)
                );
            }

            if ( ! empty( $parent_line_items ) ) {
                if ( apply_filters( 'mvx_allow_refund_parent_order', true ) ) {
                    $parent_refund = wc_create_refund(
                        array(
							'amount'         => $refund_amount,
							'reason'         => $refund_reason,
							'order_id'       => $parent_order_id,
							'line_items'     => $parent_line_items,
							'refund_payment' => false,
							'restock_items'  => $restock_refunded_items,
						)
                    );
                }
            }

            if ( is_wp_error( $refund ) ) {
                return new \WP_Error( 'refund_failed', $refund->get_error_message(), array( 'status' => 400 ) );
            }
            if ( is_wp_error( $parent_refund ) ) {
                return new \WP_Error( 'refund_failed', $parent_refund->get_error_message(), array( 'status' => 400 ) );
            }

            do_action( 'mvx_order_refunded', $order_id, $refund->get_id() );

            if ( did_action( 'woocommerce_order_fully_refunded' ) ) {
                $response_data['status'] = 'fully_refunded';
            }

            return rest_ensure_response(
                array(
					'success'       => true,
					'response_data' => $response_data,
                )
            );
        } catch ( Exception $e ) {
            return new \WP_Error( 'refund_failed', __( 'Refund Failed', 'multivendorx' ), array( 'status' => 400 ) );
        }
    }

    public function get_vendor_parent_order_item_id( $item_id ) {
        global $wpdb;
        $vendor_item_id = $wpdb->get_var( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->order_itemmeta} WHERE meta_key=%s AND order_item_id=%d", 'store_order_item_id', absint( $item_id ) ) );
        return $vendor_item_id;
    }
}
