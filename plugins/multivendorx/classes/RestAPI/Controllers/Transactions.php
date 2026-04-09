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

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Transaction Controller
 *
 * @class       Transaction class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Transactions extends \WP_REST_Controller {


    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'transaction';

    /**
     * Register the routes for transaction.
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
     * Get items permissions check.
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check( $request ) {
        return true;
    }

    /**
     * Update item endpoint handler.
     *
     * @param object $request Full details about the request.
     */
    public function update_item_permissions_check( $request ) {
        return true;
    }

	/**
	 * Get items endpoint handler.
	 *
	 * @param object $request Full details about the request.
	 */
	public function get_items( $request ) {
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
			$limit              = max( 1, (int) $request->get_param( 'row' ) ? (int) $request->get_param( 'row' ) : 10 );
			$page               = max( 1, (int) $request->get_param( 'page' ) ? (int) $request->get_param( 'page' ) : 1 );
			$offset             = ( $page - 1 ) * $limit;
			$store_id           = (int) $request->get_param( 'store_id' );
			$status             = $request->get_param( 'status' );
			$transaction_type   = $request->get_param( 'transaction_type' );
			$transaction_status = $request->get_param( 'transaction_status' );
			$order_by           = sanitize_text_field( $request->get_param( 'order_by' ) ) ? sanitize_text_field( $request->get_param( 'order_by' ) ) : 'created_at';
			$order              = strtoupper( sanitize_text_field( $request->get_param( 'order' ) ) ) ? strtoupper( sanitize_text_field( $request->get_param( 'order' ) ) ) : 'DESC';
			$search_id          = $request->get_param( 'search_value' );
			$dates              = Utill::normalize_date_range(
                $request->get_param( 'start_date' ),
                $request->get_param( 'end_date' )
			);

			$ids            = $request->get_param( 'ids' );
			$sec_fetch_site = $request->get_header( 'sec_fetch_site' );
			$referer        = $request->get_header( 'referer' );

			$args = array_filter(
				array(
					'store_id'         => $store_id ? $store_id : null,
					'status'           => $status ? $status : null,
					'start_date'       => $dates['start_date'] ? $dates['start_date'] : null,
					'end_date'         => $dates['end_date'] ? $dates['end_date'] : null,
					'transaction_type' => $transaction_type ? $transaction_type : null,
					'limit'            => $limit,
					'offset'           => $offset,
					'order_by'         => $order_by ? $order_by : null,
					'order'            => in_array( $order, array( 'ASC', 'DESC' ), true ) ? $order : null,
                )
			);

			if ( $transaction_status ) {
				$args['entry_type'] = $transaction_status;
			}

			if ( 'same-origin' === $sec_fetch_site && preg_match( '#/dashboard/?$#', $referer ) && get_transient( Utill::MULTIVENDORX_TRANSIENT_KEYS['withdrawal_transient'] . $store_id ) ) {
				return get_transient( Utill::MULTIVENDORX_TRANSIENT_KEYS['withdrawal_transient'] . $store_id );
			}

			if ( ! empty( $search_id ) ) {
				$args['id'] = is_numeric( $search_id ) ? intval( $search_id ) : 0;

				unset( $args['start_date'], $args['end_date'] );
			}

			if ( $ids ) {
				$args['id'] = $ids;
			}
			$transactions = Transaction::get_transaction_information( $args );
            
			$formatted    = array_map(
                function ( $row ) {
                    $store = new Store( $row['store_id'] );
                    return array(
                        'id'               => (int)$row['id'],
                        'commission_id'    => $row['commission_id'],
                        'store_name'       => $store ? $store->get( Utill::STORE_SETTINGS_KEYS['name'] ) : '-',
                        'amount'           => $row['amount'],
                        'balance'          => $row['balance'],
                        'status'           => $row['status'],
                        'payment_method'   => $row['payment_method'] ?? '',
                        'account_number'   => $store ? $store->get_meta( Utill::STORE_SETTINGS_KEYS['account_number'] ) : '',
                        'credit'           => 'Cr' === $row['entry_type'] ? $row['amount'] : 0,
                        'debit'            => 'Dr' === $row['entry_type'] ? $row['amount'] : 0,
                        'created_at'       => Utill::multivendorx_rest_prepare_date_response( $row['created_at'] ),
                        'created_at_gmt'   => Utill::multivendorx_rest_prepare_date_response( $row['created_at'], true ),
                        'order_details'    => $row['order_id'],
                        'transaction_type' => $row['transaction_type'],
                        'narration'        => $row['narration'],
                    );
                },
                $transactions
			);

			$count_args = array_filter(
				array(
					'count'    => true,
					'store_id' => $store_id ? $store_id : null,
                )
			);

			$statuses = array(
				'completed' => 'Completed',
				'processed' => 'Processed',
				'upcoming'  => 'Upcoming',
				'failed'    => 'Failed',
			);

			$response = rest_ensure_response( $formatted );

			$response->header( 'X-WP-Total', (int) Transaction::get_transaction_information( $count_args ) );

			foreach ( $statuses as $key => $status ) {
				$count = Transaction::get_transaction_information( array_merge( $count_args, array( 'status' => $status ) ) );
				$response->header( 'X-WP-Status-' . ucfirst( $key ), (int) $count );
			}

			if ( 'same-origin' === $sec_fetch_site && preg_match( '#/dashboard/?$#', $referer ) ) {
				set_transient(
                    Utill::MULTIVENDORX_TRANSIENT_KEYS['withdrawal_transient'] . $store_id,
                    $response,
                    DAY_IN_SECONDS
				);
			}

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

    /**
     * Get store balance
     *
     * @param object $request Request object.
     */
    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }

        $store_id = absint( $request->get_param( 'id' ) );

        if ( ! $store_id ) {
            return rest_ensure_response(
                array(
                    'balance'          => 0,
                    'locking_balance'  => 0,
                    'lifetime_earning' => 0,
                )
            );
        }
        $last_transaction = Transaction::get_balances_for_store( $store_id );

        $balance         = $last_transaction['balance'];
        $locking_balance = $last_transaction['locking_balance'];

        // Calculate total lifetime earnings (sum of all amounts).
        $total_earning = (float) Transaction::get_balances_for_store( $store_id, true );

        // Lifetime earning minus locking balance.
        $lifetime_earning = $total_earning - (float) $locking_balance;

        $payout_threshold      = floatval( MultiVendorX()->setting->get_setting( 'payout_threshold_amount', 0 ) );
        $minimum_wallet_amount = MultiVendorX()->setting->get_setting( 'wallet_threshold_amount', 0 );
        $locking_day           = MultiVendorX()->setting->get_setting( 'commission_lock_period', 0 );
        $payment_schedules     = MultiVendorX()->setting->get_setting( 'payment_schedules', '' );
        $withdrawals_fees      = MultiVendorX()->setting->get_setting( 'withdrawals_fees', array() );
        $store                 = Store::get_store( $store_id );

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
                'free_withdrawal'    => (int) $store->get_meta( Utill::STORE_SETTINGS_KEYS['withdrawals_count'] ),
                'withdrawal_setting' => $withdrawals_fees,
            )
        );
    }

    /**
     * Update item endpoint handler. This method handles both approve and reject actions.
     *
     * @param object $request Full details about the request.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }

        $store_id     = absint( $request->get_param( 'store_id' ) );
        $amount       = (float) $request->get_param( 'amount' );
        $withdraw     = $request->get_param( 'withdraw' );
        $action       = $request->get_param( 'action' );
        $disbursement = $request->get_param( 'disbursement' );

        $store            = new Store( $store_id );
        $threshold_amount = MultiVendorX()->setting->get_setting( 'payout_threshold_amount', 0 );

        if ( $disbursement ) {
            $method = $request->get_param( 'method' );
            $note   = $request->get_param( 'note' );

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

        if ( $withdraw ) {
            if ( 'approve' === $action && $threshold_amount < $amount ) {
                MultiVendorX()->payments->processor->process_payment( $store_id, $amount, null, null, null, true );
                MultiVendorX()->notifications->send_notification_helper('withdrawal_released', $store, null, [
                    'category'        => 'activity',
                ]);
            } else {
                MultiVendorX()->notifications->send_notification_helper('withdrawl_rejected', $store, null, [
                    'amount'      => $amount,
                    'category'    => 'activity',
                ]);
            }

            $store->delete_meta( Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'] );

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $store_id,
                )
            );
        }

        // Check if a withdrawal request already exists.
        $existing_request = $store->get_meta( Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'] );
        if ( $existing_request ) {
            return rest_ensure_response(
                array(
                    'success' => false,
                    'message' => __( 'You already have a pending withdrawal request.', 'multivendorx' ),
                    'id'      => $store_id,
                )
            );
        }

        $withdraw_type = MultiVendorX()->setting->get_setting( 'withdraw_type', 'manual' );

        $should_update_meta = true;

        if ( 'automatic' === $withdraw_type && $threshold_amount < $amount ) {
            $payment_method = $store->get_meta( 'payment_method' ) ?? '';

            if ( ! empty( $payment_method ) && ( 'stripe-connect' === $payment_method || 'paypal-payout' === $payment_method ) ) {
                do_action( "multivendorx_process_{$payment_method}_payment", $store_id, $amount, null, null, null );
            } else {
                $should_update_meta = true;
            }
        }

        if ( $should_update_meta && ! empty( $store->get_meta( 'payment_method' ) ) ) {
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'], $amount );

            MultiVendorX()->notifications->send_notification_helper('withdrawal_requested', $store, null, [
                'store_name'  => $store->get( 'name' ),    
                'amount'      => $amount,
                'category'    => 'activity',
            ]);
        }

        return rest_ensure_response(
            array(
                'success' => true,
                'id'      => $store_id,
                'message' => __( 'Withdrawal request submitted successfully.', 'multivendorx' ),
            )
        );
    }
}
