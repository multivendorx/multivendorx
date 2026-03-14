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
 * @version     PRODUCT_VERSION
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

		// Sanitize and prepare data.
		$insert_data = array(
			'store_id'   => isset( $data['store_id'] ) ? intval( $data['store_id'] ) : 0,
			'product_id' => isset( $data['product_id'] ) ? intval( $data['product_id'] ) : 0,
			'name'       => isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : '',
			'email'      => isset( $data['email'] ) ? sanitize_email( $data['email'] ) : '',
			'message'    => isset( $data['message'] ) ? sanitize_textarea_field( $data['message'] ) : '',
		);

		// Insert data.
		$inserted = $wpdb->insert(
			$table,
			$insert_data,
			array( '%d', '%d', '%s', '%s', '%s' )
		);

		if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		// Return result AFTER logging
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
			? "SELECT COUNT(*) FROM $table"
			: "SELECT * FROM $table";

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
		? (int) $wpdb->get_var( $query )
		: (array) $wpdb->get_results( $query, ARRAY_A );

		if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
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

		$deleted = $wpdb->delete(
			$table,
			array( 'id' => $id ),
			array( '%d' )
		);

		if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		// $wpdb->delete returns number of rows deleted, or false on error.
		if ( false === $deleted ) {
			return false; // DB error.
		}

		return true; // Success, even if 0 rows (no row existed).
	}
}
