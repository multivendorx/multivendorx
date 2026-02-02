<?php
/**
 * MultiVendorX Rewrites class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Rewrites class.
 *
 * @class       Rewrites class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Rewrites {

    /**
     * Custom store URL
     *
     * @var string
     */
    public $custom_store_url = '';
    private $slug = 'multivendorx-store';

    /**
     * Hook into the functions
     */
    public function __construct() {
        $this->custom_store_url = MultiVendorX()->setting->get_setting( 'store_url', 'store' );

        add_action( 'init', array( $this, 'register_rule' ) );
        add_filter( 'query_vars', array( $this, 'register_query_var' ) );
        add_action( 'wp', array( $this, 'flash_rewrite_rules' ), 99 );
        // For PHP template query of products.
        add_action( 'pre_get_posts', array( $this, 'store_query_filter' ) );

        add_filter( 'get_block_templates', [ $this, 'register_block_template' ], 10, 3 );
        add_filter( 'pre_get_block_file_template', [ $this, 'resolve_template_by_id' ], 10, 3 );
        add_filter( 'template_include', [ $this, 'template_loader' ], 10 );
        add_action( 'wp_enqueue_scripts', [ $this, 'register_store_state' ] );

        // Elementor support - Register custom document type
        add_action( 'elementor/documents/register', [ $this, 'register_elementor_document_type' ] );
       
    }

    /**
     * Filter store query
     *
     * @param object $query The main query object.
     */
    public function store_query_filter( $query ) {
        if ( is_admin() || ! $query->is_main_query() ) {
            return;
        }
        
        if ( wp_is_block_theme() ) {
            return;
        }

        $store_slug = get_query_var( $this->custom_store_url );
        if ( empty( $store_slug ) ) {
            return;
        }

        $store_obj = Store::get_store( $store_slug, 'slug' );
        if ( ! $store_obj ) {
            return;
        }

        $store_id = $store_obj->get_id();
        if ( ! $store_id ) {
            return;
        }

        if ( StoreUtil::get_excluded_products( '', $store_id ) ) {
            return;
        }

        // Force query to load products.
        $query->set( 'post_type', 'product' );

        // Add store filter.
        $meta_query   = $query->get( 'meta_query', array() );
        $meta_query[] = array(
            'key'     => Utill::POST_META_SETTINGS['store_id'],
            'value'   => $store_id,
            'compare' => '=',
        );
        $query->set( 'meta_query', $meta_query );

        // Pagination fix.
        $paged = max( 1, get_query_var( 'paged' ) );
        $query->set( 'paged', $paged );
        $query->set( 'wc_query', 'product_query' );
    }

    /**
     * Register custom rewrite rule for stores.
     */
    public function register_rule() {
        $page_id = MultiVendorX()->setting->get_setting( 'store_dashboard_page' );

        $rules = array(
            array(
                '^' . $this->custom_store_url . '/([^/]+)/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]',
                'top',
            ),
            array(
                '^' . $this->custom_store_url . '/([^/]+)/page/([0-9]{1,})/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]&paged=$matches[2]',
                'top',
            ),

            array(
                '^dashboard/([^/]+)/?([^/]*)/?([0-9]*)/?$',
                'index.php?page_id=' . $page_id . '&segment=$matches[1]&element=$matches[2]&context_id=$matches[3]',
                'top',
            ),

        );

        $rules = apply_filters( 'multivendorx_rewrite_rules', $rules, $this );

        add_rewrite_tag( '%segment%', '([^/]+)' );
        foreach ( $rules as $rule ) {
            add_rewrite_rule( $rule[0], $rule[1], $rule[2] );
        }
    }

    /**
     * Register query vars
     *
     * @param array $vars Query vars.
     */
    public function register_query_var( $vars ) {
        $vars[] = $this->custom_store_url;
        $vars[] = 'segment';

        return apply_filters( 'multivendorx_query_vars', $vars, $this );
    }

    private function should_load_template() {
        if ( get_query_var( $this->custom_store_url ) ) return true;
        if ( is_admin() && function_exists( 'get_current_screen' ) ) {
            $screen = get_current_screen();
            if ( $screen && $screen->id === 'site-editor' ) return true;
        }
        return false;
    }
    
    public function register_block_template( $templates, $query, $type ) {
        if ( 'wp_template' !== $type ) return $templates;
        if ( ! $this->should_load_template() && ! is_admin() ) return $templates;
        
        $id = get_stylesheet() . '//' . $this->slug;
        foreach ( $templates as $template ) { 
            if ( $template instanceof \WP_Block_Template && $template->id === $id ) return $templates; 
        }
        
        $templates[] = $this->build_template_object();
        return $templates;
    }
    
    public function resolve_template_by_id( $template, $id, $type ) {
        if ( 'wp_template' !== $type ) return $template;
        if ( $id !== get_stylesheet() . '//' . $this->slug ) return $template;

        return $this->build_template_object();
    }

    private function build_template_object() {
        $saved = get_posts( [
            'post_type'      => 'wp_template',
            'name'           => $this->slug,
            'posts_per_page' => 1,
            'post_status'    => 'publish',
        ] );

        if ( ! empty( $saved ) ) {
            $content = $saved[0]->post_content;
        } else {
            $template_file = MultiVendorX()->plugin_path . 'templates/store/store.html';
            if ( file_exists( $template_file ) ) {
                $content = file_get_contents( $template_file );
            }
        }

        $template = new \WP_Block_Template();
        $template->id = get_stylesheet() . '//' . $this->slug;
        $template->theme = get_stylesheet();
        $template->slug = $this->slug;
        $template->type = 'wp_template';
        $template->title = __( 'MultiVendorX Store', 'multivendorx' );
        $template->source = 'plugin';
        $template->origin = 'plugin';
        $template->status = 'publish';
        $template->content = $content;
        $template->is_custom = true;
        $template->has_theme_file = false;

        return $template;
    }

    public function register_store_state() {
        $store_slug = get_query_var( 'store' );

        if ( ! $store_slug ) {
            return;
        }

        wp_interactivity_state(
            'multivendorx/store',
            [
                'storeName' => 'Store 1',
                'storeDescription' => 'This is the live store description shown on the frontend.',
                'storeSlug' => $store_slug,
                'storeId'   => 1,
            ]
        );
    }

    public function template_loader( $template ) {
        if ( ! get_query_var( $this->custom_store_url ) ) return $template;
        // Block theme support
        if ( wp_is_block_theme() ) {
            return $template;
        }

        // Check for Elementor template first
        if ( did_action( 'elementor/loaded' ) ) {
            $elementor_template_id = $this->get_elementor_template();
            
            if ( $elementor_template_id ) {
                add_filter( 'body_class', function( $classes ) {
                    $classes[] = 'elementor-page';
                    return $classes;
                });
                
                $elementor_canvas = plugin_dir_path( __FILE__ ) . 'templates/elementor-canvas.php';
                if ( file_exists( $elementor_canvas ) ) {
                    return $elementor_canvas;
                }
            }
        }

        $store_name = get_query_var( $this->custom_store_url );

        if ( ! empty( $store_name ) ) {
            $store = Store::get_store( $store_name, 'slug' );
        }

        // Classic theme fallback
        $classic_template = MultiVendorX()->util->get_template( 'store/store.php', array( 'store_id' => $store->get_id() ) );
        if ( file_exists( $classic_template ) ) return $classic_template;

        return $template;
    }

    /**
     * Register custom Elementor document type
     */
    public function register_elementor_document_type( $documents_manager ) {
        require_once plugin_dir_path( __FILE__ ) . 'includes/elementor-store-document.php';
        $documents_manager->register_document_type( 'mvx-store', 'MVX_Store_Document' );
    }

    
    /**
     * Get active Elementor template for store
     */
    private function get_elementor_template() {
        if ( ! did_action( 'elementor/loaded' ) ) {
            return false;
        }
        
        // Find template with our custom document type
        $args = [
            'post_type' => 'elementor_library',
            'posts_per_page' => 1,
            'post_status' => 'publish',
            'meta_query' => [
                [
                    'key' => '_elementor_template_type',
                    'value' => 'mvx-store',
                ]
            ]
        ];
        
        $templates = get_posts( $args );
        return ! empty( $templates ) ? $templates[0]->ID : false;
    }

    /**
     * Flush rewrite rules
     */
    public function flash_rewrite_rules() {
        $this->register_rule();
        flush_rewrite_rules();
    }
}