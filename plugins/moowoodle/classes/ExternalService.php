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
 * @version     3.3.0
 * @package     MooWoodle
 * @author      DualCube
 */
class ExternalService {

	/**
	 * Get moodle core function
     *
	 * @return string[] core functions
	 */
	public function get_registered_core_functions() {
		return apply_filters(
            'moowoodle_registered_core_functions',
            array(
				'get_site_info'    => 'core_webservice_get_site_info',
				'get_categories'   => 'core_course_get_categories',
				'get_courses'      => 'core_course_get_courses',
				'get_moodle_users' => 'core_user_get_users',
				'create_users'     => 'core_user_create_users',
				'update_users'     => 'core_user_update_users',
				'delete_users'     => 'core_user_delete_users',
				'enrol_users'      => 'enrol_manual_enrol_users',
				'unenrol_users'    => 'enrol_manual_unenrol_users',
			)
        );
	}

	/**
	 * Call to moodle core functions.
	 *
	 * @param string $function_key   Key name for the Moodle function to call. Default: ''.
	 * @param array  $request_args Parameters to send with the request. Default: empty array.
	 * @return mixed
	 */
	public function do_request( $function_key = '', $request_args = array() ) {
		// Get register core functions.
		$moodle_core_functions = $this->get_registered_core_functions();

		if ( empty( $moodle_core_functions[ $function_key ] ) ) {
			MooWoodle()->util->log( 'Invalid Moodle function key.' );
			return;
		}

		$moodle_url   = untrailingslashit( MooWoodle()->setting->get_setting( 'moodle_url' ) );
		$access_token = MooWoodle()->setting->get_setting( 'moodle_access_token' );

		if ( empty( $moodle_url ) || empty( $access_token ) ) {
			return array(
				'error' => __( 'Moodle credentials are missing.', 'moowoodle' ),
			);
		}

		$request_url = add_query_arg(
			array(
				'wstoken'            => $access_token,
				'wsfunction'         => $moodle_core_functions[ $function_key ],
				'moodlewsrestformat' => 'json',
			),
			$moodle_url . '/webservice/rest/server.php'
		);

		$timeout = (int) MooWoodle()->setting->get_setting( 'moodle_timeout', 10 );

		$response = wp_remote_post(
			$request_url,
			array(
				'body'    => $request_args,
				'timeout' => $timeout,
			)
		);

		// Log the response result.
		if ( MooWoodle()->show_advanced_log ) {
			MooWoodle()->util->log( 'moowoodle moodle_url:' . $request_url . '&' . wp_json_encode( $request_args ) . "\n\t\tmoowoodle response:" . wp_json_encode( $response ) . "\n\n" );
		}

		return $this->parse_moodle_response( $response );
	}

	/**
	 * Check server response result .
     *
	 * @param object | null $response response.
	 * @return array $response
	 */
	private function parse_moodle_response( $response ) {
		if ( null === $response ) {
			return array( 'error' => 'Response is not available' );
		}

		// if server response contains error.
		if ( is_wp_error( $response ) || 200 !== $response['response']['code'] ) {
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
			return array( 'error' => __( 'Response is not JSON-decodable', 'moowoodle' ) );
		}

		// if moodle response contains error.
		if ( $response && ! empty( $response['exception'] ) ) {
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
