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
        $blocks = array();

        $block_names = array(
            'marketplace-stores',
            'marketplace-products',
            'registration-form',
            'store-tabs',
            'contact-info',
            'store-name',
            'store-email',
            'store-address',
            'store-banner',
            'store-engagement-tools',
            'store-logo',
            'store-social-icons',
            'store-phone',
            'store-description',
            'store-review',
            'store-policy',
            'product-category',
            'store-quick-info',
            'marketplace-coupons',
            'store-list',
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
        foreach ( $this->get_blocks() as $block_script ) {
            FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-editor-script' );
            FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-script' );
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
     * Register MultiVendorX block category in the block editor.
     *
     * @param array $categories Existing block categories.
     * @return array Modified block categories.
     */
    public function register_block_category( $categories ) {
        // Adding a new category.
        $categories[] = array(
            'slug'  => 'multivendorx',
            'title' => 'MultiVendorX Store Sidebar',
        );

        $categories[] = array(
            'slug'  => 'multivendorx-store-shop',
            'title' => 'MultiVendorX Store Page Builder',
        );

        $categories[] = array(
            'slug'  => 'multivendorx-shortcodes',
            'title' => 'MultiVendorX Shortcodes',
        );

        return $categories;
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
