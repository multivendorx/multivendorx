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

defined('ABSPATH') || exit;

/**
 * MultiVendorX REST API Controller for Commission.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Commissions extends \WP_REST_Controller
{

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
    public function register_routes()
    {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_items'),
                    'permission_callback' => array($this, 'get_items_permissions_check'),
                ),
            )
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_item'),
                    'permission_callback' => array($this, 'get_items_permissions_check'),
                    'args'                => array(
                        'id' => array('required' => true),
                    ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_item'),
                    'permission_callback' => array($this, 'update_item_permissions_check'),
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
    public function get_items_permissions_check($request)
    {
        return current_user_can('read') || current_user_can('edit_stores'); // phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * PUT permission check.
     *
     * @param object $request Request data.
     * @return bool
     */
    public function update_item_permissions_check($request)
    {
        return current_user_can('manage_options') || current_user_can('edit_stores'); // phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * GET all commissions.
     *
     * @param object $request Request data.
     * @return object
     */
    public function get_items($request)
    {

        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            $error = new \WP_Error('invalid_nonce', __('Invalid nonce', 'multivendorx'), array('status' => 403));

            if (is_wp_error($error)) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }

        try {
            // Check if CSV download is requested.
            $format = $request->get_param('format');
            if ('csv' === $format) {
                return $this->download_csv($request);
            }

            $store_id = $request->get_param('store_id');

            if ('reports' === $format) {
                $top_stores = $request->get_param('top_stores');
                $dashboard = $request->get_param('dashboard');
                $start_date = $request->get_param('start_date');
                $end_date   = $request->get_param('end_date');
                $args = [
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ];

                if ($dashboard) {
                    if (get_transient('multivendorx_report_data_' . $store_id)) {
                        return get_transient('multivendorx_report_data_' . $store_id);
                    }
                    $results = CommissionUtil::get_commission_summary_for_store($store_id, $dashboard, false, null, $args);
                    if (!empty($results)) {
                        set_transient('multivendorx_report_data_' . $store_id, $results, DAY_IN_SECONDS);
                    }
                    return $results;
                }

                if ($store_id) {
                    return CommissionUtil::get_commission_summary_for_store($store_id);
                }

                if ($top_stores) {
                    return CommissionUtil::get_commission_summary_for_store(null, false, $top_stores, $top_stores);
                }

                return CommissionUtil::get_commission_summary_for_store();
            }

            $limit      = max(intval($request->get_param('row')), 10);
            $page       = max(intval($request->get_param('page')), 1);
            $count      = $request->get_param('count');
            $status     = $request->get_param('status');

            $range = Utill::normalize_date_range(
                $request->get_param('startDate'),
                $request->get_param('endDate')
            );

            // Sorting params.
            $order_by = sanitize_text_field($request->get_param('orderBy'));
            $order    = sanitize_text_field($request->get_param('order'));
            $search_action = sanitize_text_field( $request->get_param( 'searchAction' ) );
            $search_value  = sanitize_text_field( $request->get_param( 'searchValue' ) );
            
            // Prepare filter.
            $filter = array();

            if (! empty($store_id)) {
                $filter['store_id'] = intval($store_id);
            }

            if (! empty($status)) {
                $filter['status'] = $status;
            }

            if (! empty($range['start_date']) && ! empty($range['end_date'])) {
                $filter['start_date'] = $range['start_date'];
                $filter['end_date']   = $range['end_date'];
            }
            if ( ! empty( $search_value ) && is_numeric( $search_value ) ) {
                unset($filter['start_date'], $filter['end_date']);
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
                        $filter['order_id'] = (int) $search_value;
                        $filter['condition'] = 'OR';
                        break;
                }
            }
            
            // Default: latest first
            $filter['orderBy'] = $order_by ?: 'created_at';
            $filter['order']   = strtolower($order) === 'asc' ? 'ASC' : 'DESC';

            // Handle count only.
            if ($count) {
                $filter['count'] = true;

                return rest_ensure_response(
                    CommissionUtil::get_commission_information($filter)
                );
            }
            // Fetch commissions.
            $commissions = CommissionUtil::get_commission_information(
                array_merge(
                    $filter,
                    array(
                        'limit'  => $limit,
                        'offset' => ($page - 1) * $limit,
                    )
                )
            );

            $formatted_commissions = array();

            foreach ($commissions as $commission) {
                $store      = new Store($commission['store_id']);
                $store_name = $store ? $store->get(Utill::STORE_SETTINGS_KEYS['name']) : '';

                $formatted_commissions[] = apply_filters(
                    'multivendorx_commission_table',
                    array(
                        'id'                    => (int) $commission['ID'],
                        'orderId'               => (int) $commission['order_id'],
                        'storeId'               => (int) $commission['store_id'],
                        'storeName'             => $store_name,
                        'totalOrderAmount'      => $commission['total_order_value'],
                        'netItemsCost'          => $commission['net_items_cost'],
                        'marketplaceCommission' => $commission['marketplace_commission'],
                        'storeEarning'          => $commission['store_earning'],
                        'gatewayFee'            => $commission['gateway_fee'],
                        'shippingAmount'        => $commission['store_shipping'],
                        'taxAmount'             => $commission['store_tax'],
                        'shippingTaxAmount'     => $commission['store_shipping_tax'],
                        'storeDiscount'         => $commission['store_discount'],
                        'adminDiscount'         => $commission['admin_discount'],
                        'storePayable'          => $commission['store_payable'],
                        'marketplacePayable'    => $commission['marketplace_payable'],
                        'storeRefunded'         => $commission['store_refunded'],
                        'currency'              => $commission['currency'],
                        'status'                => $commission['status'],
                        'commissionNote'        => $commission['commission_note'],
                        'createdAt'             => $commission['created_at'],
                        'updatedAt'             => $commission['updated_at'],
                    ),
                    (object) $commission
                );
            }

            // Base filter for counts.
            $base_filter = array();

            if (! empty($store_id)) {
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
            $response = array(
                'commissions' => $formatted_commissions,
            );

            foreach ($statuses as $key => $status) {
                $filter = $base_filter;

                if ($status) {
                    $filter['status'] = $status;
                }

                $filter['count'] = true;
                $response[$key] = CommissionUtil::get_commission_information($filter);
            }

            return rest_ensure_response($response);
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error('server_error', __('Unexpected server error', 'multivendorx'), array('status' => 500));
        }
    }


    /**
     * Download CSV for commission data.
     *
     * @param object $request The request object.
     */
    private function download_csv($request)
    {

        $store_id   = (int) $request->get_param('store_id');
        $status     = $request->get_param('status');
        $ids        = $request->get_param('ids');
        $start_date = $request->get_param('startDate');
        $end_date   = $request->get_param('endDate');
        $page       = (int) $request->get_param('page');
        $per_page   = (int) $request->get_param('row');

        // Build filter
        $filter = array();

        if ($store_id) {
            $filter['store_id'] = $store_id;
        }

        if (! empty($status)) {
            $filter['status'] = $status;
        }

        if (! empty($start_date) && ! empty($end_date)) {
            $filter['start_date'] = gmdate('Y-m-d 00:00:00', strtotime($start_date));
            $filter['end_date']   = gmdate('Y-m-d 23:59:59', strtotime($end_date));
        }

        // Bulk selection OR pagination
        if (! empty($ids)) {
            $filter['ID'] = array_map('intval', explode(',', $ids));
        } elseif ($page && $per_page) {
            $filter['limit']  = $per_page;
            $filter['offset'] = ($page - 1) * $per_page;
        }

        $commissions = CommissionUtil::get_commission_information($filter);

        if (empty($commissions)) {
            return new \WP_Error(
                'no_data',
                __('No commission data found.', 'multivendorx'),
                array('status' => 404)
            );
        }

        // CSV setup
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

        ob_start();

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
        $csv_output = fopen('php://output', 'w');

        // UTF-8 BOM for Excel
        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
        fwrite($csv_output, "\xEF\xBB\xBF");

        // Write headers.
        fputcsv($csv_output, $headers, ',', '"', '\\');

        foreach ($commissions as $commission) {
            $store_name = '';

            if (! empty($commission['store_id'])) {
                $store      = new Store((int) $commission['store_id']);
                $store_name = (string) $store->get(Utill::STORE_SETTINGS_KEYS['name']);
            }

            fputcsv(
                $csv_output,
                array(
                    $commission['ID'],
                    $commission['order_id'],
                    $store_name,
                    $commission['total_order_amount'],
                    $commission['commission_amount'],
                    $commission['facilitator_fee'],
                    $commission['gateway_fee'],
                    $commission['shipping_amount'],
                    $commission['tax_amount'],
                    $commission['commission_total'],
                    $commission['status'],
                    $commission['created_at'],
                    $commission['commission_refunded'],
                    $commission['currency'],
                )
            );
        }

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
        fclose($csv_output);

        $csv = ob_get_clean();

        // Filename
        $filename = 'commissions_';

        if (! empty($ids)) {
            $filename .= 'selected_';
        } elseif ($page) {
            $filename .= 'page_' . $page . '_';
        } else {
            $filename .= 'all_';
        }

        $filename .= gmdate('Y-m-d') . '.csv';

        // Output
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        echo esc_html($csv);
        exit;
    }

    /**
     * Get a single commission.
     *
     * @param object $request The request object.
     */
    public function get_item($request)
    {
        // Verify nonce.
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            $error = new \WP_Error('invalid_nonce', __('Invalid nonce', 'multivendorx'), array('status' => 403));

            // Log the error.
            if (is_wp_error($error)) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }
        try {
            // Get commission ID from request.
            $id = absint($request->get_param('id'));

            // Fetch raw commission data (stdClass).
            $commission = CommissionUtil::get_commission_db($id);
            if (! $commission || empty($commission->ID)) {
                return new \WP_Error(
                    'not_found',
                    __('Commission not found', 'multivendorx'),
                    array('status' => 404)
                );
            }

            // Validate order ID.
            if (empty($commission->order_id)) {
                return new \WP_Error(
                    'missing_order',
                    __('Order ID missing in commission data', 'multivendorx'),
                    array('status' => 400)
                );
            }

            $order_id = absint($commission->order_id);
            $order    = wc_get_order($order_id);

            if (! $order) {
                return new \WP_Error(
                    'order_not_found',
                    __('Order not found', 'multivendorx'),
                    array('status' => 404)
                );
            }

            // Build line items.
            $items = array();
            foreach ($order->get_items() as $item_id => $item) {
                $product = $item->get_product();

                $items[] = array(
                    'product_id' => $item->get_product_id(),
                    'name'       => $item->get_name(),
                    'sku'        => $product ? $product->get_sku() : '',
                    'price'      => wc_price($order->get_item_subtotal($item, false, true)),
                    'qty'        => $item->get_quantity(),
                    'total'      => wc_price($order->get_line_total($item, true, true)),
                );
            }

            // Prepare response.
            $response = array(
                'commission_id'          => absint($commission->ID),
                'order_id'               => $order_id,
                'store_id'               => absint($commission->store_id),
                'status'                 => $commission->status,
                'amount'                 => wc_format_decimal($commission->store_earning, 2),
                'shipping'               => wc_format_decimal($commission->store_shipping, 2),
                'tax'                    => wc_format_decimal($commission->store_tax, 2),
                'shipping_tax_amount'    => wc_format_decimal($commission->store_shipping_tax, 2),
                'total'                  => wc_format_decimal($commission->store_payable, 2),
                'commission_refunded'    => wc_format_decimal($commission->store_refunded ?? 0, 2),
                'marketplace_commission' => wc_format_decimal($commission->marketplace_commission, 2),
                'facilitator_fee'        => wc_format_decimal($commission->facilitator_fee, 2),
                'gateway_fee'            => wc_format_decimal($commission->gateway_fee, 2),
                'platform_fee'           => wc_format_decimal($commission->platform_fee, 2),
                'discount_applied'       => wc_format_decimal($commission->discount_applied, 2),
                'note'                   => $commission->commission_note,
                'created'                => $commission->created_at,
                'items'                  => $items,
            );

            return rest_ensure_response($response);
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error('server_error', __('Unexpected server error', 'multivendorx'), array('status' => 500));
        }
    }

    /**
     * Update a commission.
     *
     * @param object $request The request object.
     */
    public function update_item($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            $error = new \WP_Error('invalid_nonce', __('Invalid nonce', 'multivendorx'), array('status' => 403));

            // Log the error.
            if (is_wp_error($error)) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }
        try {
            $order_id = absint($request->get_param('orderId'));
            $action   = $request->get_param('action');

            if ('regenerate' === $action) {
                $order = wc_get_order($order_id);
                if ($order) {
                    MultiVendorX()->order->admin->regenerate_order_commissions($order);
                    return rest_ensure_response(array('success' => true));
                }
            }
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error('server_error', __('Unexpected server error', 'multivendorx'), array('status' => 500));
        }
    }
}
