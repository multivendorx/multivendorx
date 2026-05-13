<?php
/**
 * Block class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

use MooWoodle\FrontendScripts;

defined( 'ABSPATH' ) || exit;
/**
 * MooWoodle Block class
 *
 * @class       Block class
 * @version     3.3.0
 * @author      DualCube
 */
class Block {
    /**
     * Array of blocks to be registered.
     *
     * @var array
     */
    private $blocks;

    /**
     * Constructor for Block class
     *
     * @return void
     */
    public function __construct() {
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
        if ( is_null( $this->blocks ) ) {
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
        $textdomain = 'moowoodle';

        $block_base_path = MooWoodle()->plugin_path
            . FrontendScripts::get_build_path_name()
            . 'js/block/';

        if ( ! is_dir( $block_base_path ) ) {
            return $blocks;
        }

        $folders = glob( $block_base_path . '*', GLOB_ONLYDIR );
        foreach ( $folders as $folder ) {
            $block_name = basename( $folder );
            if ( file_exists( $folder . '/block.json' ) ) {
                $blocks[] = array(
                    'name'       => $block_name,
                    'textdomain' => $textdomain,
                    'block_path' => $block_base_path,
                );
            }
        }

        return apply_filters( 'moowoodle_initialize_blocks', $blocks );
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
                FrontendScripts::load_scripts();
                FrontendScripts::enqueue_script( 'moowoodle-vendor-script' );
                foreach ( $this->get_blocks() as $block_script ) {
                    FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-editor-script' );
                    FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-script' );
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
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'moowoodle-vendor-script' );
        foreach ( $this->get_blocks() as $block_script ) {
            $block_name = $block_script['textdomain'] . '/' . $block_script['name'];

            if ( has_block( $block_name, $post ) ) {
                $handle = $block_script['textdomain'] . '-' . $block_script['name'] . '-script';

                FrontendScripts::enqueue_script( $handle );
                FrontendScripts::localize_scripts( $handle );
            }
        }
    }

    /**
     * Register all defined blocks.
     *
     * @return void
     */
    public function register_blocks() {
        foreach ( $this->get_blocks() as $block ) {
            register_block_type( $block['block_path'] . $block['name'] );
        }
    }
}
