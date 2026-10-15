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

        $table    = $wpdb->prefix . Utill::TABLES['commission'];
        $is_count = ! empty( $args['count'] );

        // Each id filter is an "enabled" flag plus its list (0 keeps IN () valid for an empty list).
        $id_lists = array();
        foreach ( array( 'ID', 'order_id', 'store_id', 'customer_id' ) as $filter_key ) {
            $id_lists[ $filter_key ] = array_merge( array( 0 ), array_map( 'intval', (array) ( $args[ $filter_key ] ?? 0 ) ) );
        }
        $has_id       = isset( $args['ID'] ) ? 1 : 0;
        $has_order    = isset( $args['order_id'] ) ? 1 : 0;
        $has_store    = isset( $args['store_id'] ) ? 1 : 0;
        $has_customer = isset( $args['customer_id'] ) ? 1 : 0;
        $status       = (string) ( $args['status'] ?? '' );
        $by_dates     = isset( $args['start_date'], $args['end_date'] ) ? 1 : 0;

        $filter_values = array(
            $has_store,
            $has_customer,
            $status,
            $status,
            $by_dates,
            (string) ( $args['start_date'] ?? '' ),
            (string) ( $args['end_date'] ?? '' ),
            $has_id,
            $has_order,
            $has_id,
            $has_order,
        );

        // ID and order_id are alternatives (OR) to each other, but both are ANDed with the other filters.
        if ( $is_count ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $results = (int) $wpdb->get_var(
                $wpdb->prepare(
                    'SELECT COUNT(*) FROM %i
                    WHERE ( %d = 0 OR store_id IN (' . esc_sql( implode( ',', $id_lists['store_id'] ) ) . ') )
                    AND ( %d = 0 OR customer_id IN (' . esc_sql( implode( ',', $id_lists['customer_id'] ) ) . ') )
                    AND ( CHAR_LENGTH( %s ) = 0 OR status = %s )
                    AND ( %d = 0 OR created_at BETWEEN %s AND %s )
                    AND ( ( %d = 0 AND %d = 0 )
                        OR ( %d = 1 AND ID IN (' . esc_sql( implode( ',', $id_lists['ID'] ) ) . ') )
                        OR ( %d = 1 AND order_id IN (' . esc_sql( implode( ',', $id_lists['order_id'] ) ) . ') ) )',
                    $table,
                    ...$filter_values
                )
            );
        } else {
            $allowed_columns = array( 'ID', 'order_id', 'status', 'store_id', 'create_time' );
            $order_by        = ( ! empty( $args['order_by'] ) && in_array( $args['order_by'], $allowed_columns, true ) ) ? $args['order_by'] : 'ID';
            $sort_desc       = ( isset( $args['order'] ) && strtolower( $args['order'] ) === 'desc' ) ? 1 : 0;
            $has_limit       = isset( $args['limit'], $args['offset'] );
            $limit           = $has_limit ? intval( $args['limit'] ) : PHP_INT_MAX;
            $offset          = $has_limit ? intval( $args['offset'] ) : 0;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $results = $wpdb->get_results(
                $wpdb->prepare(
                    'SELECT * FROM %i
                    WHERE ( %d = 0 OR store_id IN (' . esc_sql( implode( ',', $id_lists['store_id'] ) ) . ') )
                    AND ( %d = 0 OR customer_id IN (' . esc_sql( implode( ',', $id_lists['customer_id'] ) ) . ') )
                    AND ( CHAR_LENGTH( %s ) = 0 OR status = %s )
                    AND ( %d = 0 OR created_at BETWEEN %s AND %s )
                    AND ( ( %d = 0 AND %d = 0 )
                        OR ( %d = 1 AND ID IN (' . esc_sql( implode( ',', $id_lists['ID'] ) ) . ') )
                        OR ( %d = 1 AND order_id IN (' . esc_sql( implode( ',', $id_lists['order_id'] ) ) . ') ) )
                    ORDER BY CASE WHEN %d = 1 THEN %i END DESC, %i ASC
                    LIMIT %d OFFSET %d',
                    $table,
                    ...array_merge( $filter_values, array( $sort_desc, $order_by, $order_by, $limit, $offset ) )
                ),
                ARRAY_A
            );
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
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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

		$start_date = (string) ( $args['start_date'] ?? '' );
		$end_date   = (string) ( $args['end_date'] ?? '' );
		$by_dates   = ( '' !== $start_date && '' !== $end_date ) ? 1 : 0;

		if ( $dashboard ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$results = $wpdb->get_results(
				$wpdb->prepare(
					"
					SELECT
						DATE_FORMAT(created_at, '%%b') AS month,
						ROUND(SUM(total_order_value), 2) AS total_order_amount,
						ROUND(SUM(store_earning), 2) AS store_earnings,
						COUNT(DISTINCT order_id) AS orders
					FROM %i
					WHERE store_id = %d
					AND ( %d = 0 OR DATE(created_at) BETWEEN %s AND %s )
					GROUP BY YEAR(created_at), MONTH(created_at)
					ORDER BY created_at ASC
					",
					$table_name,
					$store_id,
					$by_dates,
					$start_date,
					$end_date
				),
				ARRAY_A
			);

			return $results ?? array();
		}

		// Summary for a specific store (all stores when no store is given).
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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
				WHERE ( %d = 0 OR store_id = %d )
				AND ( %d = 0 OR DATE(created_at) BETWEEN %s AND %s )
				',
				$table_name,
				(int) $store_id,
				(int) $store_id,
				$by_dates,
				$start_date,
				$end_date
			)
		);

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
