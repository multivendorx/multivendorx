<?php
/**
 * MooWoodle REST API Settings controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI\Controllers;

use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle REST API Courses controller.
 *
 * @version     3.4.0
 */
class Courses extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'courses';

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		register_rest_route(
			MooWoodle()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'moowoodle_get_items_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check if a given request has access to get items.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function moowoodle_get_items_permissions_check( $request ) {
		return Util::current_user_has_capability( array( 'manage_options' ) );
	}


	/**
	 * Get items.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_items( $request ) {
		$nonce_validation = Util::validate_nonce( $request );

		if ( is_wp_error( $nonce_validation ) ) {
			return $nonce_validation;
		}

		try {
			// Return filter options if requested.
			if ( $request->get_param( 'options' ) ) {
				return $this->get_filter_options( $request );
			}

			$get_product_id = absint( $request->get_param( 'unlinked_resources_for' ) );

			// Handle unlinked resources for a specific product ID.
			if ( ! empty( $get_product_id ) ) {
				$selected_course_id = (int) get_post_meta( $get_product_id, Util::MOOWOODLE_PRODUCT_META['wordpress_course_id'], true );
				$courses            = MooWoodle()->course->get_courses(
					array(
						'id'         => $selected_course_id,
						'product_id' => 0,
						'condition'  => 'OR',
					)
				);

				return rest_ensure_response(
					array(
						'items'       => $courses,
						'selected_id' => $selected_course_id,
					)
				);
			}

			return $this->get_courses_records( $request->get_params() );
		} catch ( \Exception $e ) {
			return Util::server_error( $e );
		}
	}


	/**
	 * Retrieves a paginated list of courses with associated products,
	 * categories, enrollment counts, and metadata.
	 *
	 * @param array $args {
	 *     Optional arguments for filtering and pagination.
	 *
	 *     @type int    $limit        Number of courses per page. Default 10.
	 *     @type int    $page         Current page number. Default 1.
	 *     @type int    $category     Category ID to filter courses by.
	 *     @type string $searchaction Search type: 'course' or 'shortname'.
	 *     @type string $search       Search keyword.
	 * }
	 * @return WP_REST_Response REST response containing formatted courses
	 *                          and pagination headers.
	 */
	public function get_courses_records( $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'limit'        => 10,
				'page'         => 1,
				'category'     => 0,
				'searchaction' => '',
				'search'       => '',
			)
		);

		$limit         = min( max( absint( $args['limit'] ), 1 ), 100 );
		$page          = max( absint( $args['page'] ), 1 );
		$offset        = ( $page - 1 ) * $limit;
		$category_id   = absint( $args['category'] );
		$search_action = sanitize_key( $args['searchaction'] );
		$search_field  = sanitize_text_field( $args['search'] );

		// Build course filters.
		$filters = array(
			'limit'  => $limit,
			'offset' => $offset,
		);

		if ( 0 < $category_id ) {
			$filters['category_id'] = $category_id;
		}

		if ( '' !== $search_field ) {
			if ( 'course' === $search_action ) {
				$filters['fullname'] = $search_field;
			} elseif ( 'shortname' === $search_action ) {
				$filters['shortname'] = $search_field;
			}
		}

		// Count courses matching the same filters (without pagination).
		$count_filters = $filters;
		unset( $count_filters['limit'], $count_filters['offset'] );
		$count_filters['count'] = true;

		$total_courses = (int) MooWoodle()->course->get_courses( $count_filters );

		// Skip the page query entirely when nothing matches.
		$courses = $total_courses ? MooWoodle()->course->get_courses( $filters ) : array();

		if ( empty( $courses ) ) {
			$response = rest_ensure_response( array() );
			$response->header( 'X-WP-Total', (string) $total_courses );
			$response->header(
				'X-WP-TotalPages',
				(string) (int) ceil( $total_courses / $limit )
			);

			return $response;
		}

		$formatted_courses = array();
		$moodle_base_url   = trailingslashit( MooWoodle()->setting->get_setting( 'moodle_url' ) );

		// Load every category on this page in one query, keyed by ID.
		$category_ids   = array_filter( array_unique( array_map( 'absint', wp_list_pluck( $courses, 'category_id' ) ) ) );
		$category_names = $category_ids
			? array_column( (array) MooWoodle()->category->get_course_categories( $category_ids ), 'name', 'id' )
			: array();

		// Prime the post cache so wc_get_product() below doesn't query per course.
		$product_ids = array_filter( array_map( 'absint', wp_list_pluck( $courses, 'product_id' ) ) );
		if ( $product_ids ) {
			_prime_post_caches( $product_ids );

			// Product meta is now cached, so this reads thumbnail IDs without queries;
			// prime those attachments too so wp_get_attachment_image_url() doesn't query per course.
			$image_ids = array_filter( array_map( 'get_post_thumbnail_id', $product_ids ) );
			if ( $image_ids ) {
				_prime_post_caches( $image_ids );
			}
		}

		$product_edit_base_url = admin_url( 'post.php' );

		foreach ( $courses as $course ) {
			$product_name  = '';
			$product_url   = '';
			$product_image = '';

			// Retrieve the associated WooCommerce product.
			if ( ! empty( $course['product_id'] ) ) {
				$product = wc_get_product( absint( $course['product_id'] ) );

				if ( $product ) {
					$product_name = $product->get_name();
					$product_url  = esc_url_raw(
						add_query_arg(
							array(
								'post'   => $product->get_id(),
								'action' => 'edit',
							),
							$product_edit_base_url
						)
					);

					$image_id = $product->get_image_id();

					if ( 0 < $image_id ) {
						$product_image = wp_get_attachment_image_url( $image_id, 'full' );
						$product_image = $product_image ? esc_url_raw( $product_image ) : '';
					}
				}
			}

			// Format course dates.
			$start_date = ! empty( $course['startdate'] )
				? wp_date( 'M j, Y', (int) $course['startdate'] )
				: __( 'Not Set', 'moowoodle' );

			$end_date = ! empty( $course['enddate'] )
				? wp_date( 'M j, Y', (int) $course['enddate'] )
				: __( 'Not Set', 'moowoodle' );

			$course_duration = (
				! empty( $course['startdate'] )
				|| ! empty( $course['enddate'] )
			)
				? sprintf(
					/* translators: 1: Start date, 2: End date. */
					__( '%1$s - %2$s', 'moowoodle' ),
					$start_date,
					$end_date
				)
				: 'NA';

			// Build Moodle URLs.
			$moodle_course_id = absint( $course['moodle_course_id'] ?? 0 );

			$moodle_url = add_query_arg(
				'id',
				$moodle_course_id,
				$moodle_base_url . 'course/edit.php'
			);

			$view_users_url = add_query_arg(
				'id',
				$moodle_course_id,
				$moodle_base_url . 'user/index.php'
			);

			// Retrieve enrollment count.
			$enrolled_users = MooWoodle()->enrollment->get_enrollments(
				array(
					'course_id' => absint( $course['id'] ),
					'count'     => true,
				)
			);

			// Format the course record.
			$formatted_courses[] = apply_filters(
				'moowoodle_formatted_course',
				array(
					'id'                => absint( $course['id'] ),
					'moodle_url'        => esc_url_raw( $moodle_url ),
					'moodle_course_id'  => $moodle_course_id,
					'course_short_name' => $course['shortname'] ?? '',
					'course_name'       => $course['fullname'] ?? '',
					'product_name'      => $product_name,
					'product_url'       => $product_url,
					'product_image'     => $product_image,
					'category_name'     => $category_names[ absint( $course['category_id'] ?? 0 ) ] ?? '',
					'enrolled_user'     => (int) $enrolled_users,
					'view_users_url'    => esc_url_raw( $view_users_url ),
					'date'              => $course_duration,
				)
			);
		}

		// Return the REST response with pagination headers.
		$response = rest_ensure_response( $formatted_courses );

		$response->header( 'X-WP-Total', (string) $total_courses );
		$response->header(
			'X-WP-TotalPages',
			(string) (int) ceil( $total_courses / $limit )
		);

		return $response;
	}

	/**
	 * Get course and category filter items.
	 *
	 * Returns formatted course and category options
	 * for filter dropdown fields.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_filter_options( $request ) {
		// Fetch all courses.
		$courses = MooWoodle()->course->get_courses();

		if ( empty( $courses ) ) {
			return rest_ensure_response(
				array(
					'courses'  => array(),
					'category' => array(),
				)
			);
		}

		// Extract unique category IDs.
		$category_ids = array_unique(
			wp_list_pluck( $courses, 'category_id' )
		);

		// Fetch categories.
		$categories = MooWoodle()->category->get_course_categories(
			$category_ids
		);

		// Format courses.
		$formatted_courses = array_map(
			function ( $course ) {
				return array(
					'label' => ! empty( $course['fullname'] )
						? $course['fullname']
						: "Course {$course['id']}",
					'value' => (string) $course['id'],
				);
			},
			$courses
		);

		// Format categories.
		$formatted_categories = array_map(
			function ( $category ) {
				return array(
					'label' => ! empty( $category['name'] )
						? $category['name']
						: "Category {$category['id']}",
					'value' => (string) $category['id'],
				);
			},
			$categories
		);

		return rest_ensure_response(
			array(
				'courses'  => $formatted_courses,
				'category' => $formatted_categories,
			)
		);
	}
}
