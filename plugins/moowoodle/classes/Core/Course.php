<?php
/**
 * Course class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Core;

use MooWoodle\Util;

/**
 * MooWoodle Course class
 *
 * @class       Course class
 * @version     PRODUCT_VERSION
 * @author      DualCube
 */
class Course {
	/**
     * Course constructor.
     */
	public function __construct() {
		// Add Link Moodle Course in WooCommerce edit product tab.
		add_filter( 'woocommerce_product_data_tabs', array( &$this, 'add_additional_product_tab' ), 99, 1 );
		add_action( 'woocommerce_product_data_panels', array( &$this, 'add_additional_product_data_panel' ) );
		add_action( 'wp_ajax_get_linkable_courses_or_cohorts', array( $this, 'get_linkable_courses' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
     * Enqueues all assets for admin.
     *
     * @return void
     */
	public function enqueue_admin_assets() {

		\MooWoodle\FrontendScripts::admin_load_scripts();
		\MooWoodle\FrontendScripts::enqueue_script( 'moowoodle-product-tab-js' );
		\MooWoodle\FrontendScripts::enqueue_style( 'moowoodle-product-tab-css' );
		\MooWoodle\FrontendScripts::localize_scripts( 'moowoodle-product-tab-js' );
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
	public function add_additional_product_data_panel() {
		global $post;

		$linked_course_id = get_post_meta( $post->ID, 'linked_course_id', true );
		$linked_cohort_id = get_post_meta( $post->ID, 'linked_cohort_id', true );
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
	 * Handle AJAX request to fetch courses or cohorts for linking to a product.
	 *
	 * Expects POST: nonce, type ('course' or 'cohort'), post_id.
	 * Returns: available courses or cohorts and the selected one (even if not available).
	 *
	 * @return void Outputs JSON response.
	 */
	public function get_linkable_courses() {
		// Verify nonce.
		if ( ! check_ajax_referer( 'moowoodle_meta_nonce', 'nonce', false ) ) {
			wp_send_json_error( __( 'Invalid nonce', 'moowoodle' ) );
			return;
		}

		// Retrieve and sanitize input.
		$type             = sanitize_text_field( filter_input( INPUT_POST, 'type' ) ? filter_input( INPUT_POST, 'type' ) : '' );
		$post_id          = absint( filter_input( INPUT_POST, 'post_id' ) ? filter_input( INPUT_POST, 'post_id' ) : 0 );
		$linkable_courses = array();

		if ( 'course' === $type ) {
			$linked_course_id = get_post_meta( $post_id, 'linked_course_id', true );

			$linkable_courses = $this->get_course(
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
		} elseif ( 'cohort' === $type ) {
			return apply_filters( 'moowoodle_get_linkable_cohorts', $post_id );
		}

		wp_send_json_error( __( 'Invalid type', 'moowoodle' ) );
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

            \MooWoodle\Util::increment_sync_count( 'course' );
        }
		if ( $force_delete ) {
			self::remove_exclude_ids( $updated_ids );
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

        if ( empty( $args ) || empty( $args['moodle_course_id'] ) ) {
            return false;
        }

        $table = $wpdb->prefix . Util::TABLES['course'];

        // Check if course already exists.
        $existing = self::get_course( array( 'moodle_course_id' => $args['moodle_course_id'] ) );
        $existing = reset( $existing );
        if ( $existing ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->update(
                $table,
                $args,
                array( 'moodle_course_id' => $args['moodle_course_id'] )
            );

            // Return existing course ID after update.
            return $existing['id'];
        }

        $args['created'] = current_time( 'mysql' );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->insert( $table, $args );
        return $wpdb->insert_id;
    }

	/**
	 * Get courses based on filters.
	 *
	 * Supported keys: id, moodle_course_id, shortname, fullname, category_id, product_id,
	 * startdate, enddate, ids (array), condition (AND/OR), limit, offset.
	 *
	 * @param array $where Filter conditions.
	 * @return array List of courses as associative arrays (each course as [ field => value ]).
	 */
	public static function get_course( $where ) {
		global $wpdb;

		$query_segments = array();

		if ( isset( $where['id'] ) ) {
			$query_segments[] = ' ( id = ' . esc_sql( intval( $where['id'] ) ) . ' ) ';
		}

		if ( isset( $where['moodle_course_id'] ) ) {
			$query_segments[] = ' ( moodle_course_id = ' . esc_sql( intval( $where['moodle_course_id'] ) ) . ' ) ';
		}

		if ( isset( $where['shortname'] ) ) {
			$query_segments[] = " ( shortname LIKE '%" . esc_sql( $where['shortname'] ) . "%' ) ";
		}

		if ( isset( $where['category_id'] ) ) {
			$query_segments[] = ' ( category_id = ' . esc_sql( intval( $where['category_id'] ) ) . ' ) ';
		}

		if ( isset( $where['product_id'] ) ) {
			$query_segments[] = ' ( product_id = ' . esc_sql( intval( $where['product_id'] ) ) . ' ) ';
		}

		if ( isset( $where['fullname'] ) ) {
			$query_segments[] = " ( fullname LIKE '%" . esc_sql( $where['fullname'] ) . "%' ) ";
		}

		if ( isset( $where['startdate'] ) ) {
			$query_segments[] = ' ( startdate = ' . esc_sql( intval( $where['startdate'] ) ) . ' ) ';
		}

		if ( isset( $where['enddate'] ) ) {
			$query_segments[] = ' ( enddate = ' . esc_sql( intval( $where['enddate'] ) ) . ' ) ';
		}

		if ( isset( $where['ids'] ) ) {
			$ids              = implode( ',', array_map( 'intval', $where['ids'] ) );
			$query_segments[] = "id IN ($ids)";
		}

		$table = $wpdb->prefix . Util::TABLES['course'];
		$query = "SELECT * FROM $table";

		if ( ! empty( $query_segments ) ) {
			$query .= ' WHERE ' . implode( $where['condition'] ?? ' AND ', $query_segments );
		}

		if ( isset( $where['limit'] ) && isset( $where['offset'] ) ) {
			$limit  = esc_sql( intval( $where['limit'] ) );
			$offset = esc_sql( intval( $where['offset'] ) );
			$query .= " LIMIT $limit OFFSET $offset";
		}

		$results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

		return $results;
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
        $existing_courses = self::get_course( array() );
        $existing_ids     = array_column( $existing_courses, 'id' );

        $ids_to_delete = array_diff( $existing_ids, $exclude_ids );
        $table_name    = $wpdb->prefix . Util::TABLES['course'];

        foreach ( $ids_to_delete as $course_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->delete( $table_name, array( 'id' => $course_id ) );
        }
    }
}
