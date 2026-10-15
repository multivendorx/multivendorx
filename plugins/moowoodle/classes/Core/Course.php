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

		// No caller in this codebase passes 'fields' today; rather than needing a dynamic,
		// caller-controlled SELECT column list (which can't be bound via the single-identifier
		// %i placeholder), every column is always fetched and projected down to the requested
		// subset in PHP afterward.
		$requested_fields = array();
		if ( ! empty( $query_args['fields'] ) ) {
			$requested_fields = array_map( 'sanitize_key', is_array( $query_args['fields'] ) ? $query_args['fields'] : array( $query_args['fields'] ) );
		}

		$id_list = ! empty( $query_args['id'] ) ? implode( ',', array_map( 'intval', (array) $query_args['id'] ) ) : '';

		$is_and = ( strtoupper( trim( $query_args['condition'] ?? 'AND' ) ) !== 'OR' ) ? 1 : 0;

		$f_id      = ! empty( $query_args['id'] ) ? 1 : 0;
		$f_course  = isset( $query_args['moodle_course_id'] ) ? 1 : 0;
		$v_course  = isset( $query_args['moodle_course_id'] ) ? (int) $query_args['moodle_course_id'] : 0;
		$f_cat     = isset( $query_args['category_id'] ) ? 1 : 0;
		$v_cat     = isset( $query_args['category_id'] ) ? (int) $query_args['category_id'] : 0;
		$f_product = isset( $query_args['product_id'] ) ? 1 : 0;
		$v_product = isset( $query_args['product_id'] ) ? (int) $query_args['product_id'] : 0;
		$f_start   = isset( $query_args['startdate'] ) ? 1 : 0;
		$v_start   = isset( $query_args['startdate'] ) ? (int) $query_args['startdate'] : 0;
		$f_end     = isset( $query_args['enddate'] ) ? 1 : 0;
		$v_end     = isset( $query_args['enddate'] ) ? (int) $query_args['enddate'] : 0;
		$f_short   = isset( $query_args['shortname'] ) ? 1 : 0;
		$v_short   = isset( $query_args['shortname'] ) ? ( '%' . $wpdb->esc_like( $query_args['shortname'] ) . '%' ) : '';
		$f_full    = isset( $query_args['fullname'] ) ? 1 : 0;
		$v_full    = isset( $query_args['fullname'] ) ? ( '%' . $wpdb->esc_like( $query_args['fullname'] ) . '%' ) : '';
		$f_expired = ( isset( $query_args['expired'] ) && $query_args['expired'] ) ? 1 : 0;
		$v_now     = time();
		$f_hasprod = ( isset( $query_args['has_product'] ) && $query_args['has_product'] ) ? 1 : 0;

		$any_filter = ( $f_id || $f_course || $f_cat || $f_product || $f_start || $f_end || $f_short || $f_full || $f_expired || $f_hasprod ) ? 1 : 0;

		$has_limit = isset( $query_args['limit'] );
		$v_limit   = $has_limit ? (int) $query_args['limit'] : PHP_INT_MAX;
		$v_offset  = ( $has_limit && isset( $query_args['offset'] ) ) ? (int) $query_args['offset'] : 0;

		// Every filter below is always present in the literal query string. In AND-mode an absent
		// filter's "and" term is a no-op (TRUE); in OR-mode its "or" term is excluded (FALSE) —
		// $is_and picks which branch actually constrains the result; $any_filter short-circuits
		// the whole expression to TRUE when nothing is set (matching this method's original
		// "no WHERE" behaviour regardless of 'condition'). The template never changes shape.
		$where_values = array(
			$any_filter,
			$is_and,
			$f_id, $id_list, $f_course, $v_course, $f_cat, $v_cat, $f_product, $v_product,
			$f_start, $v_start, $f_end, $v_end, $f_short, $v_short, $f_full, $v_full,
			$f_expired, $v_now, $f_hasprod,
			$is_and,
			$f_id, $id_list, $f_course, $v_course, $f_cat, $v_cat, $f_product, $v_product,
			$f_start, $v_start, $f_end, $v_end, $f_short, $v_short, $f_full, $v_full,
			$f_expired, $v_now, $f_hasprod,
		);

		$bind_values = array_merge( array( $table_name ), $where_values, array( $v_limit, $v_offset ) );

		if ( $is_count ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$course_count = $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i
					WHERE (
						%d = 0
						OR (
							( %d = 1
								AND ( %d = 0 OR FIND_IN_SET(id, %s) )
								AND ( %d = 0 OR moodle_course_id = %d )
								AND ( %d = 0 OR category_id = %d )
								AND ( %d = 0 OR product_id = %d )
								AND ( %d = 0 OR startdate = %d )
								AND ( %d = 0 OR enddate = %d )
								AND ( %d = 0 OR shortname LIKE %s )
								AND ( %d = 0 OR fullname LIKE %s )
								AND ( %d = 0 OR ( enddate > 0 AND enddate <= %d ) )
								AND ( %d = 0 OR product_id > 0 )
							)
							OR
							( %d = 0
								AND (
									( %d = 1 AND FIND_IN_SET(id, %s) )
									OR ( %d = 1 AND moodle_course_id = %d )
									OR ( %d = 1 AND category_id = %d )
									OR ( %d = 1 AND product_id = %d )
									OR ( %d = 1 AND startdate = %d )
									OR ( %d = 1 AND enddate = %d )
									OR ( %d = 1 AND shortname LIKE %s )
									OR ( %d = 1 AND fullname LIKE %s )
									OR ( %d = 1 AND ( enddate > 0 AND enddate <= %d ) )
									OR ( %d = 1 AND product_id > 0 )
								)
							)
						)
					)
					LIMIT %d OFFSET %d',
					$bind_values
				)
			);
			return $course_count ?? 0;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$courses = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT * FROM %i
				WHERE (
					%d = 0
					OR (
						( %d = 1
							AND ( %d = 0 OR FIND_IN_SET(id, %s) )
							AND ( %d = 0 OR moodle_course_id = %d )
							AND ( %d = 0 OR category_id = %d )
							AND ( %d = 0 OR product_id = %d )
							AND ( %d = 0 OR startdate = %d )
							AND ( %d = 0 OR enddate = %d )
							AND ( %d = 0 OR shortname LIKE %s )
							AND ( %d = 0 OR fullname LIKE %s )
							AND ( %d = 0 OR ( enddate > 0 AND enddate <= %d ) )
							AND ( %d = 0 OR product_id > 0 )
						)
						OR
						( %d = 0
							AND (
								( %d = 1 AND FIND_IN_SET(id, %s) )
								OR ( %d = 1 AND moodle_course_id = %d )
								OR ( %d = 1 AND category_id = %d )
								OR ( %d = 1 AND product_id = %d )
								OR ( %d = 1 AND startdate = %d )
								OR ( %d = 1 AND enddate = %d )
								OR ( %d = 1 AND shortname LIKE %s )
								OR ( %d = 1 AND fullname LIKE %s )
								OR ( %d = 1 AND ( enddate > 0 AND enddate <= %d ) )
								OR ( %d = 1 AND product_id > 0 )
							)
						)
					)
				)
				LIMIT %d OFFSET %d',
				$bind_values
			),
			ARRAY_A
		);
		$courses = $courses ? $courses : array();

		if ( empty( $requested_fields ) ) {
			return $courses;
		}

		return array_map(
			static function ( $row ) use ( $requested_fields ) {
				return array_intersect_key( $row, array_flip( $requested_fields ) );
			},
			$courses
		);
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
