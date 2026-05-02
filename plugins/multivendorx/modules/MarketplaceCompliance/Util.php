<?php
/**
 * MultiVendorX Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\MarketplaceCompliance;

use MultiVendorX\Utill;

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
	 * @param array $data The data for the new report abuse record.
	 * @return int|false The ID of the new record, or false on failure.
	 */
	public static function create_report_abuse( $data = array() ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['report_abuse'];

		$insert_data = array(
			'store_id'   => isset( $data['store_id'] ) ? intval( $data['store_id'] ) : 0,
			'product_id' => isset( $data['product_id'] ) ? intval( $data['product_id'] ) : 0,
			'name'       => isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : '',
			'email'      => isset( $data['email'] ) ? sanitize_email( $data['email'] ) : '',
			'message'    => isset( $data['message'] ) ? sanitize_textarea_field( $data['message'] ) : '',
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

		$where = array();

		$table = $wpdb->prefix . Utill::TABLES['report_abuse'];

		// Existing filters.
		if ( isset( $args['store_ids'] ) && ! empty( $args['store_ids'] ) ) {
			$store_ids = implode( ',', array_map( 'intval', $args['store_ids'] ) );
			$where[]   = "store_id IN ($store_ids)";
		}

	    if ( isset( $args['email'] ) && ! empty( $args['email'] ) ) {
			$where[] = $wpdb->prepare( 'email = %s', sanitize_email( $args['email'] ) );
		}

		// Date range filter.
		if ( isset( $args['date_range'] ) ) {
			$start   = esc_sql( $args['date_range']['start'] );
			$end     = esc_sql( $args['date_range']['end'] );
			$where[] = "DATE(created_at) BETWEEN '$start' AND '$end'";
		}

		// Build base query.
		$query = isset( $args['count'] ) && $args['count']
			? "SELECT COUNT(*) FROM $table" // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			: "SELECT * FROM $table"; // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

		if ( ! empty( $where ) ) {
			$query .= ' WHERE ' . implode( ' AND ', $where );
		}

		// Order by.
		if ( empty( $args['count'] ) && ! empty( $args['order_by'] ) ) {
			$order_by = esc_sql( $args['order_by'] );
			$order    = esc_sql( $args['order'] ?? 'DESC' );
			$query   .= " ORDER BY $order_by $order";
		}

		// Limit & offset.
		if ( isset( $args['limit'], $args['offset'] ) && empty( $args['count'] ) ) {
			$limit  = intval( $args['limit'] );
			$offset = intval( $args['offset'] );
			$query .= " LIMIT $limit OFFSET $offset";
		}

		$result = isset( $args['count'] ) && $args['count']
		? (int) $wpdb->get_var( $query ) // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
		: (array) $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

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
