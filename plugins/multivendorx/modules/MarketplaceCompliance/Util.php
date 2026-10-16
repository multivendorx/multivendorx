<?php
/**
 * MultiVendorX Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\MarketplaceCompliance;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Marketplace Compliance Util class
 *
 * @class       Util class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Util {

	/**
	 * Create a new report abuse record.
	 *
	 * @param array $report_data The data for the new report abuse record.
	 * @return int|false The ID of the new record, or false on failure.
	 */
	public static function create_report_abuse( $report_data = array() ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['report_abuse'];

		$insert_data = array(
			'store_id'   => isset( $report_data['store_id'] ) ? intval( $report_data['store_id'] ) : 0,
			'product_id' => isset( $report_data['product_id'] ) ? intval( $report_data['product_id'] ) : 0,
			'name'       => isset( $report_data['name'] ) ? sanitize_text_field( $report_data['name'] ) : '',
			'email'      => isset( $report_data['email'] ) ? sanitize_email( $report_data['email'] ) : '',
			'message'    => isset( $report_data['message'] ) ? sanitize_textarea_field( $report_data['message'] ) : '',
		);

		$inserted = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$table,
			$insert_data,
			array( '%d', '%d', '%s', '%s', '%s' )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		// phpcs:ignore Squiz.Commenting.InlineComment.InvalidEndChar
		return $inserted ? $wpdb->insert_id : false;
	}


	/**
	 * Get report abuse information.
	 *
	 * @param array $args Query arguments.
	 * @return array|int Array of report abuse records or count if 'count' is set in args.
	 */
	public static function get_report_abuse_information( $args = array() ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['report_abuse'];

		// Every filter is always present in the literal query; an unused one is a no-op.
		$filter_by_stores = ! empty( $args['store_ids'] ) ? 1 : 0;
		$store_ids        = array_merge( array( 0 ), array_map( 'intval', (array) ( $args['store_ids'] ?? 0 ) ) ); // 0 keeps IN () valid for an empty list.
		$email            = ! empty( $args['email'] ) ? sanitize_email( $args['email'] ) : '';
		$product_id       = ! empty( $args['product_id'] ) ? absint( $args['product_id'] ) : 0;
		$by_date_range    = isset( $args['date_range'] ) ? 1 : 0;
		$date_start       = (string) ( $args['date_range']['start'] ?? '' );
		$date_end         = (string) ( $args['date_range']['end'] ?? '' );
		$filter_values    = array(
			$filter_by_stores,
			...array_fill( 0, 2, $email ),
			...array_fill( 0, 2, $product_id ),
			$by_date_range,
			$date_start,
			$date_end,
		);

		if ( ! empty( $args['count'] ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$result = (int) $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i
					WHERE ( %d = 0 OR store_id IN (' . esc_sql( implode( ',', $store_ids ) ) . ') )
					AND ( CHAR_LENGTH( %s ) = 0 OR email = %s )
					AND ( %d = 0 OR product_id = %d )
					AND ( %d = 0 OR DATE(created_at) BETWEEN %s AND %s )',
					$table,
					...$filter_values
				)
			);
		} else {
			// Order by (column and direction both allowlisted); default is newest first.
			$allowed   = array( 'created_at', 'updated_at', 'id', 'store_id', 'product_id' );
			$order_by  = ( isset( $args['order_by'] ) && in_array( $args['order_by'], $allowed, true ) ) ? $args['order_by'] : 'created_at';
			$sort_desc = ( isset( $args['order'] ) && 'ASC' === strtoupper( $args['order'] ) ) ? 0 : 1;
			$has_limit = isset( $args['limit'], $args['offset'] );
			$limit     = $has_limit ? intval( $args['limit'] ) : PHP_INT_MAX;
			$offset    = $has_limit ? intval( $args['offset'] ) : 0;

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$result = (array) $wpdb->get_results(
				$wpdb->prepare(
					'SELECT * FROM %i
					WHERE ( %d = 0 OR store_id IN (' . esc_sql( implode( ',', $store_ids ) ) . ') )
					AND ( CHAR_LENGTH( %s ) = 0 OR email = %s )
					AND ( %d = 0 OR product_id = %d )
					AND ( %d = 0 OR DATE(created_at) BETWEEN %s AND %s )
					ORDER BY CASE WHEN %d = 1 THEN %i END DESC, %i ASC
					LIMIT %d OFFSET %d',
					$table,
					...array_merge( $filter_values, array( $sort_desc, $order_by, $order_by, $limit, $offset ) )
				),
				ARRAY_A
			);
		}

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}
		return $result;
	}

	/**
	 * Delete a report abuse record.
	 *
	 * @param int $id The ID of the report abuse record to delete.
	 * @return bool True on success, false on failure.
	 */
	public static function delete_report_abuse( $id ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['report_abuse'];

		$id = intval( $id );
		if ( ! $id ) {
			return false;
		}

		$deleted = $wpdb->delete( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$table,
			array( 'id' => $id ),
			array( '%d' )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		if ( false === $deleted ) {
			return false;
		}

		return true;
	}
}
