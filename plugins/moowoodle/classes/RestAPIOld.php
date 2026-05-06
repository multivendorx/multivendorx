<?php
/**
 * MooWoodle RestAPI file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle Rest API class
 *
 * @version     3.3.0
 * @package     MooWoodle
 * @author      DualCube
 */
class RestAPIOld {
    /**
     * RestAPI construct function.
     */
    public function __construct() {
        // If user is admin.
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'rest_api_init', array( &$this, 'register' ) );
        }

        // If user is admin or customer.
        if ( current_user_can( 'read' ) || current_user_can( 'customer' ) || current_user_can( 'manage_options' ) ) {
            add_action( 'rest_api_init', array( &$this, 'register_user_api' ) );
        }

		add_filter( 'moowoodle_process_connection_test_synchronization', array( $this, 'connection_test_synchronization' ) );
		add_filter( 'moowoodle_process_course_synchronization', array( $this, 'course_synchronization' ) );
    }

    /**
     * Rest api register function call on rest_api_init action hook.
     *
     * @return void
     */
    public function register() {
        register_rest_route(
            MooWoodle()->rest_namespace,
            '/settings',
            array(
				'methods'             => \WP_REST_Server::ALLMETHODS,
				'callback'            => array( $this, 'set_settings' ),
				'permission_callback' => array( $this, 'moowoodle_permission' ),
			)
        );

        register_rest_route(
            MooWoodle()->rest_namespace,
            '/synchronization',
            array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'synchronization' ),
					'permission_callback' => array( $this, 'moowoodle_permission' ),
				),
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_sync_status' ),
					'permission_callback' => array( $this, 'moowoodle_permission' ),
				),

			)
        );

        register_rest_route(
            MooWoodle()->rest_namespace,
            '/courses',
            array(
				'methods'             => 'GET',
				'callback'            => array( MooWoodle()->course, 'get_courses' ),
				'permission_callback' => array( $this, 'moowoodle_permission' ),
			)
        );
        register_rest_route(
            MooWoodle()->rest_namespace,
            '/filters',
            array(
				'methods'             => \WP_REST_Server::ALLMETHODS,
				'callback'            => array( $this, 'get_all_filters' ),
				'permission_callback' => array( MooWoodle()->restAPI, 'moowoodle_permission' ),
			)
        );

        register_rest_route(
            MooWoodle()->rest_namespace,
            '/logs',
            array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_log' ),
				'permission_callback' => array( $this, 'moowoodle_permission' ),
			)
        );
    }

    /**
     * Rest api register function for users.
     *
     * @return void
     */
    public function register_user_api() {

        register_rest_route(
            MooWoodle()->rest_namespace,
            '/my-courses',
            array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_my_courses' ),
				'permission_callback' => array( $this, 'user_has_api_access' ),
			)
        );
    }

    /**
     * MooWoodle api permission function.
     *
     * @return bool
     */
    public function moowoodle_permission() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Check if the current user has API access based on allowed roles.
     *
     * @return bool True if the user is an administrator or customer, otherwise false.
     */
    public function user_has_api_access() {
        return current_user_can( 'read' ) || current_user_can( 'customer' ) || current_user_can( 'manage_options' );
    }

    /**
     * Seve the setting set in react's admin setting page.
     *
     * @param mixed $request rest api request object.
     * @return \WP_Error | \WP_REST_Response
     */
    public function set_settings( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }
        try {
            $all_details   = array();
            $settings_data = $request->get_param( 'setting' );
            $settingsname  = $request->get_param( 'settingName' );
            $settingsname  = str_replace( '-', '_', 'moowoodle_' . $settingsname . '_settings' );

            // save the settings in database.
            MooWoodle()->setting->update_option( $settingsname, $settings_data );

            /**
             * Moodle after setting save.
             *
             * @var $settingsname settingname.
             * @var $settingdata settingdata.
             */
            do_action( 'moowoodle_after_setting_save', $settingsname, $settings_data );

            $all_details['error'] = __( 'Settings Saved', 'moowoodle' );

            return $all_details;
        } catch ( \Exception $err ) {
            return rest_ensure_response( __( 'Unabled to Saved', 'moowoodle' ) );
        }
    }

    /**
     * Handles synchronization requests based on the 'parameter' value.
     *
     * Supported parameters:
     * - 'connection_test'     : Tests the connection to the remote system.
     * - 'course'   : Synchronizes all courses.
     * - 'user'     : Triggers synchronization of all users.
     * - 'cohort'   : (Pro feature) Triggers synchronization of all cohorts.
     * - Default    : Triggers general synchronization.
     *
     * @param WP_REST_Request $request The REST API request object.
     *
     * @return mixed Response from the specific sync handler or null.
     */
    public function synchronization( $request ) {
        $parameter = $request->get_param( 'parameter' );

        if ( ! empty( $parameter ) ) {
            return apply_filters( "moowoodle_process_{$parameter}_synchronization", $request );
        } else {
            do_action( 'moowoodle_sync' );
        }

        return null;
    }

    /**
     * Test Connection with Moodle server.
     *
     * @param mixed $request rest request object.
     * @return \WP_Error| \WP_REST_Response
     */
    public function connection_test_synchronization( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }
        $action    = $request->get_param( 'action' );
        $user_id   = $request->get_param( 'user_id' );
        $course_id = $request->get_param( 'course_id' );
        $response  = array();
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
                $response = TestConnection::update_user( $user_id );
                break;
            case 'enroll_user':
                $response = TestConnection::enrol_users( $user_id, $course_id );
                break;
            case 'unenroll_user':
                $response = TestConnection::unenrol_users( $user_id, $course_id );
                break;
            case 'delete_user':
                $response = TestConnection::delete_users( $user_id );
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
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }
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

    /**
     * Get sync status.
     *
     * @param mixed $request all requests params from api.
     * @return \WP_Error|\WP_REST_Response
     */
    public function get_sync_status( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }

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
    }

    /**
     * Get all course and category filters for use in dropdowns or filters.
     * Verifies the REST nonce before fetching data.
     *
     * @param WP_REST_Request $request REST API request object.
     * @return WP_REST_Response|\WP_Error REST response with course and category lists or error on failure.
     */
    public function get_all_filters( $request ) {

        // Verify nonce.
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }

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
    }

    /**
     * Save the setting set in react's admin setting page.
     *
     * @param mixed $request all requests params from api.
     * @return \WP_Error|\WP_REST_Response
     */
    public function get_log( $request ) {
        global $wp_filesystem;
        $nonce     = $request->get_header( 'X-WP-Nonce' );
        $log_count = $request->get_param( 'logcount' );
        $log_count = $log_count ? $log_count : 100;
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }
        if ( ! $wp_filesystem ) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            WP_Filesystem();
        }
        $action = $request->get_param( 'action' );
        switch ( $action ) {
            case 'download':
                return $this->download_log( $request );
                break;
            case 'clear':
                $wp_filesystem->delete( MooWoodle()->log_file );
                delete_option( 'moowoodle_log_file' ); // Remove log file reference from options table.
                return rest_ensure_response( true );
            default:
                $logs = array();
                if ( file_exists( MooWoodle()->log_file ) ) {
                    $log_content = $wp_filesystem->get_contents( MooWoodle()->log_file );
                    if ( ! empty( $log_content ) ) {
                        $logs = explode( "\n", $log_content );
                    }
                }
                return rest_ensure_response( array_reverse( array_slice( $logs, - $log_count ) ) );
        }
    }

    /**
     * Download the log.
     *
     * @param mixed $request all requests params from api.
     * @return \WP_Error|\WP_REST_Response
     */
    public function download_log( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'moowoodle' ), array( 'status' => 403 ) );
        }
        // Get the file parameter from the request.
        $file      = get_option( 'moowoodle_log_file' );
        $file      = basename( $file );
        $file_path = MooWoodle()->moowoodle_logs_dir . '/' . $file;

        // Check if the file exists and has the right extension.
        if ( file_exists( $file_path ) && preg_match( '/\.(txt|log)$/', $file ) ) {
            // Set headers to force download.
            header( 'Content-Description: File Transfer' );
            header( 'Content-Type: application/octet-stream' );
            header( 'Content-Disposition: attachment; filename="' . $file . '"' );
            header( 'Expires: 0' );
            header( 'Cache-Control: must-revalidate' );
            header( 'Pragma: public' );
            header( 'Content-Length: ' . filesize( $file_path ) );

            // Clear output buffer and read the file.
            ob_clean();
            flush();
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
            readfile( $file_path );
            exit;
        } else {
            return new \WP_Error( 'file_not_found', 'File not found', array( 'status' => 404 ) );
        }
    }

    /**
     * Fetch all enrolled courses for the current user.
     *
     * @param WP_REST_Request $request The REST API request.
     *
     * @return WP_REST_Response|\WP_Error JSON response containing enrolled courses and pagination details.
     */
    public function get_my_courses( $request ) {
        $current_user = wp_get_current_user();
        if ( empty( $current_user->ID ) ) {
            Util::log( '[MooWoodle] get_my_courses(): No logged-in user found.' );
            return rest_ensure_response(
                array(
					'status'  => 'error',
					'message' => 'User not logged in.',
                )
            );
        }

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

        if ( empty( $user_enrollments ) ) {
            return rest_ensure_response(
                array(
					'data'   => array(),
					'status' => 'success',
                )
            );
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

        return rest_ensure_response(
            array(
				'data'   => $formatted_courses,
                'count'  => $total_user_enrollments,
				'status' => 'success',
            )
        );
    }
}
