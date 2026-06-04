<?php
/**
 * Store Review Admin.
 *
 * Handles registration of Elementor widgets and tags for Store Review module.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreReview;

defined( 'ABSPATH' ) || exit;

/**
 * Admin class for Store Review Elementor integration.
 */
class Admin {

    /**
     * Constructor.
     *
     * Hooks filters to register widgets and dynamic tags for Elementor.
     */
    public function __construct() {

        add_filter( 'multivendorx_elementor_widgets', array( $this, 'add_store_review_widget' ), 10, 1 );
        add_filter( 'multivendorx_elementor_widget_path', array( $this, 'override_store_review_path' ), 10, 2 );
        add_filter( 'multivendorx_elementor_tag_files', array( $this, 'add_follow_store_tags' ), 10, 1 );
        add_filter( 'multivendorx_elementor_tag_class', array( $this, 'override_follow_store_tag_class' ), 10, 3 );
    }

	/**
	 * Add the Store Rating widget to Elementor widgets list.
	 *
	 * @param array $widgets Existing widgets array.
	 * @return array Modified widgets array.
	 */
	public function add_store_review_widget( $widgets ) {
		$widgets['StoreRating'] = 'MultiVendorX\StoreReview\Widgets\StoreRating';
		return $widgets;
	}

    /**
     * Override path for custom Store Rating widget.
     *
     * @param string $path      Original widget file path.
     * @param string $file_name Widget file name.
     * @return string Modified file path.
     */
    public function override_store_review_path( $path, $file_name ) {
        if ( 'StoreRating' === $file_name ) { // Yoda condition removed.
            $path = MultiVendorX()->plugin_path . 'modules/StoreReview/Widgets/' . $file_name . '.php';
        }
        return $path;
    }

    /**
     * Add Follow Store tag files to Elementor.
     *
     * @param array $tag_files Existing tag files.
     * @return array Modified tag files.
     */
    public function add_follow_store_tags( $tag_files ) {
        $follow_tags_path = MultiVendorX()->plugin_path . 'modules/StoreReview/Tags/';

        if ( is_dir( $follow_tags_path ) ) {
            foreach ( glob( $follow_tags_path . '*.php' ) as $file ) {
                $tag_files[] = $file;
            }
        }

        return $tag_files;
    }

    /**
     * Override namespace for Follow Store tag classes.
     *
     * @param string $full_class Default class namespace.
     * @param string $class_name Class name derived from file.
     * @param string $file_path  File path of the tag.
     * @return string Modified class namespace.
     */
    public function override_follow_store_tag_class( $full_class, $class_name, $file_path ) {
        if ( false !== strpos( $file_path, 'StoreRating' ) ) { // Yoda condition applied.
            $full_class = '\\MultiVendorX\\StoreReview\\Tags\\' . $class_name;
        }
        return $full_class;
    }
}
