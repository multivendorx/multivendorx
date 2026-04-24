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

	/**
     * MooWoodle LOG function.
     *
     * @param string $message message.
     * @return bool
     */
	public static function log( $message ) {
		global $wp_filesystem;

		$message = var_export( $message, true ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_var_export

		// Init filesystem.
		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		// log folder create.
		if ( ! file_exists( MooWoodle()->moowoodle_logs_dir . '/.htaccess' ) ) {
			$result = wp_mkdir_p( MooWoodle()->moowoodle_logs_dir );
			if ( true === $result ) {
				// Create infrastructure to prevent listing contents of the logs directory.
				try {
					$wp_filesystem->put_contents( MooWoodle()->moowoodle_logs_dir . '/.htaccess', 'deny from all' );
					$wp_filesystem->put_contents( MooWoodle()->moowoodle_logs_dir . '/index.html', '' );
				} catch ( Exception $exception ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
					// Creation failed.
				}
			}
			$message = "MooWoodle Log file Created\n";
		}

		// Clear log file.
		if ( filter_input( INPUT_POST, 'clearlog', FILTER_DEFAULT ) !== null ) {
			$message = "MooWoodle Log file Cleared\n";
		}

		// Write Log.
		if ( '' !== $message ) {
			$log_entry        = gmdate( 'd/m/Y H:i:s', time() ) . ': ' . $message;
			$existing_content = $wp_filesystem->get_contents( MooWoodle()->log_file );

			// Append existing content.
			if ( ! empty( $existing_content ) ) {
				$log_entry = "\n" . $log_entry;
			}

			return $wp_filesystem->put_contents( MooWoodle()->log_file, $existing_content . $log_entry );
		}

		return false;
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
		return apply_filters( 'kothay_dabba', false );
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
