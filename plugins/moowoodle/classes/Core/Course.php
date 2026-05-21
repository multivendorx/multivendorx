<?php
/**
 * Course class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Core;

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

		$where        = array();
		$query_params = array();

		$is_count      = ! empty( $query_args['count'] );
		$select_fields = '*';

		if ( ! empty( $query_args['fields'] ) ) {
			if ( is_array( $query_args['fields'] ) ) {
				$select_fields = implode( ', ', array_map( 'sanitize_key', $query_args['fields'] ) );
			} else {
				$select_fields = sanitize_key( $query_args['fields'] );
			}
		}

		$sql = $is_count
			? "SELECT COUNT(*) FROM {$table_name}"
			: "SELECT {$select_fields} FROM {$table_name}";

		if ( ! empty( $query_args['id'] ) ) {
			$ids          = array_map( 'intval', (array) $query_args['id'] );
			$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

			$where[]      = "id IN ($placeholders)";
			$query_params = array_merge( $query_params, $ids );
		}

		$supported_filters = array(
			'moodle_course_id' => '%d',
			'category_id'      => '%d',
			'product_id'       => '%d',
			'startdate'        => '%d',
			'enddate'          => '%d',
		);

		foreach ( $supported_filters as $field => $format ) {
			if ( isset( $query_args[ $field ] ) ) {
				$where[]        = "{$field} = {$format}";
				$query_params[] = (int) $query_args[ $field ];
			}
		}

		if ( isset( $query_args['shortname'] ) ) {
			$where[]        = 'shortname LIKE %s';
			$query_params[] = '%' . $wpdb->esc_like( $query_args['shortname'] ) . '%';
		}

		if ( isset( $query_args['fullname'] ) ) {
			$where[]        = 'fullname LIKE %s';
			$query_params[] = '%' . $wpdb->esc_like( $query_args['fullname'] ) . '%';
		}

		if ( ! empty( $where ) ) {
			$condition = strtoupper( $query_args['condition'] ?? 'AND' );
			if ( ! in_array( $condition, array( 'AND', 'OR' ), true ) ) {
				$condition = 'AND';
			}
			$sql .= ' WHERE ' . implode( " $condition ", $where );
		}

		if ( isset( $query_args['limit'] ) ) {
			$sql           .= ' LIMIT %d';
			$query_params[] = (int) $query_args['limit'];

			if ( isset( $query_args['offset'] ) ) {
				$sql           .= ' OFFSET %d';
				$query_params[] = (int) $query_args['offset'];
			}
		}

		if ( ! empty( $query_params ) ) {
			$sql = $wpdb->prepare( $sql, $query_params );
		}

		if ( $is_count ) {
			$course_count = $wpdb->get_var( $sql );
			return $course_count ?? 0;
		}

		return $wpdb->get_results( $sql, ARRAY_A ) ?: array();
	}

	/**
	 * Insert or update a course record by Moodle course ID.
	 *
	 * @param array $course_data Course data. Must include 'moodle_course_id'.
	 * @return int|false Rows affected or false on failure.
	 */
	public static function update_course( $course_data ) {
		global $wpdb;

		$moodle_course_id = (int) $course_data['moodle_course_id'];
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
