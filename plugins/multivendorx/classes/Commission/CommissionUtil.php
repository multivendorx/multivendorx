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
 * @version     PRODUCT_VERSION
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
        $commission = $wpdb->get_row(
            $wpdb->prepare( 'SELECT * FROM `' . $wpdb->prefix . Utill::TABLES['commission'] . '` WHERE ID = %d', $id )
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
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
     */
    public static function get_commission_by_store_and_order_id( $store_id, $order_id ) {
        global $wpdb;
        $commission = $wpdb->get_row(
            $wpdb->prepare( 'SELECT * FROM `' . $wpdb->prefix . Utill::TABLES['commission'] . '` WHERE store_id = %d AND order_id = %d', $store_id, $order_id )
        );
        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
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

        $where = array();

        if ( isset( $args['ID'] ) ) {
            $ids        = is_array( $args['ID'] ) ? $args['ID'] : array( $args['ID'] );
            $ids        = implode( ',', array_map( 'intval', $ids ) );
            $or_where[] = "ID IN ($ids)";
        }
        
        if ( isset( $args['order_id'] ) ) {
            $ids        = is_array( $args['order_id'] ) ? $args['order_id'] : array( $args['order_id'] );
            $ids        = implode( ',', array_map( 'intval', $ids ) );
            $or_where[] = "order_id IN ($ids)";
        }        

        if ( isset( $args['store_id'] ) ) {
            $ids     = is_array( $args['store_id'] ) ? $args['store_id'] : array( $args['store_id'] );
            $ids     = implode( ',', array_map( 'intval', $ids ) );
            $where[] = "store_id IN ($ids)";
        }

        if ( isset( $args['customer_id'] ) ) {
            $ids     = is_array( $args['customer_id'] ) ? $args['customer_id'] : array( $args['customer_id'] );
            $ids     = implode( ',', array_map( 'intval', $ids ) );
            $where[] = "customer_id IN ($ids)";
        }

        if ( isset( $args['status'] ) ) {
            $where[] = "status = '" . esc_sql( $args['status'] ) . "'";
        }

        if ( isset( $args['start_date'], $args['end_date'] ) ) {
            $where[] = "created_at BETWEEN '" . esc_sql( $args['start_date'] ) . "' AND '" . esc_sql( $args['end_date'] ) . "'";
        }

        $table = $wpdb->prefix . Utill::TABLES['commission'];

        $is_count = ! empty( $args['count'] );

        if ( $is_count ) {
            $query = "SELECT COUNT(*) FROM {$table}";
        } else {
            $query = "SELECT * FROM {$table}";
        }

        if ( ! empty( $where ) || ! empty( $or_where ) ) {
            $query .= ' WHERE ';
        
            if ( ! empty( $where ) ) {
                $query .= implode( ' AND ', $where );
            }
        
            if ( ! empty( $or_where ) ) {
                if ( ! empty( $where ) ) {
                    $query .= ' AND ';
                }
                $query .= '(' . implode( ' OR ', $or_where ) . ')';
            }
        }        

        // Sorting
        if ( ! empty( $args['orderBy'] ) && ! $is_count ) {
            $allowed_columns = array( 'ID', 'order_id', 'status', 'store_id', 'create_time' );
            $orderBy         = in_array( $args['orderBy'], $allowed_columns, true ) ? $args['orderBy'] : 'ID';
            $order           = ( isset( $args['order'] ) && strtolower( $args['order'] ) === 'desc' ) ? 'DESC' : 'ASC';
            $query          .= " ORDER BY {$orderBy} {$order}";
        }

        // Pagination (logic fixed)
        if ( isset( $args['limit'], $args['offset'] ) && ! $is_count ) {
            $limit  = intval( $args['limit'] );
            $offset = intval( $args['offset'] );
            $query .= " LIMIT {$limit} OFFSET {$offset}";
        }

        if ( $is_count ) {
            $results = (int) $wpdb->get_var( $query );
        } else {
            $results = $wpdb->get_results( $query, ARRAY_A );
        }

        /** Centralized error logging */
        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $results ?? ( $is_count ? 0 : array() );
    }

    /**
     * Get commission summary for a store or top N stores.
     *
     * @param   int  $store_id  Store ID.
     * @param   bool $top_stores  If true, fetch top N stores by total order value.
     * @param   int  $limit  Number of stores to fetch.
     *
     * @return  array  Array of commission summary.
     */
    public static function get_commission_summary_for_store( $store_id = null, $dashboard = false, $top_stores = false, $limit = 3, $args = [] ) {
        global $wpdb;

        $table_name = $wpdb->prefix . Utill::TABLES['commission'];

        // If $top_stores = true, fetch top N stores by total order value.
        if ( $top_stores ) {
            $query = $wpdb->prepare(
                "
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
                FROM {$table_name}
                GROUP BY store_id
                ORDER BY total_order_amount DESC
                LIMIT %d
            ",
                $limit
            );

            $results = $wpdb->get_results( $query );

            if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
                MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
            }

            return array_map(
                function ( $row ) {
                    $store      = new Store( $row->store_id );
                    $store_name = $store ? $store->get( 'name' ) : '';

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
            $query = "
                SELECT
                    DATE_FORMAT(created_at, '%b') AS month,
                    ROUND(SUM(total_order_value), 2) AS total_order_amount,
                    ROUND(SUM(store_earning), 2) AS store_earnings,
                    COUNT(DISTINCT order_id) AS orders
                FROM {$table_name}
                WHERE store_id = %d
            ";

            $params = [ $store_id ];

            if ( ! empty( $args['start_date'] ) && ! empty( $args['end_date'] ) ) {
                $query   .= " AND DATE(created_at) BETWEEN %s AND %s";
                $params[] = $args['start_date'];
                $params[] = $args['end_date'];
            }

            $query .= "
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY created_at ASC
            ";

            $results = $wpdb->get_results(
                $wpdb->prepare( $query, $params ),
                ARRAY_A
            );

            return $results ?? [];
        }

        // Summary for a specific store.
        $query = "
            SELECT 
                COALESCE(SUM(total_order_value), 0) AS total_order_amount,
                COALESCE(SUM(facilitator_fee), 0) AS facilitator_fee,
                COALESCE(SUM(gateway_fee), 0) AS gateway_fee,
                COALESCE(SUM(store_shipping), 0) AS shipping_amount,
                COALESCE(SUM(store_tax), 0) AS tax_amount,
                COALESCE(SUM(store_shipping_tax), 0) AS shipping_tax_amount,
                COALESCE(SUM(store_payable), 0) AS commission_total,
                COALESCE(SUM(store_refunded), 0) AS commission_refunded
            FROM {$table_name}
        ";

        if ( ! empty( $store_id ) ) {
            $query .= $wpdb->prepare( ' WHERE store_id = %d', $store_id );
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $result = $wpdb->get_row( $query );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        // Last 30 days.
        $last_30_days = $wpdb->get_row(
            $wpdb->prepare(
                "
                SELECT
                    COUNT(DISTINCT order_id) AS orders,
                    ROUND(SUM(store_payable), 2) AS commission,
                    ROUND(SUM(total_order_value), 2) AS total
                FROM {$table_name}
                WHERE store_id = %d
                AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                ",
                $store_id
            ),
            ARRAY_A
        );

        // Previous 30 Days.
        $previous_30_days = $wpdb->get_row(
            $wpdb->prepare(
                "
                SELECT
                    COUNT(DISTINCT order_id) AS orders,
                    ROUND(SUM(store_payable), 2) AS commission,
                    ROUND(SUM(total_order_value), 2) AS total
                FROM {$table_name}
                WHERE store_id = %d
                AND created_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                AND created_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                ",
                $store_id
            ),
            ARRAY_A
        );

        return array(
            'total_order_amount'  => floatval( $result->total_order_amount ),
            'facilitator_fee'     => floatval( $result->facilitator_fee ),
            'gateway_fee'         => floatval( $result->gateway_fee ),
            'shipping_amount'     => floatval( $result->shipping_amount ),
            'tax_amount'          => floatval( $result->tax_amount ),
            'shipping_tax_amount' => floatval( $result->shipping_tax_amount ),
            'commission_total'    => floatval( $result->commission_total ),
            'commission_refunded' => floatval( $result->commission_refunded ),
            'last_30_days'        => $last_30_days,
            'previous_30_days'    => $previous_30_days,
        );
    }
}
