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
        // Localize in frontend.
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
        // Restrict store shop blocks.
        // add_filter( 'allowed_block_types_all', array( $this, 'restrict_block_types' ) );
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
            'store-coupons',
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
            'highlighted-store-products',
            'product-category',
            'store-quick-info',
            'store-sidebar',
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

    public function enqueue_scripts() {
        global $post;
        FrontendScripts::load_scripts();
        foreach ( $this->blocks as $block_script ) {
            $block_name = $block_script['textdomain'] . '/' . $block_script['name'];

            if ( has_block( $block_name, $post ) ) {
                $handle = $block_script['textdomain'] . '-' . $block_script['name'] . '-script';

                FrontendScripts::enqueue_script( $handle );
                FrontendScripts::localize_scripts( $handle );
            }
        }
    }

    public function restrict_block_types() {
        $restricted_category   = 'multivendorx-store-shop';
        $allowed_template_slug = 'multivendorx-store';
        $template_slug         = '';

        $p = filter_input( INPUT_GET, 'p', FILTER_SANITIZE_FULL_SPECIAL_CHARS );

        if ( $p !== '' ) {
            $template_slug = basename( $p );
        }

        $is_allowed_context = ( $template_slug === $allowed_template_slug );

        $registry   = \WP_Block_Type_Registry::get_instance();
        $all_blocks = $registry->get_all_registered();
        $allowed    = array();

        foreach ( $all_blocks as $block_name => $block_type ) {
            $category = $block_type->category ?? '';
            if ( $category === $restricted_category && ! $is_allowed_context ) {
                continue;
            }

            $allowed[] = $block_name;
        }

        return $allowed;
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

        $categories[] = array(
            'slug'  => 'multivendorx-store-shop',
            'title' => 'MultiVendorX Store Shop Blocks',
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
