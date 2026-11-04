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

		$conditions = array();
		$values     = array();

		if ( ! empty( $args['store_ids'] ) ) {
			$ids          = array_map( 'intval', (array) $args['store_ids'] );
			$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
			$conditions[] = 'store_id IN (' . $placeholders . ')';
			$values       = array_merge( $values, $ids );
		}

		if ( ! empty( $args['email'] ) ) {
			$conditions[] = 'email = %s';
			$values[]     = sanitize_email( $args['email'] );
		}

		if ( ! empty( $args['product_id'] ) ) {
			$conditions[] = 'product_id = %d';
			$values[]     = absint( $args['product_id'] );
		}

		if ( isset( $args['date_range'] ) ) {
			$conditions[] = 'DATE(created_at) BETWEEN %s AND %s';
			$values[]     = (string) ( $args['date_range']['start'] ?? '' );
			$values[]     = (string) ( $args['date_range']['end'] ?? '' );
		}

		$where_sql = $conditions ? implode( ' AND ', $conditions ) : '1=1';

		if ( ! empty( $args['count'] ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$result = (int) $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i WHERE ' . $where_sql,
					$table,
					...$values
				)
			);
		} else {
			// Order by (column and direction both allowlisted); default is newest first.
			$allowed   = array( 'created_at', 'updated_at', 'id', 'store_id', 'product_id' );
			$order_by  = ( isset( $args['order_by'] ) && in_array( $args['order_by'], $allowed, true ) ) ? $args['order_by'] : 'created_at';
			$order_dir = ( isset( $args['order'] ) && 'ASC' === strtoupper( $args['order'] ) ) ? 'ASC' : 'DESC';
			$has_limit = isset( $args['limit'], $args['offset'] );
			$limit     = $has_limit ? intval( $args['limit'] ) : PHP_INT_MAX;
			$offset    = $has_limit ? intval( $args['offset'] ) : 0;

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$result = (array) $wpdb->get_results(
				$wpdb->prepare(
					'SELECT * FROM %i WHERE ' . $where_sql . ' ORDER BY %i ' . $order_dir . ' LIMIT %d OFFSET %d',
					$table,
					...array_merge( $values, array( $order_by, $limit, $offset ) )
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
