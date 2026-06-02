<?php
/**
 * MooWoodle Util file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;

/**
 * Plugin Helper functions
 *
 * @version     3.3.0
 * @package     MooWoodle
 * @author      DualCube
 */
class Util {

	/**
     * Constant holds table name
     *
     * @var array
     */
    public const TABLES = array(
        'enrollment' => 'mw_enrollment',
        'category'   => 'mw_moodle_categories',
        'course'     => 'mw_courses',
    );

    public const MOOWOODLE_SETTINGS = array(
        'notification'       => 'moowoodle_notification_settings',
        'synchronize-course' => 'moowoodle_synchronize_course_settings',
        'synchronize-user'   => 'moowoodle_synchronize_user_settings',
        'connection-access'  => 'moowoodle_connection_access_settings',
        'course-enrollment'  => 'moowoodle_course_enrollment_settings',
        'system-logs'        => 'moowoodle_system_logs_settings',
    );

    public const MOOWOODLE_OTHER_SETTINGS = array(
        'log_file' => 'moowoodle_log_file',
    );

    public const MOOWOODLE_PRODUCT_META = array(
        'course_startdate'    => 'moowoodle_course_startdate',
        'course_enddate'      => 'moowoodle_course_enddate',
        'moodle_course_id'    => 'moowoodle_moodle_course_id',
        'wordpress_course_id' => 'moowoodle_wordpress_course_id',
    );

    public const MOOWOODLE_TERM_META = array(
        'category_id'   => '_category_id',
        'parent_id'     => '_parent',
        'category_path' => '_category_path',
    );

    public const MOOWOODLE_USER_META = array(
        'password_reset' => 'moowoodle_moodle_password_reset_required',
    );

    /**
     * Write log entry to MooWoodle log file.
     *
     * @param mixed  $message Log message, Exception, or WP_Error.
     * @param string $log_type Log level/type.
     * @param array  $log_context Additional log context.
     *
     * @return bool
     */
    public static function log( $message = '', $log_type = 'INFO', $log_context = array() ) {
        global $wp_filesystem, $wpdb;

        // Initialize WordPress filesystem.
        if ( empty( $wp_filesystem ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        if ( ! $wp_filesystem ) {
            return false;
        }

        $logs_dir = trailingslashit( MooWoodle()->moowoodle_logs_dir );
        $log_file = MooWoodle()->log_file;

        if ( ! $wp_filesystem->is_dir( $logs_dir ) ) {
            wp_mkdir_p( $logs_dir );
        }

        try {
            $htaccess_file = $logs_dir . '.htaccess';
            $index_file    = $logs_dir . 'index.html';

            if ( ! $wp_filesystem->exists( $htaccess_file ) ) {
                $wp_filesystem->put_contents(
                    $htaccess_file,
                    'deny from all',
                    FS_CHMOD_FILE
                );
            }

            if ( ! $wp_filesystem->exists( $index_file ) ) {
                $wp_filesystem->put_contents(
                    $index_file,
                    '',
                    FS_CHMOD_FILE
                );
            }
        } catch ( \Exception $exception ) {
            error_log( $exception->getMessage() );
        }

        if ( $message instanceof \Exception ) {
            $log_type    = 'EXCEPTION';
            $log_context = array_merge(
                $log_context,
                array(
                    'exception_message' => $message->getMessage(),
                    'exception_code'    => $message->getCode(),
                    'exception_file'    => $message->getFile(),
                    'exception_line'    => $message->getLine(),
                    'exception_trace'   => $message->getTraceAsString(),
                )
            );
            $message     = 'Exception occurred';
        }

        if ( $message instanceof \WP_Error ) {
            $log_type    = 'WP_ERROR';
            $log_context = array_merge(
                $log_context,
                array(
                    'error_code'    => $message->get_error_code(),
                    'error_message' => $message->get_error_message(),
                    'error_data'    => $message->get_error_data(),
                )
            );
            $message     = 'WP_Error occurred';
        }

        if ( ! empty( $wpdb->last_error ) ) {
            $log_context['db_error'] = $wpdb->last_error;
            $log_context['db_query'] = $wpdb->last_query;
        }

        $backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 2 );
        $caller    = $backtrace[1] ?? array();
        $timestamp = current_time( 'mysql' );

        $log_metadata = array_merge(
            array(
                'type'      => $log_type,
                'timestamp' => $timestamp,
                'file'      => $caller['file'] ?? '',
                'line'      => $caller['line'] ?? '',
                'stack'     => wp_debug_backtrace_summary(),
            ),
            $log_context
        );

        // Prepare log lines.
        $log_lines = array();
        foreach ( $log_metadata as $context_key => $context_value ) {
            if ( ! is_scalar( $context_value ) ) {
                $context_value = wp_json_encode( $context_value );
            }

            $log_lines[] = sprintf(
                '%1$s : %2$s: %3$s',
                $timestamp,
                $context_key,
                trim( (string) $context_value )
            );
        }

        // Add main message.
        $formatted_message = is_scalar( $message )
            ? trim( (string) $message )
            : wp_json_encode( $message );

        $log_lines[] = sprintf(
            '%1$s : message: %2$s',
            $timestamp,
            trim( $formatted_message )
        );

        $log_entry = implode( PHP_EOL, $log_lines ) . PHP_EOL;

        // Get existing logs.
        $existing_log_content = '';

        if ( $wp_filesystem->exists( $log_file ) ) {
            $existing_log_content = $wp_filesystem->get_contents( $log_file );
        }

        // Add spacing between log entries.
        if ( ! empty( $existing_log_content ) ) {
            $log_entry = PHP_EOL . $log_entry;
        }

        // Write logs.
        return $wp_filesystem->put_contents(
            $log_file,
            $existing_log_content . $log_entry,
            FS_CHMOD_FILE
        );
    }

	/**
     * Get other templates ( e.g. product attributes ) passing attributes and including the file.
     *
     * @access public
     * @param mixed $template_name template name.
     * @param array $template_args default: array().
     * @return void
     */
    public static function get_template( $template_name, $template_args = array() ) {
        // Check if the template exists in the theme.
        $theme_template = get_stylesheet_directory() . '/moowoodle/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template.
        $located = file_exists( $theme_template ) ? $theme_template : MooWoodle()->plugin_path . 'templates/' . $template_name;

        // Load the template.
        load_template( $located, false, $template_args );
    }

	/**
	 * Check is MooWoodle Pro is active or not.
     *
	 * @return bool
	 */
	public static function is_khali_dabba() {
		return apply_filters( 'kothay_dabba', false );
	}

	/**
	 * Set moowoodle sync status.
     *
	 * @param mixed $sync_status status.
	 * @param mixed $sync_key key.
	 * @return void
	 */
	public static function set_sync_status( $sync_status, $sync_key ) {
		$sync_history           = get_transient( 'moowoodle_sync_status_' . $sync_key );
		$sync_history           = is_array( $sync_history ) ? $sync_history : array();
        $sync_status['current'] = 0;
		$sync_history[]         = $sync_status;

		set_transient( 'moowoodle_sync_status_' . $sync_key, $sync_history, HOUR_IN_SECONDS );
	}

	/**
	 * Get moowoodle sync status.
     *
	 * @param mixed $sync_key key.
	 * @return mixed
	 */
	public static function get_sync_status( $sync_key ) {
		$sync_status = get_transient( 'moowoodle_sync_status_' . $sync_key );
		return is_array( $sync_status ) ? $sync_status : array();
	}

	/**
	 * Increment sync count.
     *
	 * @param mixed $sync_key key.
	 * @return void
	 */
	public static function increment_sync_count( $sync_key ) {
		$sync_status = get_transient( 'moowoodle_sync_status_' . $sync_key );
        if ( empty( $sync_status ) ) {
            return;
        }
		$current_action = count( $sync_status ) - 1;

		// Update the current action count.
		++$sync_status[ $current_action ]['current'];

		set_transient( 'moowoodle_sync_status_' . $sync_key, $sync_status, HOUR_IN_SECONDS );
	}

	/**
	 * Flush the sync status history.
     *
	 * @param mixed $sync_key key.
	 * @return void
	 */
	public static function flush_sync_status( $sync_key ) {
		set_transient( 'moowoodle_sync_status_' . $sync_key, array() );
	}

    /**
	 * Convert WordPress PHP date format to React date picker format
	 *
	 * @param string $date_format WordPress PHP date format.
	 * @return string React date picker format.
	 */
	public static function wp_to_react_date_format( $date_format ) {
		static $map = array(
			'Y' => 'YYYY',
			'y' => 'YY',
			'F' => 'MMMM',
			'M' => 'MMM',
			'm' => 'MM',
			'n' => 'M',
			'd' => 'DD',
			'j' => 'D',
			'l' => 'dddd',
			'D' => 'ddd',
			'H' => 'HH',
			'G' => 'H',
			'h' => 'hh',
			'g' => 'h',
			'i' => 'mm',
			's' => 'ss',
			'A' => 'A',
			'a' => 'a',
		);

		return strtr( $date_format, $map );
	}

    /**
     * Validate REST nonce.
     *
     * @param \WP_REST_Request $request Request object.
     * @return true|\WP_Error
     */
    public static function validate_nonce( $request ) {
        $nonce = sanitize_text_field( $request->get_header( 'X-WP-Nonce' ) );

        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                esc_html__( 'Invalid nonce.', 'moowoodle' ),
                array( 'status' => 403 )
            );

            self::log( $error );

            return $error;
        }

        return true;
    }
    /**
     * Handle server exception response.
     *
     * @param \Exception $exception Exception object.
     * @return \WP_Error
     */
    public static function server_error( \Exception $exception ) {

        self::log( $exception );

        return new \WP_Error(
            'server_error',
            esc_html__( 'Unexpected server error.', 'moowoodle' ),
            array(
                'status' => 500,
            )
        );
    }
}
