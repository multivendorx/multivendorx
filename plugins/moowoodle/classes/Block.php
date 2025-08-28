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
     * Holds the configuration for blocks.
     *
     * @var array
     */
    private $blocks;
    /**
     * Block constructor.
     */
    public function __construct() {
        $this->blocks = $this->initialize_blocks();
        // Register the block.
        add_action( 'init', array( $this, 'register_blocks' ) );
        // Localize the script for block.
        add_action( 'enqueue_block_assets', array( $this, 'enqueue_all_block_assets' ) );
    }
    /**
     * Initializes the blocks used in the MooWoodle plugin.
     *
     * @return array
     */
    public function initialize_blocks() {
        $blocks[] = array();
        // this path is set for load the translation.
        MooWoodle()->block_paths += array(
            'my-courses' => FrontendScripts::get_build_path_name() . 'js/block/my-courses/index.js',
        );
        return apply_filters( 'moowoodle_initialize_blocks', $blocks );
    }
    /**
     * Enqueues all frontend and editor assets for registered blocks.
     *
     * @return void
     */
    public function enqueue_all_block_assets() {
        if ( empty( reset( $this->blocks ) ) ) {
            return;
        }
        FrontendScripts::load_scripts();
        foreach ( $this->blocks as $block_script ) {
            FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-editor-script' );
            FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-script' );
        }
    }
    /**
     * Registers all custom blocks defined in the plugin.
     *
     * @return void
     */
    public function register_blocks() {
        if ( empty( reset( $this->blocks ) ) ) {
            return;
        }
        foreach ( $this->blocks as $block ) {
            register_block_type( $block['block_path'] . $block['name'] );
        }
    }
}
