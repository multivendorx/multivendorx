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
	 * Filters supported in $args:
	 * - id, moodle_course_id, shortname, fullname
	 * - category_id, product_id, startdate, enddate
	 * - condition (AND/OR), limit, offset
	 *
	 * @param array $args Filter options.
	 * @return array List of matching courses.
	 */
	public static function get_courses( $args = array() ) {
		global $wpdb;

		$table = $wpdb->prefix . Util::TABLES['course'];

		$where  = array();
		$params = array();

		$is_count = ! empty( $args['count'] );
		$sql      = $is_count
			? "SELECT COUNT(*) FROM {$table}"
			: "SELECT * FROM {$table}";

		if ( ! empty( $args['id'] ) ) {
			$ids          = array_map( 'intval', (array) $args['id'] );
			$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

			$where[] = "id IN ($placeholders)";
			$params  = array_merge( $params, $ids );
		}

		$fields = array(
			'moodle_course_id' => '%d',
			'category_id'      => '%d',
			'product_id'       => '%d',
			'startdate'        => '%d',
			'enddate'          => '%d',
		);

		foreach ( $fields as $field => $format ) {
			if ( isset( $args[ $field ] ) ) {
				$where[]  = "{$field} = {$format}";
				$params[] = (int) $args[ $field ];
			}
		}

		if ( isset( $args['shortname'] ) ) {
			$where[]  = 'shortname LIKE %s';
			$params[] = '%' . $wpdb->esc_like( $args['shortname'] ) . '%';
		}

		if ( isset( $args['fullname'] ) ) {
			$where[]  = 'fullname LIKE %s';
			$params[] = '%' . $wpdb->esc_like( $args['fullname'] ) . '%';
		}

		if ( ! empty( $where ) ) {
			$condition = strtoupper( $args['condition'] ?? 'AND' );
			$sql      .= ' WHERE ' . implode( " $condition ", $where );
		}

		if ( isset( $args['limit'] ) ) {
			$sql     .= ' LIMIT %d';
			$params[] = (int) $args['limit'];

			if ( isset( $args['offset'] ) ) {
				$sql     .= ' OFFSET %d';
				$params[] = (int) $args['offset'];
			}
		}

		// Prepare SQL
		if ( ! empty( $params ) ) {
			$sql = $wpdb->prepare( $sql, $params );
		}

		// Execute
		if ( $is_count ) {
			$results = $wpdb->get_var( $sql );
			return $results ?? 0;
		}

		return $wpdb->get_results( $sql, ARRAY_A ) ?: array();
	}

	/**
	 * Insert or update a course record by Moodle course ID.
	 *
	 * @param array $args Course data. Must include 'moodle_course_id'.
	 * @return int|false Rows affected or false on failure.
	 */
	public static function update_course( $args ) {
		global $wpdb;

		$moodle_course_id = (int) $args['moodle_course_id'];
		if ( empty( $moodle_course_id ) ) {
			return false;
		}

		$table           = $wpdb->prefix . Util::TABLES['course'];
		$existing_course = self::get_courses( array( 'moodle_course_id' => $moodle_course_id ) );
		$existing        = reset( $existing_course );

		if ( ! empty( $existing ) ) {
			return $wpdb->update( $table, $args, array( 'moodle_course_id' => $moodle_course_id ) ) !== false ? $existing['id'] : false; // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		}

		$args['created'] = current_time( 'mysql' );
		return $wpdb->insert( $table, $args ) !== false // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		? $wpdb->insert_id
		: false;
	}

	/**
	 * Update or insert multiple courses based on Moodle data.
	 * Skips courses with format 'site'.
	 *
	 * @param array $courses      List of courses to update or insert.
	 * @param bool  $force_delete Whether to remove excluded course IDs after sync.
	 * @return void
	 */
	public function update_courses( $courses, $force_delete = true ) {
		if ( empty( $courses ) || ! is_array( $courses ) ) {
			return;
		}

		$updated_ids = array();
        foreach ( $courses as $course ) {
            // Skip site format courses.
            if ( empty( $course['format'] ) || 'site' === $course['format'] ) {
                continue;
            }

            $args = array(
                'moodle_course_id' => (int) $course['id'],
                'shortname'        => sanitize_text_field( $course['shortname'] ?? '' ),
                'category_id'      => (int) ( $course['categoryid'] ?? 0 ),
                'fullname'         => sanitize_text_field( $course['fullname'] ?? '' ),
                'startdate'        => (int) ( $course['startdate'] ?? 0 ),
                'enddate'          => (int) ( $course['enddate'] ?? 0 ),
            );

            $updated_ids[] = self::update_course( $args );

            Util::increment_sync_count( 'course' );
        }
		if ( $force_delete ) {
			self::cleanup_courses( $updated_ids );
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
		?>
		<div id="moodle-enrollment-mapping-tab"></div>
		<?php
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
        $existing_courses = self::get_courses();
        $existing_ids     = array_column( $existing_courses, 'id' );

        $ids_to_delete = array_diff( $existing_ids, $exclude_ids );
        $table_name    = $wpdb->prefix . Util::TABLES['course'];

        foreach ( $ids_to_delete as $course_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->delete( $table_name, array( 'id' => $course_id ) );
        }
    }
}