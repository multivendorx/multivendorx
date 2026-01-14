<?php
namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * Block Pattern Loader
 *
 * Dynamically registers all block patterns from classes/patterns directory.
 *
 * @package MultiVendorX
 */
class Pattern {

    /**
     * Constructor
     */
    public function __construct() {

        add_action( 'init', array( $this, 'register_category' ) );
        add_action( 'init', array( $this, 'register_patterns' ), 9 );
    }

    /**
     * Register MultiVendorX block pattern category
     *
     * @return void
     */
    public function register_category() {

        if ( ! function_exists( 'register_block_pattern_category' ) ) {
            return;
        }

        register_block_pattern_category(
            'multivendorx',
            array(
                'label' => __( 'MultiVendorX', 'multivendorx' ),
            )
        );
    }

    /**
     * Dynamically register all patterns from classes/patterns directory
     *
     * @return void
     */
    public function register_patterns() {

        if ( ! function_exists( 'register_block_pattern' ) ) {
            return;
        }

        // IMPORTANT: filesystem path, not URL
        $pattern_dir = trailingslashit( MultiVendorX()->plugin_path ) . 'classes/Patterns/';

        if ( ! is_dir( $pattern_dir ) ) {
            return;
        }

        foreach ( glob( $pattern_dir . '*.php' ) as $file ) {

            $pattern = include $file;

            if ( ! is_array( $pattern ) ) {
                continue;
            }

            if ( empty( $pattern['name'] ) || empty( $pattern['content'] ) ) {
                continue;
            }

            register_block_pattern(
                'multivendorx/' . sanitize_key( $pattern['name'] ),
                array(
                    'title'       => $pattern['title'] ?? '',
                    'description' => $pattern['description'] ?? '',
                    'categories'  => $pattern['categories'] ?? array( 'multivendorx' ),
                    'keywords'    => $pattern['keywords'] ?? array(),
                    'content'     => $pattern['content'],
                )
            );
        }
    }
}
