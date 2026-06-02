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
 * MooWoodle REST API Synchronization controller.
 *
 * @version     3.4.0
 */
class Synchronization extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'synchronization';

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
                    'permission_callback' => array( $this, 'permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'permissions_check' ),
                ),
            )
        );
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param \WP_REST_Request $request The REST request object.
     */
    public function permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Synchronization.
     *
     * @param \WP_REST_Request $request The request object.
     */
    public function get_items( $request ) {
        $nonce_check = Util::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        try {
			$sync_type = $request->get_param( 'parameter' );

			if ( 'course' === $sync_type ) {
				$response = array(
					'status'  => Util::get_sync_status( 'course' ),
					'running' => get_transient( 'course_sync_running' ),
				);
            } else {
                $response = apply_filters( 'moowoodle_sync_status', $request );
            }

			return rest_ensure_response( $response );
        } catch ( \Exception $e ) {
            return Util::server_error( $e );
        }
    }

    /**
     * Synchronization.
     *
     * @param \WP_REST_Request $request Full data about the request.
     */
    public function create_item( $request ) {
        $nonce_check = Util::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        try {
            $sync_type = $request->get_param( 'parameter' );

            switch ( $sync_type ) {
                case 'course':
                    return $this->course_synchronization( $request );

                default:
                    return apply_filters(
                        "moowoodle_process_{$sync_type}_synchronization",
                        $request
                    );
            }
        } catch ( \Exception $e ) {
            return Util::server_error( $e );
        }
    }

    /**
     * Save the setting set in react's admin setting page.
     *
     * @param mixed $request rest api request object.
     * @return \WP_Error | \WP_REST_Response
     */
    public function course_synchronization( $request ) {
        // Flush course sync status before sync start.
        Util::flush_sync_status( 'course' );

        set_transient( 'course_sync_running', true );

        $sync_settings = MooWoodle()->setting->get_setting( 'sync_course_options', array() );
        // update course and product categories.
        if ( in_array( 'sync_courses_category', $sync_settings, true ) ) {

            // get all category from moodle.
            $response   = MooWoodle()->external_service->do_request( 'get_categories' );
            $categories = $response['data'];

            Util::set_sync_status(
                array(
					'action' => __( 'Update Course Category', 'moowoodle' ),
					'total'  => count( $categories ),
                ),
                'course'
            );

            MooWoodle()->category->update_course_categories( $categories );

            Util::set_sync_status(
                array(
					'action' => __( 'Update Product Category', 'moowoodle' ),
					'total'  => count( $categories ),
                ),
                'course'
            );

            MooWoodle()->category->update_product_categories( $categories, 'product_cat' );
        }

		// get all courses from moodle.
		$response = MooWoodle()->external_service->do_request( 'get_courses' );
        $courses  = $response['data'];

        // Update all course.
        Util::set_sync_status(
            array(
				'action' => __( 'Update Course', 'moowoodle' ),
				'total'  => max( 0, count( $courses ) - 1 ),
            ),
            'course'
        );

        MooWoodle()->course->update_courses( $courses );

        MooWoodle()->product->update_products( $courses );

        /**
         * Action hook after moowoodle course sync.
         */
        do_action( 'moowoodle_after_sync_course' );

        delete_transient( 'course_sync_running' );

        return rest_ensure_response( true );
    }
}
