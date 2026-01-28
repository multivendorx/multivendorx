<?php
/**
 * Block class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Block class
 *
 * @class       Block class
 * @version     PRODUCT_VERSION
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
    
        $block_names = array(
            'marketplace-stores',
            'marketplace-products',
            'marketplace-coupons',
            'registration-form',
            'store-coupons',
            'store-products',
            'stores',
            'contact-info',
            'store-name',
            'store-description',
        );
    
        $textdomain = 'multivendorx';
        $block_path = MultiVendorX()->plugin_path
            . FrontendScripts::get_build_path_name()
            . 'js/block/';
    
        foreach ( $block_names as $block_name ) {
            $blocks[] = array(
                'name'       => $block_name,
                'textdomain' => $textdomain,
                'block_path' => $block_path,
            );
        }
    
        return apply_filters( 'multivendorx_initialize_blocks', $blocks );
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
     * Register MultiVendorX block category in the block editor.
     *
     * @param array $categories Existing block categories.
     * @return array Modified block categories.
     */
    public function register_block_category( $categories ) {
        // Adding a new category.
        $categories[] = array(
            'slug'  => 'multivendorx',
            'title' => 'MultiVendorX',
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
