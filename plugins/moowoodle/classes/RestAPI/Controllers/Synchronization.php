<?php
/**
 * MooWoodle REST API Settings controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI\Controllers;

use MooWoodle\TestConnection;
use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle REST API Synchronization controller.
 *
 * @class       Synchronization class
 * @version     PRODUCT_VERSION
 * @author      DualCube
 */
class Synchronization extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'synchronization';

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
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'create_item_permissions_check' ),
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
     * Check if a given request has access to create items.
     *
     * @param object $request The REST request object.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Synchronization.
     *
     * @param object $request The request object.
     */
    public function get_items( $request ) {
        $nonce_check = Util::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        try {
            $response = array(
			'status'  => array(),
			'running' => false,
			);

			$status = $request->get_param( 'parameter' );

			if ( 'course' === $status ) {
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
     * @param object $request Full data about the request.
     */
    public function create_item( $request ) {

        $nonce_check = Util::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        try {

            $parameter = $request->get_param( 'parameter' );

            switch ( $parameter ) {

                case 'connection_test':
                    return $this->connection_test_synchronization( $request );

                case 'course':
                    return $this->course_synchronization( $request );

                case ! empty( $parameter ):

                    return apply_filters(
                        "moowoodle_process_{$parameter}_synchronization",
                        $request
                    );
            }

            do_action( 'moowoodle_sync' );

            return null;

        } catch ( \Exception $e ) {

            return Util::server_error( $e );
        }
    }

    /**
     * Test Connection with Moodle server.
     *
     * @param mixed $request rest request object.
     * @return \WP_Error| \WP_REST_Response
     */
    public function connection_test_synchronization( $request ) {

        $action = $request->get_param( 'action' );
        $user   = $request->get_param( 'get_user' );
        $course = $request->get_param( 'get_course' );

        $user   = is_array( $user['data']['users'] ) ? reset( $user['data']['users'] ) : null;
        $course = is_array( $course['courses'] ) ? ( $course['courses'][1] ) : null;

        $response = array();
        switch ( $action ) {
            case 'get_site_info':
                $response = TestConnection::get_site_info();
                break;
            case 'get_course':
                $response = TestConnection::get_course();
                break;
            case 'get_category':
                $response = TestConnection::get_category();
                break;
            case 'create_user':
                $response = TestConnection::create_user();
                break;
            case 'get_user':
                $response = TestConnection::get_user();
                break;
            case 'update_user':
                $response = TestConnection::update_user( $user['id'] );
                break;
            case 'enroll_user':
                $response = TestConnection::enrol_users( $user['id'], $course['id'] );
                break;
            case 'unenroll_user':
                $response = TestConnection::unenrol_users( $user['id'], $course['id'] );
                break;
            case 'delete_user':
                $response = TestConnection::delete_users( $user['id'] );
                break;
            default:
                $response = array( 'error' => $action . ' Test connection function is not defiend' );
        }

        return rest_ensure_response( $response );
    }

    /**
     * Seve the setting set in react's admin setting page.
     *
     * @param mixed $request rest api request object.
     * @return \WP_Error | \WP_REST_Response
     */
    public function course_synchronization( $request ) {
        // Flusk course sync status before sync start.
        Util::flush_sync_status( 'course' );

        set_transient( 'course_sync_running', true );

        $sync_setting = MooWoodle()->setting->get_setting( 'sync-course-options', array() );
        // update course and product categories.
        if ( in_array( 'sync_courses_category', $sync_setting, true ) ) {

            // get all category from moodle.
            $response   = MooWoodle()->external_service->do_request( 'get_categories' );
            $categories = $response['data'];

            Util::set_sync_status(
                array(
					'action'  => __( 'Update Course Category', 'moowoodle' ),
					'total'   => count( $categories ),
					'current' => 0,
                ),
                'course'
            );

            MooWoodle()->category->update_course_categories_information( $categories );

            Util::set_sync_status(
                array(
					'action'  => __( 'Update Product Category', 'moowoodle' ),
					'total'   => count( $categories ),
					'current' => 0,
                ),
                'course'
            );

            MooWoodle()->category->update_product_categories_information( $categories, 'product_cat' );
        }

		// get all caurses from moodle.
		$response = MooWoodle()->external_service->do_request( 'get_courses' );
        $courses  = $response['data'];

        // Update all course.
        Util::set_sync_status(
            array(
				'action'  => __( 'Update Course', 'moowoodle' ),
				'total'   => count( $courses ) - 1,
				'current' => 0,
            ),
            'course'
        );

        MooWoodle()->course->update_courses_information( $courses );

        MooWoodle()->product->update_products( $courses );

        /**
         * Action hook after moowoodle course sync.
         */
        do_action( 'moowoodle_after_sync_course' );

        delete_transient( 'course_sync_running' );

        return rest_ensure_response( true );
    }
}
