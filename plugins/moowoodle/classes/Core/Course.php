<?php
/**
 * Course class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Core;

defined( 'ABSPATH' ) || exit;

use MooWoodle\Util;
use MooWoodle\FrontendScripts;

/**
 * MooWoodle Course class
 *
 * @class       Course class
 * @version     3.3.0
 * @author      DualCube
 */
class Course {
	/**
	 * Course constructor.
	 */
	public function __construct() {
		// Add Link Moodle Course in WooCommerce edit product tab.
		add_action( 'add_meta_boxes', array( $this, 'add_additional_metabox' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ), 20 );
	}

	/**
	 * Enqueues all assets for admin.
	 *
	 * @return void
	 */
	public function enqueue_admin_assets() {
		$screen = get_current_screen();
		if ( ! empty( $screen ) && 'product' === $screen->post_type ) {
			FrontendScripts::enqueue_style( 'moowoodle-moodle-enrollment-mapping' );
			FrontendScripts::enqueue_script( 'moowoodle-moodle-enrollment-mapping' );
			FrontendScripts::localize_scripts( 'moowoodle-moodle-enrollment-mapping' );
		}
	}

	/**
	 * Get course details based on filter options.
	 *
	 * Filters supported in $query_args:
	 * - id, moodle_course_id, shortname, fullname
	 * - category_id, product_id, startdate, enddate
	 * - condition (AND/OR), limit, offset
	 *
	 * @param array $query_args Filter options.
	 * @return array List of matching courses.
	 */
	public static function get_courses( $query_args = array() ) {
		global $wpdb;

		$table_name = $wpdb->prefix . Util::TABLES['course'];

		$is_count = ! empty( $query_args['count'] );

		$conditions = array();
		$values     = array();

		if ( isset( $query_args['id'] ) ) {
			$ids          = array_map( 'intval', (array) $query_args['id'] );
			$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
			$conditions[] = 'id IN (' . $placeholders . ')';
			$values       = array_merge( $values, $ids );
		}

		foreach ( array( 'moodle_course_id', 'category_id', 'product_id', 'startdate', 'enddate' ) as $field ) {
			if ( isset( $query_args[ $field ] ) ) {
				$conditions[] = $field . ' = %d';
				$values[]     = (int) $query_args[ $field ];
			}
		}

		foreach ( array( 'shortname', 'fullname' ) as $field ) {
			if ( isset( $query_args[ $field ] ) ) {
				$conditions[] = $field . ' LIKE %s';
				$values[]     = '%' . $wpdb->esc_like( $query_args[ $field ] ) . '%';
			}
		}

		if ( ! empty( $query_args['expired'] ) ) {
			$conditions[] = 'enddate > 0 AND enddate <= %d';
			$values[]     = time();
		}

		if ( ! empty( $query_args['has_product'] ) ) {
			$conditions[] = 'product_id > 0';
		}

		$join      = ( 'OR' === strtoupper( $query_args['condition'] ?? 'AND' ) ) ? ' OR ' : ' AND ';
		$where_sql = $conditions ? ' WHERE ' . implode( $join, $conditions ) : '';

		if ( $is_count ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$course_count = $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i' . $where_sql,
					$table_name,
					...$values
				)
			);
			return $course_count ?? 0;
		}

		$has_limit = isset( $query_args['limit'] );
		$limit     = $has_limit ? (int) $query_args['limit'] : PHP_INT_MAX;
		$offset    = ( $has_limit && isset( $query_args['offset'] ) ) ? (int) $query_args['offset'] : 0;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$courses = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT * FROM %i' . $where_sql . ' LIMIT %d OFFSET %d',
				$table_name,
				...array_merge( $values, array( $limit, $offset ) )
			),
			ARRAY_A
		);

		return $courses ? self::select_columns( $courses, $query_args['fields'] ?? '*' ) : array();
	}

	/**
	 * Keep only the requested columns of each course row.
	 *
	 * @param array        $rows   Course rows.
	 * @param string|array $fields Column name(s), or '*' for every column.
	 * @return array
	 */
	private static function select_columns( $rows, $fields ) {
		if ( '*' === $fields ) {
			return $rows;
		}

		$columns = array_flip( array_map( 'sanitize_key', (array) $fields ) );

		return array_map( fn( $row ) => array_intersect_key( $row, $columns ), $rows );
	}

	/**
	 * Insert or update a course record by Moodle course ID.
	 *
	 * @param array $course_data Course data. Must include 'moodle_course_id'.
	 * @return int|false Course ID on success, false on failure.
	 */
	public static function update_course( $course_data ) {
		global $wpdb;

		$moodle_course_id = (int) ( $course_data['moodle_course_id'] ?? 0 );
		if ( empty( $moodle_course_id ) ) {
			return false;
		}

		$table_name         = $wpdb->prefix . Util::TABLES['course'];
		$existing_course_id = self::get_courses(
			array(
				'moodle_course_id' => $moodle_course_id,
				'fields'           => 'id',
				'limit'            => 1,
			)
		);

		$existing_course_id = (int) ( $existing_course_id[0]['id'] ?? 0 );

		if ( $existing_course_id > 0 ) {
			$updated = $wpdb->update( $table_name, $course_data, array( 'moodle_course_id' => $moodle_course_id ) );
			if ( false !== $updated ) {
				return $existing_course_id;
			}
			return false;
		}

		$course_data['created'] = current_time( 'mysql' );
		return $wpdb->insert( $table_name, $course_data ) !== false // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		? $wpdb->insert_id
		: false;
	}

	/**
	 * Update or insert multiple courses based on Moodle data.
	 * Skips courses with format 'site'.
	 *
	 * @param array $moodle_courses      List of courses to update or insert.
	 * @param bool  $force_delete Whether to remove excluded course IDs after sync.
	 * @return void
	 */
	public function update_courses( $moodle_courses, $force_delete = true ) {
		if ( empty( $moodle_courses ) || ! is_array( $moodle_courses ) ) {
			return;
		}

		$synced_course_ids = array();
		foreach ( $moodle_courses as $course ) {
			if ( empty( $course['format'] ) || 'site' === $course['format'] ) {
				continue;
			}

			$course_data = array(
				'moodle_course_id' => (int) $course['id'],
				'shortname'        => sanitize_text_field( $course['shortname'] ?? '' ),
				'category_id'      => (int) ( $course['categoryid'] ?? 0 ),
				'fullname'         => sanitize_text_field( $course['fullname'] ?? '' ),
				'startdate'        => (int) ( $course['startdate'] ?? 0 ),
				'enddate'          => (int) ( $course['enddate'] ?? 0 ),
			);

			$synced_course_ids[] = self::update_course( $course_data );

			Util::increment_sync_count( 'course' );
		}
		if ( $force_delete ) {
			self::cleanup_courses( $synced_course_ids );
		}
	}

	/**
	 * Add the "Moodle Enrollment Mapping" meta box to the product edit screen.
	 *
	 * @return void
	 */
	public function add_additional_metabox() {
		add_meta_box(
			'moowoodle-product-metabox',
			__( 'Moodle Enrollment Mapping', 'moowoodle' ),
			array( $this, 'render_product_metabox' ),
			'product',
			'normal',
			'default'
		);
	}

	/**
	 * Add meta box panel.
	 *
	 * @return void
	 */
	public function render_product_metabox() {
		echo '<div id="moodle-enrollment-mapping-tab"></div>';
	}

	/**
	 * Delete all courses whose IDs are not present in $exclude_ids array.
	 *
	 * @param array $exclude_ids course ids.
	 * @return void
	 */
	public static function cleanup_courses( $exclude_ids ) {
		global $wpdb;

		$exclude_ids = array_map( 'intval', (array) $exclude_ids );
		if ( empty( $exclude_ids ) ) {
			return;
		}
		$existing_ids = self::get_courses(
			array(
				'fields' => 'id',
			)
		);

		$existing_ids  = wp_list_pluck( $existing_ids, 'id' );
		$ids_to_delete = array_diff( $existing_ids, $exclude_ids );
		$table_name    = $wpdb->prefix . Util::TABLES['course'];

		foreach ( $ids_to_delete as $course_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->delete( $table_name, array( 'id' => $course_id ) );
		}
	}
}
