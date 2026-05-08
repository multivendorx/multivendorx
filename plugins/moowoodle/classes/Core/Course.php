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
		add_action( 'wp_ajax_get_linkable_course', array( $this, 'get_linkable_course' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
     * Enqueues all assets for admin.
     *
     * @return void
     */
	public function enqueue_admin_assets() {

		FrontendScripts::admin_load_scripts();
		FrontendScripts::enqueue_script( 'moowoodle-product-tab-script' );
		FrontendScripts::enqueue_style( 'moowoodle-product-tab-style' );
		FrontendScripts::localize_scripts( 'moowoodle-product-tab-script' );
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
	public static function get_course_information( $args ) {
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
	public static function update_course_information( $args ) {
		global $wpdb;

		if ( empty( $args['moodle_course_id'] ) ) {
			return false;
		}

		$table    = $wpdb->prefix . Util::TABLES['course'];
		$existing = reset( self::get_course_information( array( 'moodle_course_id' => $args['moodle_course_id'] ) ) );

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
	public function update_courses_information( $courses, $force_delete = true ) {
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

            $updated_ids[] = self::update_course_information( $args );

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
		global $post;

		$linked_course_id = get_post_meta( $post->ID, 'linked_course_id', true );
		$linked_cohort_id = apply_filters( 'moowoodle_get_linked_cohort_id', null, $post->ID );
		$default_type     = $linked_course_id ? 'course' : ( $linked_cohort_id ? 'cohort' : '' );
		?>
		<div id="moowoodle-course-link-tab" class="panel">
			<p class="form-field moowoodle-link-type-field">
				<label><?php esc_html_e( 'Link Type', 'moowoodle' ); ?></label><br>
				<span class="moowoodle-radio-group">
					<label class="moowoodle-radio-option">
						<input type="radio" name="link_type" value="course" <?php checked( $default_type, 'course' ); ?>>
						<?php esc_html_e( 'Course', 'moowoodle' ); ?>
					</label>
					<label class="moowoodle-radio-option cohort">
						<input type="radio" name="link_type" value="cohort" <?php checked( $default_type, 'cohort' ); ?> 
							<?php echo MooWoodle()->util->is_khali_dabba() ? '' : 'disabled'; ?>>
						<?php esc_html_e( 'Cohort', 'moowoodle' ); ?>
						<?php echo MooWoodle()->util->is_khali_dabba() ? '' : '<span>Pro</span>'; ?>
					</label>
				</span>
			</p>

			<p id="dynamic-link-select" class="form-field <?php echo $default_type ? 'show' : ''; ?>">
				<label for="linked_item_id"><?php esc_html_e( 'Select Item', 'moowoodle' ); ?></label>
				<select id="linked_item_id" name="linked_item_id">
					<option value=""><?php esc_html_e( 'Select an item...', 'moowoodle' ); ?></option>
				</select>
			</p>

			<p>
				<span>
					<?php esc_html_e( "Can't find your course or cohort?", 'moowoodle' ); ?>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=moowoodle-synchronization' ) ); ?>" target="_blank">
						<?php esc_html_e( 'Synchronize Moodle data from here.', 'moowoodle' ); ?>
					</a>
				</span>
			</p>

			<input type="hidden" name="moowoodle_meta_nonce" value="<?php echo esc_attr( wp_create_nonce( 'moowoodle_meta_nonce' ) ); ?>">
			<input type="hidden" name="product_meta_nonce" value="<?php echo esc_attr( wp_create_nonce() ); ?>">
			<input type="hidden" id="post_id" value="<?php echo esc_attr( $post->ID ); ?>">
		</div>
		<?php
	}

	/**
	 * Handle AJAX request to fetch linkable courses for a product.
	 *
	 * Expects POST: nonce, post_id.
	 * Returns the list of available courses and the currently linked course.
	 *
	 * @return void
	 */
	public function get_linkable_course() {
		// Verify nonce.
		if ( ! check_ajax_referer( 'moowoodle_meta_nonce', 'nonce', false ) ) {
			wp_send_json_error( __( 'Invalid nonce', 'moowoodle' ) );
			return;
		}

		// Retrieve and sanitize input.
		$post_id = absint( filter_input( INPUT_POST, 'post_id' ) );

		$linked_course_id = get_post_meta( $post_id, 'linked_course_id', true );

		$linkable_courses = $this->get_course_information(
			array(
				'id'         => $linked_course_id,
				'product_id' => 0,
				'condition'  => 'OR',
			)
		);

		wp_send_json_success(
			array(
				'items'       => $linkable_courses,
				'selected_id' => $linked_course_id,
			)
		);
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
        $existing_courses = self::get_course_information( array() );
        $existing_ids     = array_column( $existing_courses, 'id' );

        $ids_to_delete = array_diff( $existing_ids, $exclude_ids );
        $table_name    = $wpdb->prefix . Util::TABLES['course'];

        foreach ( $ids_to_delete as $course_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->delete( $table_name, array( 'id' => $course_id ) );
        }
    }
}