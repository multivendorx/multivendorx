<?php
/**
 * MooWoodle REST API Settings controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle REST API Courses controller.
 *
 * @class       Courses class
 * @version     PRODUCT_VERSION
 * @author      DualCube
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
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            MooWoodle()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                    'args'                => array(
                        'id' => array( 'required' => true ),
                    ),
                ),
            )
        );
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param object $request The REST request object.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * PUT permission check.
     *
     * @param object $request Request data.
     * @return bool
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'customer' ) || current_user_can( 'manage_options' );
    }

    /**
     * Get all synchronization.
     *
     * @param object $request The request object.
     */
    public function get_items( $request ) {
        // ----- Nonce Check -----
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'moowoodle' ),
                array( 'status' => 403 )
            );

            MooWoodle()->util->log( $error );
            return $error;
        }

        try {
            $options = $request->get_param( 'options' );

            if ( $options ) {
                return $this->get_filter_items( $request );
            }

            $limit          = max( intval( $request->get_param( 'row' ) ), 10 );
            $page           = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset         = ( $page - 1 ) * $limit;
            $category_field = $request->get_param( 'catagory' );
            $search_action  = $request->get_param( 'searchaction' );
            $search_field   = $request->get_param( 'search' );

            // Base filter array.
            $filters = array(
                'limit'  => $limit,
                'offset' => $offset,
            );

            if ( ! empty( $category_field ) ) {
                $filters['category_id'] = $category_field;
            }
            // Add search filter.
            if ( 'course' === $search_action ) {
                $filters['fullname'] = $search_field;
            } elseif ( 'shortname' === $search_action ) {
                $filters['shortname'] = $search_field;
            }

            // Get paginated courses.
            $courses = MooWoodle()->course->get_course_information( $filters );

            if ( empty( $courses ) ) {
                return rest_ensure_response( array() );
            }

            $formatted_courses = array();

            foreach ( $courses as $course ) {
                $course_id       = (int) $course['id'];
                $product_id      = (int) ( $course['product_id'] );
                $synced_products = array();
                $product_image   = '';

                if ( $product_id ) {
                    $product = wc_get_product( $product_id );
                    if ( $product ) {
                        $synced_products[ $product->get_name() ] = add_query_arg(
                            array(
                                'post'   => $product->get_id(),
                                'action' => 'edit',
                            ),
                            admin_url( 'post.php' )
                        );
                        $product_image                           = wp_get_attachment_url( $product->get_image_id() );
                    }
                }

                $start = $course['startdate'] ? wp_date( 'M j, Y', $course['startdate'] ) : __( 'Not Set', 'moowoodle' );
                $end   = $course['enddate'] ? wp_date( 'M j, Y', $course['enddate'] ) : __( 'Not Set', 'moowoodle' );
                $date  = ( $course['startdate'] || $course['enddate'] ) ? "$start - $end" : 'NA';

                $moodle_url    = trailingslashit( MooWoodle()->setting->get_setting( 'moodle_url' ) ) . "course/edit.php?id={$course['moodle_course_id']}";
                $view_user_url = trailingslashit( MooWoodle()->setting->get_setting( 'moodle_url' ) ) . "user/index.php?id={$course['moodle_course_id']}";

                // Get categories.
                $categories = MooWoodle()->category->get_course_category_information( (int) $course['category_id'] );
                $categories = reset( $categories );

                // Get enrolled users count.
                $enroled_user = MooWoodle()->enrollment->get_enrollment_information(
                    array(
                        'course_id' => $course['id'],
                    )
                );

                $formatted_courses[] = apply_filters(
                    'moowoodle_formatted_course',
                    array(
                        'id'                => $course_id,
                        'moodle_url'        => $moodle_url,
                        'moodle_course_id'  => $course['moodle_course_id'],
                        'course_short_name' => $course['shortname'],
                        'course_name'       => $course['fullname'],
                        'products'          => $synced_products,
                        'productimage'      => $product_image,
                        'category_name'     => $categories['name'],
                        'enroled_user'      => count( $enroled_user ),
                        'view_users_url'    => $view_user_url,
                        'date'              => $date,
                    )
                );
            }

            $response = rest_ensure_response( $formatted_courses );

            $total_courses = MooWoodle()->course->get_course_information(
                array( 'count' => true )
            );

            $response->header( 'X-WP-Total', $total_courses );

            return $response;
        } catch ( \Exception $e ) {
            MooWoodle()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'moowoodle' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Get a specific course.
     *
     * @param object $request The request object.
     */
    public function get_item( $request ) {
        // ----- Nonce Check -----
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'moowoodle' ),
                array( 'status' => 403 )
            );

            MooWoodle()->util->log( $error );
            return $error;
        }

        try {
            $items_per_page = max( 1, (int) $request->get_param( 'row' ) ? $request->get_param( 'row' ) : 10 );
            $page_number    = max( 1, (int) $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1 );
            $query_offset   = ( $page_number - 1 ) * $items_per_page;

            $total_user_enrollments = MooWoodle()->enrollment->get_enrollment_information(
                array(
                    'user_id' => $current_user->ID,
                    'status'  => 'enrolled',
                    'count'   => true,
                )
            );
            // Allow pre-filtering by custom filters.
            $user_courses_data = apply_filters( 'moowoodle_user_courses_cohorts_groups_data', null, $request );
            if ( ! empty( $user_courses_data ) ) {
                return $user_courses_data;
            }

            // Fetch paginated enrollments.
            $user_enrollments = MooWoodle()->enrollment->get_enrollment_information(
                array(
                    'user_id'    => $current_user->ID,
                    'status'     => 'enrolled',
                    'limit'      => $items_per_page,
                    'offset'     => $query_offset,
                    'meta_query' => array(
                        array(
                            'key'     => 'course_id',
                            'value'   => '0',
                            'compare' => '!=',
                        ),
                    ),
                )
            );
            $response         = rest_ensure_response( array() );
            if ( empty( $user_enrollments ) ) {
                return $response;
            }

            $moodle_password = get_user_meta( $current_user->ID, 'moowoodle_moodle_user_pwd', true );
            $moodle_base_url = trailingslashit( MooWoodle()->setting->get_setting( 'moodle_url' ) );

            $formatted_courses = array_map(
                function ( $enrollment ) use ( $current_user, $moodle_password, $moodle_base_url ) {
                    $course = MooWoodle()->course->get_course_information(
                        array(
                            'id' => $enrollment['course_id'],
                        )
                    );
                    $course = reset( $course );

                    $formatted_enrolled_date = '';
                    if ( ! empty( $enrollment['enrollment_date'] ) && strtotime( $enrollment['enrollment_date'] ) ) {
                        $formatted_enrolled_date = gmdate( 'M j, Y - H:i', strtotime( $enrollment['enrollment_date'] ) );
                    }

                    return array(
                        'user_name'       => $current_user->user_login,
                        'course_name'     => $course['fullname'] ?? '',
                        'enrollment_date' => $formatted_enrolled_date,
                        'password'        => $moodle_password,
                        'moodle_url'      => ! empty( $course['moodle_course_id'] )
                        ? apply_filters(
                            'moodle_course_view_url',
                            "{$moodle_base_url}course/view.php?id={$course['moodle_course_id']}",
                            $course['moodle_course_id']
                        )
                        : null,
                    );
                },
                $user_enrollments
            );

            $response = $response->set_data( $formatted_courses );
            $response->header( 'X-WP-Total', $total_user_enrollments );
            return $response;
        } catch ( \Exception $e ) {
            MooWoodle()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'moowoodle' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Get all course filter.
     *
     * @param object $request The request object.
     */
    public function get_filter_items( $request ) {
        // ----- Nonce Check -----
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'moowoodle' ),
                array( 'status' => 403 )
            );

            MooWoodle()->util->log( $error );
            return $error;
        }

        try {
			// Fetch all courses.
			$courses = MooWoodle()->course->get_course_information( array() );
			if ( empty( $courses ) ) {
				return rest_ensure_response(
                    array(
						'courses'  => array(),
						'category' => array(),
                    )
				);
			}

			// Extract unique category IDs.
			$category_ids = array_unique( wp_list_pluck( $courses, 'category_id' ) );

			// Fetch categories.
			$category = MooWoodle()->category->get_course_category_information( $category_ids );

			// Prepare formatted course list.
			$all_courses = array_map(
                function ( $course ) {
                    return array(
                        'label' => $course['fullname'] ?: "Course {$course['id']}",
                        'value' => (string) $course['id'],
                    );
                },
                $courses
			);

			$all_category = array_map(
                function ( $cat ) {
                    return array(
                        'label' => $cat['name'] ?: "Category {$cat['id']}",
                        'value' => (string) $cat['id'],
                    );
                },
                $category
			);

			return rest_ensure_response(
                array(
					'courses'  => $all_courses,
					'category' => $all_category,
                )
			);
        } catch ( \Exception $e ) {
            MooWoodle()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'moowoodle' ),
                array( 'status' => 500 )
            );
        }
    }
}
