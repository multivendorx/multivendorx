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
     * RestAPI construct function.
     */
    public function __construct() {

    }

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
                )
            )
        );
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param object $request The REST request object.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) ;
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
            $limit          = max( intval( $request->get_param( 'row' ) ), 10 );
            $page           = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset         = ( $page - 1 ) * $limit;
            $category_field = $request->get_param( 'catagory' );
            $search_action  = $request->get_param( 'searchaction' );
            $search_field   = $request->get_param( 'search' );
            $count_courses  = $request->get_param( 'count' );

            if ( $count_courses ) {
                $total_courses = MooWoodle()->course->get_course_information( array( 'count' => true ) );
                return rest_ensure_response( $total_courses );
            }

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

            return rest_ensure_response( $formatted_courses );
            
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
