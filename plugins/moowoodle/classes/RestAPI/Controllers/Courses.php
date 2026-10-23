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

            $get_product_id = $request->get_param( 'unlinked_resources_for' );

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
	 * Retrieves and formats a paginated list of courses with associated products,
	 * categories, enrollment counts, and metadata.
	 *
	 * @param array $args {
	 *     Optional arguments for filtering and pagination.
	 *
	 *     @type int    $limit        Number of items to retrieve per page. Default 10.
	 *     @type int    $page         Current page number. Default 1.
	 *     @type string $category     Category ID to filter courses by.
	 *     @type string $searchaction Search type action ('course' or 'shortname').
	 *     @type string $search       Search keyword/field value.
	 * }
	 * @return array Formatted array containing course items and total count.
	 */
	public function get_courses_records( $args = array() ) {

		$limit         = (int) ( $args['limit'] ?? 10 );
		$page          = max( (int) ( $args['page'] ?? 1 ), 1 );
		$category_id   = $args['category'] ?? '';
		$search_action = $args['searchaction'] ?? '';
		$search_field  = $args['search'] ?? '';

		$offset = ( $page - 1 ) * $limit;

		// Base filter array.
		$filters = array(
			'limit'  => $limit,
			'offset' => $offset,
		);

		// Add category filter if provided.
		if ( ! empty( $category_id ) ) {
			$filters['category_id'] = $category_id;
		}

		// Add search filter based on search action.
		if ( 'course' === $search_action ) {
			$filters['fullname'] = $search_field;
		} elseif ( 'shortname' === $search_action ) {
			$filters['shortname'] = $search_field;
		}

		// Get paginated courses from database.
		$courses = MooWoodle()->course->get_courses( $filters );

		if ( empty( $courses ) ) {
			return rest_ensure_response( array() );
		}

		$formatted_courses = array();
		$moodle_base_url   = trailingslashit( MooWoodle()->setting->get_setting( 'moodle_url' ) );

		foreach ( $courses as $course ) {
			$product_image = '';
			$product_name  = '';
			$product_url   = '';

			// Fetch associated WooCommerce product details if available.
			if ( ! empty( $course['product_id'] ) ) {
				$product = wc_get_product( (int) $course['product_id'] );
				if ( $product ) {
					$product_name  = $product->get_name();
					$product_url   = esc_url_raw( admin_url( 'post.php?post=' . $product->get_id() . '&action=edit' ) );
					$product_image = wp_get_attachment_url( $product->get_image_id() );
				}
			}

			// Format course duration and start/end dates.
			$start           = ! empty( $course['startdate'] ) ? wp_date( 'M j, Y', $course['startdate'] ) : __( 'Not Set', 'moowoodle' );
			$end             = ! empty( $course['enddate'] ) ? wp_date( 'M j, Y', $course['enddate'] ) : __( 'Not Set', 'moowoodle' );
			$course_duration = ( ! empty( $course['startdate'] ) || ! empty( $course['enddate'] ) )
                            ? sprintf(
                                /* translators: 1: Start date, 2: End date */
                                __( '%1$s - %2$s', 'moowoodle' ),
                                $start,
                                $end
                            ) : 'NA';

			$moodle_url    = $moodle_base_url . "course/edit.php?id={$course['moodle_course_id']}";
			$view_user_url = $moodle_base_url . "user/index.php?id={$course['moodle_course_id']}";

			// Get course categories.
			$categories = MooWoodle()->category->get_course_categories( (int) $course['category_id'] );
			$categories = reset( $categories );

			// Get enrolled users count for the course.
			$enrolled_users = MooWoodle()->enrollment->get_enrollments(
				array(
					'course_id' => $course['id'],
					'count'     => true,
                )
			);

			// Build the formatted course structure.
			$formatted_courses[] = apply_filters(
				'moowoodle_formatted_course',
				array(
					'id'                => (int) $course['id'],
					'moodle_url'        => $moodle_url,
					'moodle_course_id'  => $course['moodle_course_id'],
					'course_short_name' => $course['shortname'],
					'course_name'       => $course['fullname'],
					'product_name'      => $product_name,
					'product_url'       => $product_url,
					'product_image'     => $product_image,
					'category_name'     => $categories['name'] ?? '',
					'enrolled_user'     => $enrolled_users,
					'view_users_url'    => $view_user_url,
					'date'              => $course_duration,
                )
			);
		}

		// Get total count of courses matching filters.
		$total_courses = MooWoodle()->course->get_courses(
            array( 'count' => true )
		);

        // Create REST response with items.
        $response = rest_ensure_response( $formatted_courses );
        // Set the total count header for pagination support.
        $response->header( 'X-WP-Total', $total_courses );

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
