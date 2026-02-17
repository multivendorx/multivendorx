<?php
/**
 * MultiVendorX Transaction class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Transaction;

use MultiVendorX\Utill;
use MultiVendorX\Commission\CommissionUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Transaction class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Transaction {
    /**
	 * Container for classes.
	 *
	 * @var array
	 */
    private $container = array();

    /**
	 * Constructor.
	 */
    public function __construct() {
        $this->init_classes();

        add_action( 'woocommerce_order_status_changed', array( $this, 'create_transaction_for_sub_order' ), 20, 4 );
        if ( is_admin() ) {
            add_action( 'multivendorx_after_calculate_commission', array( $this, 'create_transaction_for_backend_order' ), 10, 2 );
        }
    }

    /**
	 * Init classes.
	 */
    public function init_classes() {
        $this->container = array();
    }

    /**
	 * Create transaction for backend order.
	 *
	 * @param integer $commission_id Commission Id.
	 * @param object  $store_order  Store order object.
	 */
    public function create_transaction_for_backend_order( $commission_id, $store_order ) {
        if ( $commission_id > 0 ) {
            $disbursement_status = MultiVendorX()->setting->get_setting( 'disbursement_order_status' );
            if ( ! empty( $disbursement_status ) && in_array( $store_order->get_status(), $disbursement_status, true ) ) {
                $this->create_transaction( $commission_id, $store_order );
            }
        }
    }

    /**
	 * Create transaction for sub order.
	 *
	 * @param integer $order_id    Order Id.
	 * @param string  $old_status  Old status.
	 * @param string  $new_status  New status.
	 * @param object  $order       Order object.
	 */
    public function create_transaction_for_sub_order( $order_id, $old_status, $new_status, $order ) {
        if ( $order->get_parent_id() === 0 ) {
            return;
        }

        // If (payment method is stripe or paypal marketplace and the check charges then this function return).
        $disbursement_status = MultiVendorX()->setting->get_setting( 'disbursement_order_status' );
        if ( ! empty( $disbursement_status ) && in_array( $new_status, $disbursement_status, true ) ) {
            $commission_id = $order->get_meta( Utill::ORDER_META_SETTINGS['commission_id'], true );
            $this->create_transaction( $commission_id, $order );
        }
    }

    /**
	 * Create transaction.
	 *
	 * @param integer $commission_id Commission Id.
	 * @param object  $order         Order object.
	 */
    public function create_transaction( $commission_id, $order ) {
        global $wpdb;

        $exists = $this->get_transaction_db( $commission_id );
        if ( ! empty( $exists ) ) {
            return;
        }

        $lock_period = (int) MultiVendorX()->setting->get_setting( 'commission_lock_period', 0 );
        $status      = 'Upcoming';
        $time        = current_time( 'mysql' );

        $commission = CommissionUtil::get_commission_db( $commission_id );

        if ( 0 === $lock_period ) {
            $status = 'Completed';
        } elseif ( $lock_period > 0 ) {
            $status = 'Upcoming';
            $time   = gmdate( 'Y-m-d H:i:s', current_time( 'mysql' ) + ( $lock_period * DAY_IN_SECONDS ) );
        }

        $data = array(
            'store_id'         => (int) $commission->store_id,
            'order_id'         => (int) $commission->order_id,
            'commission_id'    => (int) $commission_id,
            'entry_type'       => 'Cr',
            'transaction_type' => 'Commission',
            'amount'           => (float) $commission->store_payable,
            'currency'         => get_woocommerce_currency(),
            'currency_symbol'  => Utill::multivendorx_get_currency_symbol( get_woocommerce_currency() ),
            'narration'        => 'Commission received for order ' . $order->get_id(),
            'status'           => $status,
            'available_at'     => $time,
        );

        $format = array( '%d', '%d', '%d', '%s', '%s', '%f', '%s', '%s', '%s', '%s' );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->insert( $wpdb->prefix . Utill::TABLES['transaction'], $data, $format );

        $transaction_id = $wpdb->insert_id;

        if ( $transaction_id ) {
            $wpdb->update( $wpdb->prefix . Utill::TABLES['commission'], array( 'status' => 'paid' ), array( 'id' => $commission_id ), array( '%s' ), array( '%d' ) );
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        do_action( 'multivendorx_after_create_transaction', $transaction_id, $commission );
        return $transaction_id;
    }

    /**
	 * Get class object.
	 *
	 * @param string $class Class name.
	 */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    /**
	 * Get transaction db data.
	 *
	 * @param integer $commission_id Commission Id.
	 */
    public static function get_transaction_db( $commission_id ) {
        global $wpdb;
        $transaction = $wpdb->get_row(
            $wpdb->prepare( 'SELECT * FROM `' . $wpdb->prefix . Utill::TABLES['transaction'] . '` WHERE commission_id = %d', $commission_id ),
            ARRAY_A
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $transaction ?? array();
    }

    /**
     * Get transaction information.
     *
     * @param array $args Arguments.
     *
     * @return array
     */
    public static function get_transaction_information( $args ) {
        global $wpdb;

        $where = array();

        // Extract and sanitize order/orderBy early so they don't go into WHERE.
        $orderBy = isset( $args['orderBy'] ) ? esc_sql( $args['orderBy'] ) : '';
        $order   = isset( $args['order'] ) ? strtoupper( esc_sql( $args['order'] ) ) : 'ASC';

        // Remove non-column keys.
        unset( $args['orderBy'], $args['order'] );

        // Filter by id(s).
        if ( isset( $args['id'] ) ) {
            $ids     = is_array( $args['id'] ) ? $args['id'] : array( $args['id'] );
            $ids     = implode( ',', array_map( 'intval', $ids ) );
            $where[] = "id IN ($ids)";
        }

        // Filter by store_id.
        if ( isset( $args['store_id'] ) ) {
            $where[] = ' ( store_id = ' . esc_sql( intval( $args['store_id'] ) ) . ' ) ';
        }

        // Filter by order_id.
        if ( isset( $args['order_id'] ) ) {
            $where[] = ' ( order_id = ' . esc_sql( intval( $args['order_id'] ) ) . ' ) ';
        }

        // Filter by commission_id.
        if ( isset( $args['commission_id'] ) ) {
            $where[] = ' ( commission_id = ' . esc_sql( intval( $args['commission_id'] ) ) . ' ) ';
        }

        // Filter by transaction_type.
        if ( isset( $args['transaction_type'] ) ) {
            $where[] = " ( transaction_type = '" . esc_sql( $args['transaction_type'] ) . "' ) ";
        }

        // Filter by entry_type (Cr/Dr).
        if ( isset( $args['entry_type'] ) ) {
            $where[] = " ( entry_type = '" . esc_sql( $args['entry_type'] ) . "' ) ";
        }

        // Filter by status.
        if ( isset( $args['status'] ) ) {
            $where[] = " ( status = '" . esc_sql( $args['status'] ) . "' ) ";
        }

        // Filter by date range.
        if ( isset( $args['start_date'] ) ) {
            $where[] = " ( created_at >= '" . esc_sql( $args['start_date'] ) . "' ) ";
        }
        if ( isset( $args['end_date'] ) ) {
            $where[] = " ( created_at <= '" . esc_sql( $args['end_date'] ) . "' ) ";
        }

        $table = $wpdb->prefix . Utill::TABLES['transaction'];

        // Base query (count or select).
        if ( isset( $args['count'] ) ) {
            $query = "SELECT COUNT(*) FROM $table";
        } else {
            $query = "SELECT * FROM $table";
        }

        // Add WHERE.
        if ( ! empty( $where ) ) {
            $condition = $args['condition'] ?? ' AND ';
            $query    .= ' WHERE ' . implode( $condition, $where );
        }

        // Add ORDER BY (only for non-count queries).
        if ( ! isset( $args['count'] ) && ! empty( $orderBy ) ) {
            // Only allow ASC or DESC.
            if ( ! in_array( $order, array( 'ASC', 'DESC' ), true ) ) {
                $order = 'ASC';
            }
            $query .= " ORDER BY {$orderBy} {$order}";
        }

        // Add limit & offset (only for non-count).
        if ( ! isset( $args['count'] ) && isset( $args['limit'], $args['offset'] ) ) {
            $limit  = intval( $args['limit'] );
            $offset = intval( $args['offset'] );
            $query .= " LIMIT {$limit} OFFSET {$offset}";
        }

        // Run query.
        if ( isset( $args['count'] ) ) {
            return (int) ( $wpdb->get_var( $query ) ?? 0 );
        }
        $result = $wpdb->get_results( $query, ARRAY_A ) ?? array();

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $result;
    }

    /**
     * Get balances for a given store ID.
     *
     * @param int $store_id The store ID.
     * @return array|float An associative array containing 'balance' and 'locking_balance' or the total lifetime earnings.
     */
    public static function get_balances_for_store( $store_id, $total = false ) {
        global $wpdb;
        $table_name = $wpdb->prefix . Utill::TABLES['transaction'];

        if ( $total ) {
            $total_earning = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT SUM(amount) 
                    FROM $table_name 
                    WHERE store_id = %d",
                    $store_id
                )
            );

            return $total_earning;
        }

        $query = $wpdb->prepare(
            "
            SELECT 
                balance, 
                locking_balance
            FROM {$table_name}
            WHERE store_id = %d
            ORDER BY id DESC
            LIMIT 1
        ",
            $store_id
        );

        // Fetch the result.
        $result = $wpdb->get_row( $query );

        if ( ! $result ) {
            return array(
                'balance'         => 0.00,
                'locking_balance' => 0.00,
            );
        }

        $minimum_wallet_amount = MultiVendorX()->setting->get_setting( 'wallet_threshold_amount', 0 );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return array(
            'balance'         => floatval( max( 0, $result->balance - $minimum_wallet_amount ) ),
            'locking_balance' => floatval( $result->locking_balance ),
        );
    }
}
