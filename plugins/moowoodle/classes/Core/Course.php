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
		add_filter( 'woocommerce_product_data_tabs', array( &$this, 'add_additional_product_tab' ), 99, 1 );
		add_action( 'woocommerce_product_data_panels', array( &$this, 'add_additional_product_data_panels' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ), 20 );
	}

	/**
     * Enqueues all assets for admin.
     *
     * @return void
     */
	public function enqueue_admin_assets() {
		FrontendScripts::enqueue_style( 'moowoodle-product-tab' );
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
	public static function get_courses( $args ) {
		global $wpdb;

		$where = array();

		if ( isset( $args['id'] ) ) {
			$ids     = is_array( $args['id'] ) ? $args['id'] : array( $args['id'] );
			$ids     = implode( ',', array_map( 'intval', $ids ) );
			$where[] = "id IN ($ids)";
		}

		if ( isset( $args['moodle_course_id'] ) ) {
			$where[] = ' ( moodle_course_id = ' . esc_sql( intval( $args['moodle_course_id'] ) ) . ' ) ';
		}

		if ( isset( $args['shortname'] ) ) {
			$where[] = " ( shortname LIKE '%" . esc_sql( $args['shortname'] ) . "%' ) ";
		}

		if ( isset( $args['category_id'] ) ) {
			$where[] = ' ( category_id = ' . esc_sql( intval( $args['category_id'] ) ) . ' ) ';
		}

		if ( isset( $args['product_id'] ) ) {
			$where[] = ' ( product_id = ' . esc_sql( intval( $args['product_id'] ) ) . ' ) ';
		}

		if ( isset( $args['fullname'] ) ) {
			$where[] = " ( fullname LIKE '%" . esc_sql( $args['fullname'] ) . "%' ) ";
		}

		if ( isset( $args['startdate'] ) ) {
			$where[] = ' ( startdate = ' . esc_sql( intval( $args['startdate'] ) ) . ' ) ';
		}

		if ( isset( $args['enddate'] ) ) {
			$where[] = ' ( enddate = ' . esc_sql( intval( $args['enddate'] ) ) . ' ) ';
		}

		$table = $wpdb->prefix . Util::TABLES['course'];

		if ( isset( $args['count'] ) ) {
			$query = "SELECT COUNT(*) FROM $table";
		} else {
			$query = "SELECT * FROM $table";
		}

		if ( ! empty( $where ) ) {
			$condition = $args['condition'] ?? ' AND ';
			$query    .= ' WHERE ' . implode( $condition, $where );
		}

		if ( isset( $args['limit'] ) && isset( $args['offset'] ) ) {
			$limit  = esc_sql( intval( $args['limit'] ) );
			$offset = esc_sql( intval( $args['offset'] ) );
			$query .= " LIMIT $limit OFFSET $offset";
		}

		if ( isset( $args['count'] ) ) {
			$results = $wpdb->get_var( $query ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			return $results ?? 0;
		} else {
			$results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			return $results ?? array();
		}
	}

	/**
	 * Insert or update a course record by Moodle course ID.
	 *
	 * @param array $args Course data. Must include 'moodle_course_id'.
	 * @return int|false Rows affected or false on failure.
	 */
	public static function update_course( $args ) {
		global $wpdb;

		if ( empty( $args['moodle_course_id'] ) ) {
			return false;
		}

		$table    = $wpdb->prefix . Util::TABLES['course'];
		$existing = reset( self::get_courses( array( 'moodle_course_id' => $args['moodle_course_id'] ) ) );

		if ( $existing ) {
			return $wpdb->update( $table, $args, array( 'moodle_course_id' => $args['moodle_course_id'] ) ) !== false // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				? $existing['id']
				: false;
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
        foreach ( $courses as $course ) {
            // Skip site format courses.
            if ( 'site' === $course['format'] ) {
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
			self::remove_exclude_ids( $updated_ids );
		}
    }

	/**
	 * Creates custom tab for product types.
     *
	 * @param array $product_data_tabs all product tabs in admin.
	 * @return array
	 */
	public function add_additional_product_tab( $product_data_tabs ) {
		$product_data_tabs['moowoodle'] = array(
			'label'  => __( 'Moodle Linked Course or Cohort', 'moowoodle' ),
			'target' => 'moowoodle-course-link-tab',
		);
		return $product_data_tabs;
	}

    /**
     * Add meta box panel.
     *
     * @return void
     */
	public function add_additional_product_data_panels() {
		?>
		<div
			id="moowoodle-course-link-tab"
			class="panel woocommerce_options_panel"
		>
			<div id="moowoodle-react-product-tab"></div>
		</div>
		<?php
	}

	/**
     * Delete all the course which id is not prasent in $exclude_ids array.
     *
     * @param array $exclude_ids course ids.
     * @return void
     */
    public static function remove_exclude_ids( $exclude_ids ) {
        global $wpdb;

        $exclude_ids      = array_map( 'intval', (array) $exclude_ids );
        $existing_courses = self::get_courses( array() );
        $existing_ids     = array_column( $existing_courses, 'id' );

        $ids_to_delete = array_diff( $existing_ids, $exclude_ids );
        $table_name    = $wpdb->prefix . Util::TABLES['course'];

        foreach ( $ids_to_delete as $course_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->delete( $table_name, array( 'id' => $course_id ) );
        }
    }
}