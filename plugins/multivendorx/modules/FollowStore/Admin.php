<?php
/**
 * Admin class for Follow Store module.
 *
 * Registers Elementor widgets and tags for Follow Store functionality.
 *
 * @package MultiVendorX\FollowStore
 */

namespace MultiVendorX\FollowStore;

defined( 'ABSPATH' ) || exit;

/**
 * Admin class.
 *
 * Handles Elementor widget registration and tag overrides for Follow Store.
 */
class Admin {

    /**
     * Constructor.
     *
     * Hooks all necessary filters for Elementor widget and tag registration.
     */
    public function __construct() {

        add_filter( 'multivendorx_elementor_widgets', array( $this, 'add_follow_store_widget' ), 10, 1 );
        add_filter( 'multivendorx_elementor_widget_path', array( $this, 'override_follow_store_path' ), 10, 2 );
        add_filter( 'multivendorx_elementor_tag_files', array( $this, 'add_follow_store_tags' ), 10, 1 );
        add_filter( 'multivendorx_elementor_tag_class', array( $this, 'override_follow_store_tag_class' ), 10, 3 );
    }

    /**
     * Add Follow Store Elementor widget.
     *
     * @param array $widgets Existing Elementor widgets.
     * @return array Modified Elementor widgets.
     */
    public function add_follow_store_widget( $widgets ) {
        $widgets['StoreFollow'] = 'MultiVendorX\FollowStore\Widgets\StoreFollow';
        return $widgets;
    }

    /**
     * Override path for Follow Store Elementor widget.
     *
     * @param string $path Existing widget file path.
     * @param string $file Widget name.
     * @return string Modified widget file path.
     */
    public function override_follow_store_path( $path, $file ) {
        if ( 'StoreFollow' === $file ) {
            $path = MultiVendorX()->plugin_path . 'modules/FollowStore/Widgets/' . $file . '.php';
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
        $follow_tags_path = MultiVendorX()->plugin_path . 'modules/FollowStore/Tags/';

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
     * @param string $full_class  Default class namespace.
     * @param string $class_name  Class name derived from file.
     * @param string $file        File path of the tag.
     * @return string Modified class namespace.
     */
    public function override_follow_store_tag_class( $full_class, $class_name, $file ) {
        if ( strpos( $file, 'StoreFollow' ) !== false ) {
            $full_class = '\\MultiVendorX\\FollowStore\\Tags\\' . $class_name;
        }
        return $full_class;
    }
}
