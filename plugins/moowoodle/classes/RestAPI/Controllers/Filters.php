<?php
/**
 * MooWoodle REST API Settings controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI\Controllers;


defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle REST API Filters controller.
 *
 * @class       Filters class
 * @version     PRODUCT_VERSION
 * @author      DualCube
 */
class Filters extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'filters';

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
        $all_courses = array();
        foreach ( $courses as $course ) {
            $all_courses[ $course['id'] ] = $course['fullname'] ? $course['fullname'] : "Course {$course['id']}";
        }

        // Prepare formatted category list.
        $all_category = array();
        foreach ( $category as $cat ) {
            $all_category[ $cat['id'] ] = $cat['name'] ? $cat['name'] : "Category {$cat['id']}";
        }

        return rest_ensure_response(
            apply_filters(
                'moowoodle_filters',
                array(
					'courses'  => $all_courses,
					'category' => $all_category,
                )
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
