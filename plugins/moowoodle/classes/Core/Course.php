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

		// Each condition is a 1/0 term (flag AND test) summed in SQL; a row matches when enough terms hit:
		// every enabled filter for AND, at least one for OR, none required when nothing is set.
		$ids          = array_merge( array( 0 ), array_map( 'intval', (array) ( $query_args['id'] ?? 0 ) ) );
		$enabled      = isset( $query_args['id'] ) ? 1 : 0;
		$term_values  = array( $enabled );
		$int_fields   = array( 'moodle_course_id', 'category_id', 'product_id', 'startdate', 'enddate' );
		$like_filters = array( 'shortname', 'fullname' );

		foreach ( array_merge( $int_fields, $like_filters ) as $field ) {
			$is_set        = isset( $query_args[ $field ] ) ? 1 : 0;
			$enabled      += $is_set;
			$term_values[] = $is_set;
			$term_values[] = in_array( $field, $like_filters, true )
				? '%' . $wpdb->esc_like( $query_args[ $field ] ?? '' ) . '%'
				: (int) ( $query_args[ $field ] ?? 0 );
		}

		$is_expired    = ! empty( $query_args['expired'] ) ? 1 : 0;
		$has_product   = ! empty( $query_args['has_product'] ) ? 1 : 0;
		$enabled      += $is_expired + $has_product;
		$term_values[] = $is_expired;
		$term_values[] = time();
		$term_values[] = $has_product;

		$required      = ( 'OR' === strtoupper( $query_args['condition'] ?? 'AND' ) ) ? min( 1, $enabled ) : $enabled;
		$term_values[] = $required;

		if ( $is_count ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$course_count = $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i
					WHERE (
						IF( %d = 1 AND id IN (' . esc_sql( implode( ',', $ids ) ) . '), 1, 0 )
						+ IF( %d = 1 AND moodle_course_id = %d, 1, 0 )
						+ IF( %d = 1 AND category_id = %d, 1, 0 )
						+ IF( %d = 1 AND product_id = %d, 1, 0 )
						+ IF( %d = 1 AND startdate = %d, 1, 0 )
						+ IF( %d = 1 AND enddate = %d, 1, 0 )
						+ IF( %d = 1 AND shortname LIKE %s, 1, 0 )
						+ IF( %d = 1 AND fullname LIKE %s, 1, 0 )
						+ IF( %d = 1 AND enddate > 0 AND enddate <= %d, 1, 0 )
						+ IF( %d = 1 AND product_id > 0, 1, 0 )
					) >= %d',
					$table_name,
					...$term_values
				)
			);
			return $course_count ?? 0;
		}

		$has_limit = isset( $query_args['limit'] );
		$limit     = $has_limit ? (int) $query_args['limit'] : PHP_INT_MAX;
		$offset    = ( $has_limit && isset( $query_args['offset'] ) ) ? (int) $query_args['offset'] : 0;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$courses = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT * FROM %i
				WHERE (
					IF( %d = 1 AND id IN (' . esc_sql( implode( ',', $ids ) ) . '), 1, 0 )
					+ IF( %d = 1 AND moodle_course_id = %d, 1, 0 )
					+ IF( %d = 1 AND category_id = %d, 1, 0 )
					+ IF( %d = 1 AND product_id = %d, 1, 0 )
					+ IF( %d = 1 AND startdate = %d, 1, 0 )
					+ IF( %d = 1 AND enddate = %d, 1, 0 )
					+ IF( %d = 1 AND shortname LIKE %s, 1, 0 )
					+ IF( %d = 1 AND fullname LIKE %s, 1, 0 )
					+ IF( %d = 1 AND enddate > 0 AND enddate <= %d, 1, 0 )
					+ IF( %d = 1 AND product_id > 0, 1, 0 )
				) >= %d
				LIMIT %d OFFSET %d',
				$table_name,
				...array_merge( $term_values, array( $limit, $offset ) )
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
	 * @return int|false Rows affected or false on failure.
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
	 * Creates custom tab for product types.
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
