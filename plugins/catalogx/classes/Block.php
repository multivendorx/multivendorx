<?php
/**
 * Block class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Block class
 *
 * @class       Block class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Block {
    /**
     * Array of blocks to be registered.
     *
     * @var array
     */
    private $blocks = array();

    /**
     * Constructor for Block class
     *
     * @return void
     */
    public function __construct() {
        // Register block category.
        add_filter( 'block_categories_all', array( $this, 'register_block_category' ) );
        // Register the block.
        add_action( 'init', array( $this, 'register_blocks' ) );
        // Localize the script for block.
        add_action( 'enqueue_block_assets', array( $this, 'enqueue_all_block_assets' ) );
        // Localize in frontend.
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
    }
    /**
     * Get the list of initialized blocks.
     *
     * If the blocks have not been initialized yet, this method calls
     * `initialize_blocks()` to populate them.
     *
     * @return array List of blocks.
     */
    public function get_blocks() {
        if ( empty( $this->blocks ) ) {
            $this->blocks = $this->initialize_blocks();
        }
        return $this->blocks;
    }

    /**
     * Initialize blocks based on active modules.
     *
     * @return array List of blocks with their configuration.
     */
    public function initialize_blocks() {
        $blocks     = array();
        $textdomain = 'catalogx';

        $block_base_path = FrontendScripts::get_asset_path( 'file' ) . 'js/block/';

        $exclude_blocks = apply_filters( 'catalogx_exclude_blocks', array( 'setup-wizard' ) );
        if ( ! is_dir( $block_base_path ) ) {
            return $blocks;
        }

        $block_directories = glob( $block_base_path . '*', GLOB_ONLYDIR );
        foreach ( $block_directories as $block_directory ) {
            $block_name = basename( $block_directory );
            if ( in_array( $block_name, $exclude_blocks, true ) ) {
                continue;
            }

            if ( file_exists( $block_directory . '/block.json' ) ) {
                $blocks[] = array(
                    'name'       => $block_name,
                    'textdomain' => $textdomain,
                    'block_path' => $block_base_path,
                );
            }
        }

        return apply_filters( 'catalogx_initialize_blocks', $blocks );
    }

    /**
     * Enqueue assets and localize scripts for all registered blocks.
     *
     * @return void
     */
    public function enqueue_all_block_assets() {
        if ( is_admin() && function_exists( 'get_current_screen' ) ) {
            $screen = get_current_screen();
            if ( $screen && $screen->is_block_editor ) {
                FrontendScripts::enqueue_frontend_assets();
                FrontendScripts::enqueue_script( 'catalogx-vendor-script' );
                foreach ( $this->get_blocks() as $block_config ) {
                    FrontendScripts::localize_scripts( $block_config['textdomain'] . '-' . $block_config['name'] . '-editor-script' );
                }
            }
        }
    }
	/**
	 * Enqueue frontend scripts for registered blocks.
	 *
	 * Iterates through all registered block scripts and enqueues their
	 * JavaScript files only if the block exists in the current post content.
	 * Also localizes the scripts with necessary data.
	 *
	 * @global WP_Post $post Current post object.
	 *
	 * @return void
	 */
    public function enqueue_scripts() {
        global $post;
        if ( empty( $post ) || ! $post instanceof \WP_Post ) {
            return;
        }
        FrontendScripts::enqueue_frontend_assets();
        FrontendScripts::enqueue_script( 'catalogx-vendor-script' );
        foreach ( $this->get_blocks() as $block_config ) {
            $block_name = $block_config['textdomain'] . '/' . $block_config['name'];

            if ( has_block( $block_name, $post ) ) {
                $handle = $block_config['textdomain'] . '-' . $block_config['name'] . '-view-script';
                // FrontendScripts::enqueue_script( $handle );
                FrontendScripts::localize_scripts( $handle );
            }
        }
    }

    /**
     * Register CatalogX block category in the block editor.
     *
     * @param array $categories Existing block categories.
     * @return array Modified block categories.
     */
    public function register_block_category( $categories ) {
        // Adding a new category.
        $categories[] = array(
            'slug'  => 'catalogx',
            'title' => 'CatalogX',
        );
        return $categories;
    }

    /**
     * Register all defined blocks.
     *
     * @return void
     */
    public function register_blocks() {
        foreach ( $this->get_blocks() as $block_config ) {
            register_block_type( $block_config['block_path'] . $block_config['name'] );
        }
    }
}
