<?php

/**
 * MultiVendorX REST API Transaction Controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\Store;
use MultiVendorX\Transaction\Transaction;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX REST API Transaction Controller
 *
 * @class       Transaction class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Transactions extends \WP_REST_Controller
{

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'transaction';

    /**
     * Register the routes for transaction.
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
     * Get items permissions check.
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check($request)
    {
        return true;
    }

    /**
     * Update item endpoint handler.
     *
     * @param object $request Full details about the request.
     */
    public function update_item_permissions_check($request)
    {
        return true;
    }

    /**
     * Get items endpoint handler.
     *
     * @param object $request Full details about the request.
     */
    public function get_items($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            $error = new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );
            MultiVendorX()->util->log($error);
            return $error;
        }

        try {
            // CSV download
            if ('csv' === $request->get_param('format')) {
                return $this->download_transaction_csv($request);
            }

            // Pagination & basic params
            $limit              = max(1, (int) $request->get_param('row') ?: 10);
            $page               = max(1, (int) $request->get_param('page') ?: 1);
            $offset             = ($page - 1) * $limit;
            $count              = $request->get_param('count');
            $store_id           = (int) $request->get_param('store_id');
            $status             = $request->get_param('status');
            $filter_status      = $request->get_param('filter_status');
            $transaction_type   = $request->get_param('transaction_type');
            $transaction_status = $request->get_param('transaction_status');
            $order_by = sanitize_text_field($request->get_param('orderBy')) ?: 'created_at';
            $order    = strtoupper(sanitize_text_field($request->get_param('order'))) ?: 'DESC';
            $dashboard = $request->get_param('dashboard');
            $search_id = $request->get_param('searchFiled');
            $dates = Utill::normalize_date_range(
                $request->get_param('startDate'),
                $request->get_param('endDate')
            );
            // Build args
            $args = array_filter(
                array(
                    'store_id'         => $store_id ?: null,
                    'status'           => $status ?: null,
                    'start_date'       => $dates['start_date'] ?: null,
                    'end_date'         => $dates['end_date'] ?: null,
                    'entry_type'       => $filter_status ?: null,
                    'transaction_type' => $transaction_type ?: null,
                    'limit'            => $limit,
                    'offset'           => $offset,
                    'orderBy'          => $order_by ?: null,
                    'order'            => in_array($order, array('ASC', 'DESC'), true) ? $order : null,
                )
            );
            // Count only
            if ($count) {
                $args['count'] = true;
                return rest_ensure_response(
                    (int) Transaction::get_transaction_information($args)
                );
            }

            if ($transaction_status) {
                $args['entry_type'] = $transaction_status;
            }

            if ($dashboard) {
                if (get_transient('multivendorx_withdrawal_data_' . $store_id)) {
                    return get_transient('multivendorx_withdrawal_data_' . $store_id);
                }
            }

            if (!empty($search_id) && is_numeric($search_id)) {
                $args['id'] = intval($search_id);
            
                unset($args['start_date'], $args['end_date']);
            }
            
            $transactions = Transaction::get_transaction_information($args);

            $formatted = array_map(
                function ($row) {
                    $store = new Store($row['store_id']);
                    return array(
                        'id'               => $row['id'],
                        'commission_id'    => $row['commission_id'],
                        'store_name'       => $store ? $store->get(Utill::STORE_SETTINGS_KEYS['name']) : '-',
                        'amount'           => $row['amount'],
                        'balance'          => $row['balance'],
                        'status'           => $row['status'],
                        'payment_method'   => $row['payment_method'] ?? '',
                        'account_number'   => $store ? $store->get_meta(Utill::STORE_SETTINGS_KEYS['account_number']) : '',
                        'credit'           => 'Cr' === $row['entry_type'] ? $row['amount'] : 0,
                        'debit'            => 'Dr' === $row['entry_type'] ? $row['amount'] : 0,
                        'date'             => $row['created_at'],
                        'order_details'    => $row['order_id'],
                        'transaction_type' => $row['transaction_type'],
                        'narration'         => $row['narration'],
                    );
                },
                $transactions
            );

            $count_args = array_filter(
                array(
                    'count'    => true,
                    'store_id' => $store_id ?: null,
                )
            );

            $counts = array(
                'all' => Transaction::get_transaction_information($count_args),
            );

            $statuses = array(
                'completed' => 'Completed',
                'processed' => 'Processed',
                'upcoming'  => 'Upcoming',
                'failed'    => 'Failed',
            );

            foreach ($statuses as $key => $status) {
                $counts[$key] = Transaction::get_transaction_information(
                    array_merge($count_args, array('status' => $status))
                );
            }

            if ($dashboard) {
                set_transient('multivendorx_withdrawal_data_' . $store_id, array('transaction' => $formatted), DAY_IN_SECONDS);
            }
            return rest_ensure_response(
                array_merge(
                    array('transaction' => $formatted),
                    $counts
                )
            );
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'multivendorx'),
                array('status' => 500)
            );
        }
    }

    /**
     * Download transactions as CSV
     *
     * @param object $request Request object.
     */
    private function download_transaction_csv($request)
    {
        $store_id           = (int) $request->get_param('store_id');
        $filter_status      = $request->get_param('filter_status');
        $transaction_type   = $request->get_param('transaction_type');
        $transaction_status = $request->get_param('transaction_status');
        $ids                = $request->get_param('ids');
        $page               = (int) $request->get_param('page');
        $per_page           = (int) $request->get_param('row');

        $dates = Utill::normalize_date_range(
            $request->get_param('startDate'),
            $request->get_param('endDate')
        );

        $args = array_filter(
            array(
                'store_id'         => $store_id ?: null,
                'transaction_type' => $transaction_type ?: null,
                'entry_type'       => $transaction_status ?: $filter_status ?: null,
            )
        );

        if (!empty($dates['start_date']) && !empty($dates['end_date'])) {
            $args['start_date'] = $dates['start_date'];
            $args['end_date']   = $dates['end_date'];
        }

        // If specific IDs are requested (selected rows from bulk action).
        if ($ids) {
            $args['id'] = array_map('intval', explode(',', $ids));
        } elseif ($page && $per_page) {
            $args['limit']  = $per_page;
            $args['offset'] = ($page - 1) * $per_page;
        }
        // Fetch transactions
        $transactions = Transaction::get_transaction_information($args);

        if (empty($transactions)) {
            return new \WP_Error(
                'no_data',
                __('No transaction data found.', 'multivendorx'),
                array('status' => 404)
            );
        }

        // CSV headers.
        $headers = array(
            'Transaction ID',
            'Date',
            'Order ID',
            'Store Name',
            'Transaction Type',
            'Credit',
            'Debit',
            'Balance',
            'Status',
            'Payment Method',
            'Narration',
        );

        // Build CSV data.
        $csv_output = fopen('php://output', 'w');
        ob_start();

        // Add BOM for UTF-8 compatibility.
        fwrite($csv_output, "\xEF\xBB\xBF");

        fputcsv($csv_output, $headers);

        foreach ($transactions as $transaction) {
            $store      = new Store($transaction['store_id']);
            $store_name = $store ? $store->get('name') : '';

            // Format date.
            $date = ! empty($transaction['created_at']) ? gmdate('M j, Y', strtotime($transaction['created_at'])) : '-';

            fputcsv(
                $csv_output,
                array(
                    $transaction['id'],
                    $date,
                    $transaction['order_id'] ? $transaction['order_id'] : '-',
                    $store_name,
                    $transaction['transaction_type'] ? $transaction['transaction_type'] : '-',
                    'Cr' === $transaction['entry_type'] ? $transaction['amount'] : 0,
                    'Dr' === $transaction['entry_type'] ? $transaction['amount'] : 0,
                    $transaction['balance'],
                    $transaction['status'],
                    $transaction['payment_method'] ? $transaction['payment_method'] : '',
                    $transaction['narration'],
                )
            );
        }

        fclose($csv_output);
        $csv = ob_get_clean();

        // Determine filename based on context.
        $filename = 'transactions_';
        if (! empty($ids)) {
            $filename .= 'selected_';
        } elseif (! empty($page)) {
            $filename .= 'page_' . $page . '_';
        } else {
            $filename .= 'all_';
        }

        // Add store ID to filename if available.
        if (! empty($store_id)) {
            $filename .= 'store_' . $store_id . '_';
        }

        $filename .= gmdate('Y-m-d') . '.csv';

        // Send headers for browser download.
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CSV must output raw data
        echo $csv;
        exit;
    }

    /**
     * Get store balance
     *
     * @param object $request Request object.
     */
    public function get_item($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );
        }

        $store_id = absint($request->get_param('id'));

        if (! $store_id) {
            return rest_ensure_response(
                array(
                    'balance'          => 0,
                    'locking_balance'  => 0,
                    'lifetime_earning' => 0,
                )
            );
        }
        $last_transaction = Transaction::get_balances_for_store($store_id);

        $balance         = $last_transaction['balance'];
        $locking_balance = $last_transaction['locking_balance'];

        // Calculate total lifetime earnings (sum of all amounts).
        $total_earning = (float) Transaction::get_balances_for_store($store_id, true);

        // Lifetime earning minus locking balance.
        $lifetime_earning = $total_earning - (float) $locking_balance;

        $payout_threshold      = floatval(MultiVendorX()->setting->get_setting('payout_threshold_amount', 0));
        $minimum_wallet_amount = MultiVendorX()->setting->get_setting('wallet_threshold_amount', 0);
        $locking_day           = MultiVendorX()->setting->get_setting('commission_lock_period', 0);
        $payment_schedules     = MultiVendorX()->setting->get_setting('payment_schedules', '');
        $withdrawals_fees      = MultiVendorX()->setting->get_setting('withdrawals_fees', array());
        $store                 = Store::get_store($store_id);

        return rest_ensure_response(
            array(
                'reserve_balance'    => $minimum_wallet_amount,
                'thresold'           => $payout_threshold,
                'available_balance'  => $balance,
                'balance'            => $balance,
                'locking_day'        => $locking_day,
                'locking_balance'    => $locking_balance,
                'lifetime_earning'   => $lifetime_earning,
                'payment_schedules'  => $payment_schedules,
                'free_withdrawal'    => (int) $store->get_meta(Utill::STORE_SETTINGS_KEYS['withdrawals_count']),
                'withdrawal_setting' => $withdrawals_fees,
            )
        );
    }

    /**
     * Update item endpoint handler. This method handles both approve and reject actions.
     *
     * @param object $request Full details about the request.
     */
    public function update_item($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );
        }

        $store_id     = absint($request->get_param('store_id'));
        $amount       = (float) $request->get_param('amount');
        $withdraw     = $request->get_param('withdraw');
        $action       = $request->get_param('action');
        $disbursement = $request->get_param('disbursement');

        $store            = new Store($store_id);
        $threshold_amount = MultiVendorX()->setting->get_setting('payout_threshold_amount', 0);

        if ($disbursement) {
            $method = $request->get_param('method');
            $note   = $request->get_param('note');

            if ( $threshold_amount < $amount ) {
                MultiVendorX()->payments->processor->process_payment( $store_id, $amount, null, $method, $note, $disbursement );
                return rest_ensure_response(
                    array(
                        'success' => true,
                        'id'      => $store_id,
                    )
                );
            }
        }

        if ($withdraw) {
            if ('approve' === $action && $threshold_amount < $amount) {
                MultiVendorX()->payments->processor->process_payment($store_id, $amount);
                do_action(
                    'multivendorx_notify_withdrawal_released',
                    'withdrawal_released',
                    array(
                        'store_phn' => $store->get_meta(Utill::STORE_SETTINGS_KEYS['phone']),
                        'store_email' => $store->get_meta(Utill::STORE_SETTINGS_KEYS['primary_email']),
                        'category'    => 'activity',
                    )
                );
            } else {
                do_action(
                    'multivendorx_notify_withdrawl_rejected',
                    'withdrawl_rejected',
                    array(
                        'store_phn' => $store->get_meta(Utill::STORE_SETTINGS_KEYS['phone']),
                        'store_email' => $store->get_meta(Utill::STORE_SETTINGS_KEYS['primary_email']),
                        'amount'    => $amount,
                        'category'    => 'activity',
                    )
                );
            }

            $store->delete_meta(Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount']);

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $store_id,
                )
            );
        }

        // Check if a withdrawal request already exists.
        $existing_request = $store->get_meta(Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount']);
        if ($existing_request) {
            return rest_ensure_response(
                array(
                    'success' => false,
                    'message' => __('You already have a pending withdrawal request.', 'multivendorx'),
                    'id'      => $store_id,
                )
            );
        }

        $withdraw_type = MultiVendorX()->setting->get_setting('withdraw_type', 'manual');

        $should_update_meta = true;

        if ('automatic' === $withdraw_type && $threshold_amount < $amount) {
            $payment_method = $store->get_meta('payment_method') ?? '';

            if (! empty($payment_method) && ('stripe-connect' === $payment_method || 'paypal-payout' === $payment_method)) {
                do_action("multivendorx_process_{$payment_method}_payment", $store_id, $amount, null, null, null);
            } else {
                $should_update_meta = true;
            }
        }

        if ($should_update_meta) {
            $store->update_meta(Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'], $amount);

            do_action(
                'multivendorx_notify_withdrawal_requested',
                'withdrawal_requested',
                array(
                    'admin_email' => MultiVendorX()->setting->get_setting('sender_email_address'),
                    'admin_phn' => MultiVendorX()->setting->get_setting('sms_receiver_phone_number'),
                    'store_phn' => $store->get_meta(Utill::STORE_SETTINGS_KEYS['phone']),
                    'store_email' => $store->get_meta(Utill::STORE_SETTINGS_KEYS['primary_email']),
                    'store_name' => $store->get('name'),
                    'amount'    => $amount,
                    'category'    => 'activity',
                )
            );
        }

        return rest_ensure_response(
            array(
                'success' => true,
                'id'      => $store_id,
                'message' => __('Withdrawal request submitted successfully.', 'multivendorx'),
            )
        );
    }
}
