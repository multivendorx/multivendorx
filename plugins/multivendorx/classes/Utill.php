<?php
/**
 * Utill class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Utill class
 *
 * @class       Utill class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Utill {

    /**
     * Constent holds table name
     *
     * @var array
     */
    const TABLES = array(
        'commission' => 'multivendorx_commission',
    );

    /**
     * Function to console and debug errors.
     *
     * @param mixed $data The data to log. Can be a string, array, or object.
     */
    public static function log( $data ) {
        if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
            return;
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        WP_Filesystem();

        global $wp_filesystem;

        $log_file = MultiVendorX()->plugin_path . 'log/multivendorx.txt';
        $message  = wp_json_encode( $data, JSON_PRETTY_PRINT ) . "\n---------------------------\n";

        $existing = $wp_filesystem->exists( $log_file ) ? $wp_filesystem->get_contents( $log_file ) : '';
        $wp_filesystem->put_contents( $log_file, $existing . $message, FS_CHMOD_FILE );
    }

    /**
     * Check pro plugin is active or not.
     *
     * @return bool
     */
    public static function is_khali_dabba() {
        // return apply_filters( 'kothay_dabba', false );
        return true;
    }

    /**
     * Get other templates ( e.g. product attributes ) passing attributes and including the file.
     *
     * @access public
     * @param  mixed $template_name template name.
     * @param  array $args          ( default: array() ).
     * @return void
     */
    public static function get_template( $template_name, $args = array() ) {

        // Check if the template exists in the theme.
        $theme_template = get_stylesheet_directory() . '/dc-woocommerce-product-vendor/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template.
        $located = file_exists( $theme_template ) ? $theme_template : MultiVendorX()->plugin_path . 'templates/' . $template_name;

        // Load the template.
        load_template( $located, false, $args );
    }


    /**
     * Utility function add aditional single quote in a string.
     *
     * @param   string $string
     * @return  string
     */
    public static function add_single_quots( $string ) {
        if ( is_string( $string ) ) {
            return "'$string'";
        }
        return $string;
    }
}
