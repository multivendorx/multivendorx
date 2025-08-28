<?php
/**
 * Block class file.
 *
 * @package Notifima
 */

namespace Notifima;

use Notifima\FrontendScripts;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Block class
 *
 * @class       Block class
 * @version     3.0.0
 * @author      MultiVendorX
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
        // Enqueue the script and style for block editor.
        add_action( 'enqueue_block_assets', array( $this, 'enqueue_all_block_assets' ) );
    }

    /**
     * Initializes the blocks used in the MooWoodle plugin.
     *
     * @return array
     */
    public function initialize_blocks() {
        $blocks = array();

        $blocks[] = array(
            'name'       => 'stock-notification-block', // block name.
            'textdomain' => 'notifima',
            'block_path' => Notifima()->plugin_path . FrontendScripts::get_build_path_name() . 'js/block/',
        );

        Notifima()->block_paths += array(
            'block/stock-notification-block' => FrontendScripts::get_build_path_name() . 'js/block/stock-notification-block/index.js',
        );

        return apply_filters( 'notifima_initialize_blocks', $blocks );
    }

    /**
     * Enqueues all frontend and editor assets for registered blocks.
     *
     * @return void
     */
    public function enqueue_all_block_assets() {
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
        foreach ( $this->blocks as $block ) {
            register_block_type( $block['block_path'] . $block['name'] );
        }
    }
}
