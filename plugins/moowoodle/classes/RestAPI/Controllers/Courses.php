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
     * Get items.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public function get_items( $request ) {

        $nonce_check = Util::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        try {
            $options = $request->get_param( 'options' );

            if ( $options ) {
                return $this->get_filter_items( $request );
            }

            $limit          = max( intval( $request->get_param( 'row' ) ), 10 );
            $page           = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset         = ( $page - 1 ) * $limit;
            $category_field = $request->get_param( 'category' );
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
                $synced_products = array();
                $product_image   = '';

                if ( $course['product_id'] ) {
                    $product = wc_get_product( (int)$course['product_id'] );
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
                        'id'                => (int) $course['id'],
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
           return Util::server_error( $e );
        }
    }


    /**
     * Get course and category filter items.
     *
     * Returns formatted course and category options
     * for filter dropdown fields.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public function get_filter_items( $request ) {

        $plugin = MooWoodle();

        // Fetch all courses.
        $courses = $plugin->course->get_course_information( array() );

        if ( empty( $courses ) ) {
            return rest_ensure_response(
                array(
                    'courses' => array(),
                    'category' => array(),
                )
            );
        }

        // Extract unique category IDs.
        $category_ids = array_unique(
            wp_list_pluck( $courses, 'category_id' )
        );

        // Fetch categories.
        $categories = $plugin->category->get_course_category_information(
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
                'courses' => $formatted_courses,
                'category' => $formatted_categories,
            )
        );
    }
}
