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
 * @version     6.0.0
 * @author      MultiVendorX
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
        $this->blocks = $this->initialize_blocks();
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
     * Initialize blocks based on active modules.
     *
     * @return array List of blocks with their configuration.
     */
    public function initialize_blocks() {
        $blocks      = array();
        $textdomain  = 'catalogx';
        $block_paths = array();

        $block_base_path = CatalogX()->plugin_path
            . FrontendScripts::get_build_path_name()
            . 'js/block/';

        if ( ! is_dir( $block_base_path ) ) {
            return $blocks;
        }

        $folders = glob( $block_base_path . '*', GLOB_ONLYDIR );

        foreach ( $folders as $folder ) {
            $block_name = basename( $folder );

            // Skip blocks based on module activation logic.
            if (
                (
                    in_array( $block_name, array( 'enquiry-button', 'enquiryForm' ), true )
                    && ! CatalogX()->modules->is_active( 'enquiry' )
                ) ||
                (
                    in_array( $block_name, array( 'quote-button', 'quote-cart' ), true )
                    && ! CatalogX()->modules->is_active( 'quote' )
                )
            ) {
                continue;
            }

            if ( file_exists( $folder . '/block.json' ) ) {
                $blocks[] = array(
                    'name'       => $block_name,
                    'textdomain' => $textdomain,
                    'block_path' => $block_base_path,
                );

                // Translation path mapping.
                $block_paths[ 'block/' . $block_name ] =
                    FrontendScripts::get_build_path_name()
                    . 'js/block/'
                    . $block_name
                    . '/index.js';
            }
        }

        // Merge translation paths.
        CatalogX()->block_paths += $block_paths;

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
                FrontendScripts::load_scripts();
                foreach ( $this->blocks as $block_script ) {
                    FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-editor-script' );
                    FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-script' );
                }
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
        foreach ( $this->blocks as $block ) {
            register_block_type( $block['block_path'] . $block['name'] );
        }
    }
}
