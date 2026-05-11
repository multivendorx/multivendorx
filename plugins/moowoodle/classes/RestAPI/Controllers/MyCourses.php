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
 * MooWoodle REST API My Courses controller.
 *
 * @class       My Courses class
 * @version     PRODUCT_VERSION
 * @author      DualCube
 */
class MyCourses extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'my-courses';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {

        register_rest_route(
            MooWoodle()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'get_item_permissions_check' ),
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
    public function get_item_permissions_check( $request ) {
        return current_user_can( 'customer' ) || current_user_can( 'manage_options' );
    }

    /**
     * Get user enrolled courses.
     *
     * @param object $request The request object.
     */
    public function get_item( $request ) {
        $nonce_check = Util::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        try {
            $items_per_page = max( 1, (int) $request->get_param( 'row' ) ?: 10 );
            $page_number    = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
            $query_offset   = ( $page_number - 1 ) * $items_per_page;

            // Allow pre-filtering by custom filters.
            $user_courses_data = apply_filters( 'moowoodle_user_courses_cohorts_groups_data', null, $request );
            if ( ! empty( $user_courses_data ) ) {
                return $user_courses_data;
            }

            // Fetch paginated enrollments.
            $user_enrollments = MooWoodle()->enrollment->get_enrollment_information(
                array(
                    'user_id'    => MooWoodle()->current_user_id,
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

            $moodle_password = get_user_meta( MooWoodle()->current_user_id, 'moowoodle_moodle_user_pwd', true );
            $moodle_base_url = trailingslashit( MooWoodle()->setting->get_setting( 'moodle_url' ) );
            $current_user = MooWoodle()->current_user;
            
            $formatted_courses = array();

            foreach ( $user_enrollments as $enrollment ) {

                $course = MooWoodle()->course->get_course_information(
                    array(
                        'id' => $enrollment['course_id'],
                    )
                );

                $course = reset( $course );

                $formatted_enrolled_date = '';

                if ( ! empty( $enrollment['enrollment_date'] ) && strtotime( $enrollment['enrollment_date'] ) ) {
                    $formatted_enrolled_date = wp_date('M j, Y - H:i',strtotime( $enrollment['enrollment_date'] ));
                }

                $formatted_courses[] = array(
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
            }

            $total_user_enrollments = MooWoodle()->enrollment->get_enrollment_information(
                array(
                    'user_id' => MooWoodle()->current_user_id,
                    'status'  => 'enrolled',
                    'count'   => true,
                )
            );

            $response->set_data( $formatted_courses );
            $response->header( 'X-WP-Total', $total_user_enrollments );

            return $response;
        } catch ( \Exception $e ) {
            return Util::server_error( $e );
        }
    }
}
