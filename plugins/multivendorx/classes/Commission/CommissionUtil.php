<?php
/**
 * Modules Commission Util
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Commission;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Commission Util.
 *
 * @class       Module class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class CommissionUtil {

	/**
	 * Get a single commission row from databse by using commission id.
	 * Return stdClass object represent a single row.
     *
	 * @param   mixed $id Commission ID.
	 * @return  array | object | \stdClass
	 */
	public static function get_commission_db( $id ) {
		global $wpdb;

		$table_name = $wpdb->prefix . Utill::TABLES['commission'];
		$commission = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare( 'SELECT * FROM %i WHERE ID = %d', $table_name, $id )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		return $commission ?? new \stdClass();
	}

    /**
     * Get the commission object of Commission class.
     *
     * @param   int $id Commission ID.
     * @return  Commission Commission Object.
     */
    public static function get_commission( $id ) {
        return new Commission( $id );
    }

	/**
	 * Get the commission object of Commission class by store id and order id.
	 *
	 * @param   int $store_id Store ID.
	 * @param   int $order_id Order ID.
	 * @return  object|\stdClass
	 */
	public static function get_commission_by_store_and_order_id( $store_id, $order_id ) {
		global $wpdb;

		$table_name = $wpdb->prefix . Utill::TABLES['commission'];
		$commission = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare( 'SELECT * FROM %i WHERE store_id = %d AND order_id = %d', $table_name, $store_id, $order_id )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		return $commission ?? new \stdClass();
	}

    /**
     * Fetch commission records or return total count based on filters.
     *
     * Supports filtering by IDs, order, store, customer, status, date range,
     * sorting, pagination, and count-only queries.
     *
     * @param array $args Query arguments.
     * @return array|int Commission records array or total count.
     */
    public static function get_commission_information( $args = array() ) {
        global $wpdb;

        $where    = array();
        $or_where = array();
        $params   = array();

        if ( isset( $args['ID'] ) ) {
            $ids          = is_array( $args['ID'] ) ? $args['ID'] : array( $args['ID'] );
            $ids          = array_map( 'intval', $ids );
            $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            $or_where[]   = "ID IN ($placeholders)";
            $params       = array_merge( $params, $ids );
        }

        if ( isset( $args['order_id'] ) ) {
            $ids          = is_array( $args['order_id'] ) ? $args['order_id'] : array( $args['order_id'] );
            $ids          = array_map( 'intval', $ids );
            $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            $or_where[]   = "order_id IN ($placeholders)";
            $params       = array_merge( $params, $ids );
        }

        if ( isset( $args['store_id'] ) ) {
            $ids          = is_array( $args['store_id'] ) ? $args['store_id'] : array( $args['store_id'] );
            $ids          = array_map( 'intval', $ids );
            $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            $where[]      = "store_id IN ($placeholders)";
            $params       = array_merge( $params, $ids );
        }

        if ( isset( $args['customer_id'] ) ) {
            $ids          = is_array( $args['customer_id'] ) ? $args['customer_id'] : array( $args['customer_id'] );
            $ids          = array_map( 'intval', $ids );
            $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            $where[]      = "customer_id IN ($placeholders)";
            $params       = array_merge( $params, $ids );
        }

        if ( isset( $args['status'] ) ) {
            $where[]  = 'status = %s';
            $params[] = $args['status'];
        }

        if ( isset( $args['start_date'], $args['end_date'] ) ) {
            $where[]  = 'created_at BETWEEN %s AND %s';
            $params[] = $args['start_date'];
            $params[] = $args['end_date'];
        }

        $table = $wpdb->prefix . Utill::TABLES['commission'];

        $is_count = ! empty( $args['count'] );

        array_unshift( $params, $table );

        // $where_clause holds only %d/%s placeholder tokens built from the filters above, never raw data; every real value is bound positionally via $params.
        $where_clause = '';
        if ( ! empty( $where ) || ! empty( $or_where ) ) {
            $where_clause = ' WHERE ';

            if ( ! empty( $where ) ) {
                $where_clause .= implode( ' AND ', $where );
            }

            if ( ! empty( $or_where ) ) {
                if ( ! empty( $where ) ) {
                    $where_clause .= ' AND ';
                }
                $where_clause .= '(' . implode( ' OR ', $or_where ) . ')';
            }
        }

        // Sorting. $order_by/$order are both restricted to fixed whitelists above, never raw input.
        $order_clause = '';
        if ( ! empty( $args['order_by'] ) && ! $is_count ) {
            $allowed_columns = array( 'ID', 'order_id', 'status', 'store_id', 'create_time' );
            $order_by        = in_array( $args['order_by'], $allowed_columns, true ) ? $args['order_by'] : 'ID';
            $order           = ( isset( $args['order'] ) && strtolower( $args['order'] ) === 'desc' ) ? 'DESC' : 'ASC';
            $order_clause     = " ORDER BY {$order_by} {$order}";
        }

        // Pagination.
        $limit_clause = '';
        if ( isset( $args['limit'], $args['offset'] ) && ! $is_count ) {
            $limit_clause = ' LIMIT %d OFFSET %d';
            $params[]     = intval( $args['limit'] );
            $params[]     = intval( $args['offset'] );
        }

        if ( $is_count ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
            $results = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i' . $where_clause, ...$params ) );
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
            $results = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i' . $where_clause . $order_clause . $limit_clause, ...$params ), ARRAY_A );
        }

        /** Centralized error logging */
        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $results ?? ( $is_count ? 0 : array() );
    }

	/**
	 * Get commission summary for a store or top N stores.
	 *
	 * @param   int   $store_id    Store ID.
	 * @param   bool  $dashboard   Whether to return dashboard data.
	 * @param   bool  $top_stores  If true, fetch top N stores by total order value.
	 * @param   int   $limit       Number of stores to fetch.
	 * @param   array $args       Additional arguments (start_date, end_date).
	 *
	 * @return  array  Array of commission summary.
	 */
	public static function get_commission_summary_for_store( $store_id = null, $dashboard = false, $top_stores = false, $limit = 3, $args = array() ) {
		global $wpdb;

		$table_name = $wpdb->prefix . Utill::TABLES['commission'];

		// If $top_stores = true, fetch top N stores by total order value.
        if ( $top_stores ) {
            // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery
            // phpcs:disable WordPress.DB.DirectDatabaseQuery.NoCaching
            $results = $wpdb->get_results(
                $wpdb->prepare(
                    '
                    SELECT
                        store_id,
                        COALESCE(SUM(total_order_value), 0) AS total_order_amount,
                        COALESCE(SUM(facilitator_fee), 0) AS facilitator_fee,
                        COALESCE(SUM(gateway_fee), 0) AS gateway_fee,
                        COALESCE(SUM(store_shipping), 0) AS shipping_amount,
                        COALESCE(SUM(store_tax), 0) AS tax_amount,
                        COALESCE(SUM(store_shipping_tax), 0) AS shipping_tax_amount,
                        COALESCE(SUM(store_payable), 0) AS commission_total,
                        COALESCE(SUM(store_refunded), 0) AS commission_refunded
                    FROM %i
                    GROUP BY store_id
                    ORDER BY total_order_amount DESC
                    LIMIT %d
                    ',
                    $table_name,
                    $limit
                )
            );
            // phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery
            // phpcs:enable WordPress.DB.DirectDatabaseQuery.NoCaching

            if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
                MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
            }

            return array_map(
                function ( $row ) {
                    $store = new Store( $row->store_id );
                    if ( $store->exists() ) {
                        $store_name = $store->get( 'name' );
                    }

                    return array(
                        'store_id'            => intval( $row->store_id ),
                        'store_name'          => $store_name,
                        'total_order_amount'  => floatval( $row->total_order_amount ),
                        'facilitator_fee'     => floatval( $row->facilitator_fee ),
                        'gateway_fee'         => floatval( $row->gateway_fee ),
                        'shipping_amount'     => floatval( $row->shipping_amount ),
                        'tax_amount'          => floatval( $row->tax_amount ),
                        'shipping_tax_amount' => floatval( $row->shipping_tax_amount ),
                        'commission_total'    => floatval( $row->commission_total ),
                        'commission_refunded' => floatval( $row->commission_refunded ),
                    );
                },
                $results
            );
        }

		if ( $dashboard ) {
			$params = array( $table_name, $store_id );

			// $date_clause holds only a %s/%s placeholder pair, never raw data; real values are bound positionally via $params.
			$date_clause = '';
			if ( ! empty( $args['start_date'] ) && ! empty( $args['end_date'] ) ) {
				$date_clause = ' AND DATE(created_at) BETWEEN %s AND %s';
				$params[]    = $args['start_date'];
				$params[]    = $args['end_date'];
			}

			// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery
			// phpcs:disable WordPress.DB.DirectDatabaseQuery.NoCaching
			// phpcs:disable WordPress.DB.PreparedSQL.NotPrepared
			$results = $wpdb->get_results(
                $wpdb->prepare(
                    "
                    SELECT
                        DATE_FORMAT(created_at, '%b') AS month,
                        ROUND(SUM(total_order_value), 2) AS total_order_amount,
                        ROUND(SUM(store_earning), 2) AS store_earnings,
                        COUNT(DISTINCT order_id) AS orders
                    FROM %i
                    WHERE store_id = %d
                    " . $date_clause . '
                    GROUP BY YEAR(created_at), MONTH(created_at)
                    ORDER BY created_at ASC
                    ',
                    $params
                ),
                ARRAY_A
			);
			// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery
			// phpcs:enable WordPress.DB.DirectDatabaseQuery.NoCaching
			// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared

			return $results ?? array();
		}

		// Summary for a specific store.
        $params = array( $table_name );

        // $store_clause/$date_clause hold only %d/%s placeholder tokens, never raw data; real values are bound positionally via $params.
        $store_clause = '';
        if ( ! empty( $store_id ) ) {
            $store_clause = ' AND store_id = %d';
            $params[]     = $store_id;
        }

        $date_clause = '';
        if ( ! empty( $args['start_date'] ) && ! empty( $args['end_date'] ) ) {
            $date_clause = ' AND DATE(created_at) BETWEEN %s AND %s';
            $params[]    = $args['start_date'];
            $params[]    = $args['end_date'];
        }

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $result = $wpdb->get_row(
            $wpdb->prepare(
                '
                SELECT
                    COUNT(DISTINCT order_id) AS order_count,
                    COALESCE(SUM(total_order_value), 0) AS total_order_amount,
                    COALESCE(SUM(facilitator_fee), 0) AS facilitator_fee,
                    COALESCE(SUM(gateway_fee), 0) AS gateway_fee,
                    COALESCE(SUM(store_shipping), 0) AS shipping_amount,
                    COALESCE(SUM(store_tax), 0) AS tax_amount,
                    COALESCE(SUM(store_shipping_tax), 0) AS shipping_tax_amount,
                    COALESCE(SUM(store_payable), 0) AS commission_total,
                    COALESCE(SUM(store_refunded), 0) AS commission_refunded
                FROM %i
                WHERE 1=1
                ' . $store_clause . $date_clause,
                $params
            )
        );
        // phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		return array(
            'order_count'         => intval( $result->order_count ),
			'total_order_amount'  => floatval( $result->total_order_amount ),
			'facilitator_fee'     => floatval( $result->facilitator_fee ),
			'gateway_fee'         => floatval( $result->gateway_fee ),
			'shipping_amount'     => floatval( $result->shipping_amount ),
			'tax_amount'          => floatval( $result->tax_amount ),
			'shipping_tax_amount' => floatval( $result->shipping_tax_amount ),
			'commission_total'    => floatval( $result->commission_total ),
			'commission_refunded' => floatval( $result->commission_refunded ),
		);
	}
}
