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
 * REST API controller for Moodle connection testing.
 *
 * @version     3.4.0
 */
class TestConnection extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'test-connection';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            MooWoodle()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'permissions_check' ),
                ),
            )
        );
    }

    /**
	 * Check request permissions.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return bool
	 */
    public function permissions_check( $request ) {
        return current_user_can( 'manage_options' );
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

		$action    = $request->get_param( 'action' );
        $test_user = $request->get_param( 'get_users' );
        $course    = $request->get_param( 'get_courses' );

        $test_user = isset( $test_user['data']['users'][1] ) ? $test_user['data']['users'][1] : null;
		$course    = isset( $course['courses'][1] ) ? $course['courses'][1] : null;
        $user_id   = $test_user['id'] ?? 0;
        $course_id = $course['id'] ?? 0;

        $action_args = array(
            'update_users'   => array( $user_id ),
            'enroll_users'   => array( $user_id, $course_id ),
            'unenroll_users' => array( $user_id, $course_id ),
            'delete_users'   => array( $user_id ),
        );

		if ( ! method_exists( $this, $action ) ) {
            return new \WP_Error(
                'invalid_connection_test',
                sprintf(
                    /* translators: %s: action name */
                    __( '%s test connection function is not defined.', 'moowoodle' ),
                    $action
                ),
                array( 'status' => 400 )
            );
        }

        return rest_ensure_response( call_user_func_array( array( $this, $action ), $action_args[ $action ] ?? array() ) );
    }

    /**
	 * Get Site info of the Moodle site.
     *
	 * @return mixed
	 */
	public static function get_site_info() {
		// Get the site info.
		$response = MooWoodle()->external_service->do_request( 'get_site_info' );

		if ( $response && ! isset( $response['error'] ) ) {
			$response = $response['data'];

			// Get all webservice functions.
			$registered_core_functions = MooWoodle()->external_service->get_registered_core_functions();
			$registered_core_functions = array_values( $registered_core_functions );

			// Get register webservice functions.
			$registered_functions = array_map(
                function ( $function ) {
					return $function['name'];
				},
                $response['functions']
            );

			// Get missing functions.
			$unregistered_functions = array_diff( $registered_core_functions, $registered_functions );

			if ( $unregistered_functions ) {
				MooWoodle()->util->log( 'It seems that Moodle external web service functions [' . implode( ', ', $unregistered_functions ) . '] not configured correctly.' );
			}

			do_action( 'moowoodle_after_missing_functions_check', $unregistered_functions, $response );

			update_option( 'moowoodle_moodle_site_name', $response['sitename'] );
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Get all Moodle Course.
     *
	 * @return array
	 */
	public static function get_courses() {
		$response = MooWoodle()->external_service->do_request( 'get_courses' );

		if ( $response && ! isset( $response['error'] ) && ! empty( $response['data'] ) ) {
			$response = array(
				'courses' => $response['data'],
				'success' => true,
			);
		}

		return $response;
	}

	/**
	 * Get all Moodle Category.
     *
	 * @return array
	 */
	public static function get_categories() {
		$response = MooWoodle()->external_service->do_request( 'get_categories' );

		if ( $response && ! isset( $response['error'] ) ) {
			$response = array(
				'categories' => $response['data'],
				'success'    => true,
			);
		}

		return $response;
	}

	/**
	 * Create a dummy user for test connection.
     *
	 * @return string[]
	 */
	public static function create_users() {
		// Find existing Moodle test user.
		$response = MooWoodle()->external_service->do_request(
			'get_moodle_users',
			array(
				'criteria' => array(
					array(
						'key'   => 'username',
						'value' => 'moowoodletestuser',
					),
				),
			)
		);

		if ( ! empty( $response['data']['users'] ) ) {
			$test_user = reset( $response['data']['users'] );
		    self::delete_users( $test_user['id'] );
		}

		$response = MooWoodle()->external_service->do_request(
            'create_users',
            array(
				'users' => self::get_test_user_payload(),
			)
        );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Get the previously created dummy user.
     *
	 * @return array
	 */
	public static function get_users() {
		$response = MooWoodle()->external_service->do_request(
            'get_moodle_users',
            array(
				'criteria' => array(
					array(
						'key'   => 'username',
						'value' => 'moowoodletestuser',
					),
				),
			)
        );

		if ( $response && ! isset( $response['error'] ) && ! empty( $response['data']['users'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Update Moodle dummy user.
     *
	 * @param int $user_id dummy user id.
	 * @return mixed
	 */
	public static function update_users( $user_id ) {
		$response = MooWoodle()->external_service->do_request(
            'update_users',
            array(
				'users' => self::get_test_user_payload( $user_id ),
			)
        );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Enrol a user to a particular course.
     *
	 * @param mixed $user_id user id.
	 * @param mixed $course_id course id.
	 * @return mixed response
	 */
	public static function enroll_users( $user_id, $course_id ) {
		$response = MooWoodle()->external_service->do_request(
            'enrol_users',
            array(
				'enrolments' => array(
					array(
						'courseid' => (string) $course_id,
						'userid'   => (string) $user_id,
						'roleid'   => '5',
					),
				),
			)
        );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Unenrol a user to a particular course.
     *
	 * @param mixed $user_id user id.
	 * @param mixed $course_id course id.
	 * @return mixed response
	 */
	public static function unenroll_users( $user_id, $course_id ) {
		$response = MooWoodle()->external_service->do_request(
            'unenrol_users',
            array(
				'enrolments' => array(
					array(
						'courseid' => "$course_id",
						'userid'   => "$user_id",
					),
				),
			)
        );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Summary of delete_users.
     *
	 * @param mixed $user_id user id.
	 * @return mixed
	 */
	public static function delete_users( $user_id ) {
		$response = MooWoodle()->external_service->do_request( 'delete_users', array( 'userids' => array( $user_id ) ) );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Get dummy Moodle user data.
	 *
	 * @param int $user_id User ID.
	 * @return array
	 */
	private static function get_test_user_payload( $user_id = 0 ) {
		$test_user_payload = array(
			'email'       => 'moowoodletestuser@gmail.com',
			'username'    => 'moowoodletestuser',
			'password'    => 'Moowoodle@123',
			'auth'        => apply_filters( 'moowoodle_new_user_auth_type', 'manual' ),
			'firstname'   => 'moowoodle',
			'lastname'    => 'testuser',
			'city'        => 'moowoodlecity',
			'country'     => 'IN',
			'preferences' => array_merge(
				array(
					array(
						'type'  => 'auth_forcepasswordchange',
						'value' => apply_filters( 'moowoodle_new_user_forcepasswordchange_value', 1 ),
					),
				),
				apply_filters( 'moowoodle_new_user_additional_preferences', array() )
			),
		);

		if ( $user_id > 0 ) {
			$test_user_payload['id'] = $user_id;
		}

		return array( $test_user_payload );
	}
}
