<?php
/**
 * ExternalService class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle ExternalService class
 *
 * @version 3.1.7
 * @package MooWoodle
 * @author  DualCube
 */
class ExternalService {

	/**
	 * Get moodle core function
     *
	 * @return string[] core functions
	 */
	public function get_core_functions() {
		return apply_filters(
            'additional_core_functions',
            array(
				'get_site_info'       => 'core_webservice_get_site_info',
				'get_categories'      => 'core_course_get_categories',
				'get_courses'         => 'core_course_get_courses',
				'get_moodle_users'    => 'core_user_get_users',
				'create_users'        => 'core_user_create_users',
				'update_users'        => 'core_user_update_users',
				'delete_users'        => 'core_user_delete_users',
				'enrol_users'         => 'enrol_manual_enrol_users',
				'get_course_id'       => 'core_course_get_courses_by_field',
				'unenrol_users'       => 'enrol_manual_unenrol_users',
				'get_cohort'          => 'core_cohort_get_cohorts',
				'add_cohort_member'   => 'core_cohort_add_cohort_members',
				'delete_member'       => 'core_cohort_delete_cohort_members',
				'get_groups'          => 'core_group_get_course_groups',
				'create_group'        => 'core_group_create_groups',
				'add_group_member'    => 'core_group_add_group_members',
				'remove_group_member' => 'core_group_delete_group_members',
			)
        );
	}

	/**
	 * Call to moodle core functions.
	 *
	 * @param string $key           Key name for the Moodle function to call. Default: ''.
	 * @param array  $request_param Parameters to send with the request. Default: empty array.
	 * @return mixed
	 */
	public function do_request( $key = '', $request_param = array() ) {
		// Get register core functions.
		$moodle_core_functions = $this->get_core_functions();

		// Get the function name.
		$function_name = '';
		if ( array_key_exists( $key, $moodle_core_functions ) ) {
			$function_name = $moodle_core_functions[ $key ];
		}

		$moodle_base_url     = MooWoodle()->setting->get_setting( 'moodle_url' );
		$moodle_access_token = MooWoodle()->setting->get_setting( 'moodle_access_token' );

		$request_url = rtrim( $moodle_base_url, '/' ) . '/webservice/rest/server.php?wstoken=' . $moodle_access_token . '&wsfunction=' . $function_name . '&moodlewsrestformat=json';

		// Get response from moodle server.
		$response = null;
		if ( ! empty( $moodle_base_url ) && ! empty( $moodle_access_token ) && $function_name ) {
			$request_query = http_build_query( $request_param );

			$timeout = MooWoodle()->setting->get_setting( 'moodle_timeout' );
			$timeout = $timeout ? $timeout : '10';

			$response = wp_remote_post(
                $request_url,
                array(
					'body'    => $request_query,
					'timeout' => $timeout,
                )
            );

			$show_adv_log = MooWoodle()->setting->get_setting( 'moowoodle_adv_log' );
			$show_adv_log = is_array( $show_adv_log ) ? $show_adv_log : array();
			$show_adv_log = in_array( 'moowoodle_adv_log', $show_adv_log, true );

            // Log the response result.
            if ( $show_adv_log ) {
				MooWoodle()->util->log( 'moowoodle moodle_url:' . $request_url . '&' . $request_query . "\n\t\tmoowoodle response:" . wp_json_encode( $response ) . "\n\n" );
			}
		}

		// check the response containe error.
		$response = self::check_connection( $response );

		// return response on success.
		return $response;
	}

	/**
	 * Check server resposne result .
     *
	 * @param object | null $response response.
	 * @return array $response
	 */
	private function check_connection( $response ) {
		if ( $response === null ) {
			return array( 'error' => 'Response is not avialable' );
		}

		// if server response containe error.
		if ( is_wp_error( $response ) || $response['response']['code'] !== 200 ) {
			// if response is object and multiple error codes.
			if ( is_object( $response ) && is_array( $response->get_error_code() ) ) {
				return array( 'error' => implode( ' | ', $response->get_error_code() ) . $response->get_error_message() );
			}

			// if response is associative array.
			if ( is_array( $response ) ) {
				return array( 'error' => $response['response']['code'] . $response['response']['message'] );
			}

			return array( 'error' => $response->get_error_code() . $response->get_error_message() );
		}

		// convert moodle response to array.
		$response = json_decode( $response['body'], true );

		// if array convertion failed.
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return array( 'error' => __( 'Response is not JSON decodeable', 'moowoodle' ) );
		}

		// if moodle response containe error.
		if ( $response && array_key_exists( 'exception', $response ) ) {
			if ( str_contains( $response['message'], 'Access control exception' ) ) {
				return array( 'error' => $response['message'] . ' <a href="' . MooWoodle()->setting->get_setting( 'moodle_url' ) . '/admin/settings.php?section=externalservices">Link</a>' );
			}
			if ( str_contains( $response['message'], 'Invalid moodle_access_token' ) ) {
				return array( 'error' => $response['message'] . ' <a href="' . MooWoodle()->setting->get_setting( 'moodle_url' ) . '/admin/webservice/tokens.php">Link</a>' );
			}
			return array( 'error' => $response['message'] . ' <a href="' . MooWoodle()->setting->get_setting( 'moodle_url' ) . '/admin/webservice/tokens.php">Link</a>' );
		}

		// success.
		return array(
			'data'    => $response,
			'success' => true,
		);
	}
}
