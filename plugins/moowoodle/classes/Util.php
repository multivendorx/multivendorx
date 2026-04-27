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
     * Constent holds table name
     *
     * @var array
     */
    const TABLES = array(
        'enrollment' => 'mw_enrollment',
        'category'   => 'mw_moodle_categories',
        'course'     => 'mw_courses',
    );

    const MOOWOODLE_OTHER_SETTINGS = array(
        'log_file'               => 'moowoodle_log_file',
    );

    /**
     * Write a formatted log entry for moowoodle.
     *
     * Handles:
     * - Exceptions
     * - WP_Error objects
     * - WordPress DB errors
     * - Normal text messages
     *
     * @param mixed  $message Log message, Exception, or WP_Error.
     * @param string $type    Log type (INFO, ERROR, EXCEPTION, WP_ERROR).
     * @param array  $extra   Additional metadata to include.
     * @return bool           True on success, false on failure.
     */
    public static function log( $message = '', $type = 'INFO', $extra = array() ) {
        global $wp_filesystem, $wpdb;

        // Initialize the WordPress filesystem API.
        if ( empty( $wp_filesystem ) ) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            WP_Filesystem();
        }

        // Create the logs directory and protect it with .htaccess.
        if ( ! file_exists( MooWoodle()->moowoodle_logs_dir . '/.htaccess' ) ) {
            wp_mkdir_p( MooWoodle()->moowoodle_logs_dir );
            try {
                $wp_filesystem->put_contents(
                    MooWoodle()->moowoodle_logs_dir . '/.htaccess',
                    'deny from all'
                );
                $wp_filesystem->put_contents(
                    MooWoodle()->moowoodle_logs_dir . '/index.html',
                    ''
                );
            } catch ( Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                // Directory creation failed but logging should continue.
            }
        }

        // Convert Exception into structured metadata.
        if ( $message instanceof \Exception ) {
            $type             = 'EXCEPTION';
            $extra['Message'] = $message->getMessage();
            $extra['Code']    = $message->getCode();
            $extra['File']    = $message->getFile();
            $extra['Line']    = $message->getLine();
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
            $extra['Stack'] = $message->getTraceAsString();
            $message        = 'Exception occurred';
        }
        // Convert Throwable into structured metadata.
        if ( $message instanceof \Throwable ) {
            $type             = 'EXCEPTION';
            $extra['Message'] = $message->getMessage();
            $extra['Code']    = $message->getCode();
            $extra['File']    = $message->getFile();
            $extra['Line']    = $message->getLine();
            $extra['Stack']   = $message->getTraceAsString();
            $message          = 'Throwable occurred';
        }

        // Convert WP_Error into structured metadata.
        if ( $message instanceof \WP_Error ) {
            $type             = 'WP_ERROR';
            $extra['Code']    = $message->get_error_code();
            $extra['Message'] = $message->get_error_message();
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
            $extra['Data'] = $message->get_error_data();
            $message       = 'WP_Error occurred';
        }

        // Automatically capture database errors.
        if ( isset( $wpdb ) && ! empty( $wpdb->last_error ) ) {
            $extra['DB Error']   = $wpdb->last_error;
            $extra['Last Query'] = $wpdb->last_query;
        }

        // Automatic metadata.
        $meta = array_merge(
            array(
                'Type'      => $type,
                'Timestamp' => current_time( 'mysql' ),
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
                'File'      => debug_backtrace()[1]['file'] ?? '',
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
                'Line'      => debug_backtrace()[1]['line'] ?? '',
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack'     => wp_debug_backtrace_summary(),
            ),
            $extra
        );

        $timestamp = $meta['Timestamp'];
        $log_lines = array();

        foreach ( $meta as $key => $val ) {
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
            $val         = trim( print_r( $val, true ) );
            $log_lines[] = "{$timestamp} : {$key}: {$val}";
        }

        // Add the main message.
        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
        $log_lines[] = "{$timestamp} : Message: " . trim( print_r( $message, true ) );

        // Build final entry block.
        $log_entry = implode( "\n", $log_lines ) . "\n";

        $existing = $wp_filesystem->get_contents( MooWoodle()->log_file );
        if ( ! empty( $existing ) ) {
            $log_entry = "\n" . $log_entry; // Add spacing.
        }

        return $wp_filesystem->put_contents(
            MooWoodle()->log_file,
            $existing . $log_entry
        );
    }

	/**
     * Get other templates ( e.g. product attributes ) passing attributes and including the file.
     *
     * @access public
     * @param mixed $template_name template name.
     * @param array $args default: array().
     * @return void
     */
    public static function get_template( $template_name, $args = array() ) {
        // Check if the template exists in the theme.
        $theme_template = get_stylesheet_directory() . '/moowoodle/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template.
        $located = file_exists( $theme_template ) ? $theme_template : MooWoodle()->plugin_path . 'templates/' . $template_name;

        // Load the template.
        load_template( $located, false, $args );
    }

	/**
	 * Check is MooWoodle Pro is active or not.
     *
	 * @return bool
	 */
	public static function is_khali_dabba() {
		// return apply_filters( 'kothay_dabba', false );
		return true;
	}

	/**
	 * Set moowoodle sync status.
     *
	 * @param mixed $status status.
	 * @param mixed $key key.
	 * @return void
	 */
	public static function set_sync_status( $status, $key ) {
		$status_history   = get_transient( 'moowoodle_sync_status_' . $key );
		$status_history   = is_array( $status_history ) ? $status_history : array();
		$status_history[] = $status;

		set_transient( 'moowoodle_sync_status_' . $key, $status_history, 3600 );
	}

	/**
	 * Get moowoodle sync status.
     *
	 * @param mixed $key key.
	 * @return mixed
	 */
	public static function get_sync_status( $key ) {
		$status = get_transient( 'moowoodle_sync_status_' . $key );
		return $status ? $status : array();
	}

	/**
	 * Increment sync count.
     *
	 * @param mixed $key key.
	 * @return void
	 */
	public static function increment_sync_count( $key ) {
		$sync_status    = get_transient( 'moowoodle_sync_status_' . $key );
		$current_action = count( $sync_status ) - 1;

		// Update the current action count.
		++$sync_status[ $current_action ]['current'];

		set_transient( 'moowoodle_sync_status_' . $key, $sync_status, 3600 );
	}

	/**
	 * Flush the sync status history.
     *
	 * @param mixed $key key.
	 * @return void
	 */
	public static function flush_sync_status( $key ) {
		set_transient( 'moowoodle_sync_status_' . $key, array() );
	}
}
