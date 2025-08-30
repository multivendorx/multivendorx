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
    }

    /**
     * Initialize blocks based on active modules.
     *
     * @return array List of blocks with their configuration.
     */
    public function initialize_blocks() {
        $blocks = array();

        if ( CatalogX()->modules->is_active( 'enquiry' ) ) {
            $blocks[] = array(
                'name'       => 'enquiry-button', // block name.
                'textdomain' => 'catalogx',
                'block_path' => CatalogX()->plugin_path . FrontendScripts::get_build_path_name() . 'js/block/',
            );

            // this path is set for load the translation.
            CatalogX()->block_paths += array(
                'block/enquiry-button' => FrontendScripts::get_build_path_name() . 'js/block/enquiry-button/index.js',
                'block/enquiryForm'    => FrontendScripts::get_build_path_name() . 'js/block/enquiryForm/index.js',
            );
        }

        if ( CatalogX()->modules->is_active( 'quote' ) ) {
            $blocks[] = array(
                'name'       => 'quote-button', // block name.
                'textdomain' => 'catalogx',
                'block_path' => CatalogX()->plugin_path . FrontendScripts::get_build_path_name() . 'js/block/',
            );

            $blocks[] = array(
                'name'       => 'quote-cart', // block name.
                'textdomain' => 'catalogx',
                'block_path' => CatalogX()->plugin_path . FrontendScripts::get_build_path_name() . 'js/block/',
            );

            // this path is set for load the translation.
            CatalogX()->block_paths += array(
                'block/quote-cart'   => FrontendScripts::get_build_path_name() . 'js/block/quote-cart/index.js',
                'block/quote-button' => FrontendScripts::get_build_path_name() . 'js/block/quote-button/index.js',
            );
        }

        return apply_filters( 'catalogx_initialize_blocks', $blocks );
    }

    /**
     * Enqueue assets and localize scripts for all registered blocks.
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
