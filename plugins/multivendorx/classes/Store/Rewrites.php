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

    /**
     * Hook into the functions
     */
    public function __construct() {
        $this->custom_store_url = MultiVendorX()->setting->get_setting( 'store_url', 'store' );

        add_action( 'init', array( $this, 'register_rule' ) );
        add_filter( 'query_vars', array( $this, 'register_query_var' ) );
        add_filter( 'template_include', array( $this, 'store_template' ), 10 );
        add_filter( 'render_block_context', array( $this, 'render_context' ), 10 );
        add_action( 'wp', array( $this, 'flash_rewrite_rules' ), 99 );
        // add_action( 'pre_get_posts', array( $this, 'store_query_filter' ) );
        add_filter( 'get_block_templates', array( $this, 'register_block_template' ), 10, 3 );
        add_filter( 'pre_get_block_file_template', array( $this, 'resolve_template_by_id' ), 10, 3 );
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

    /**
     * Load store template
     *
     * @param string $template Template path.
     * @return string Modified template path.
     */
    public function store_template( $template ) {
        $store_name = get_query_var( $this->custom_store_url );

        if ( empty( $store_name ) ) {
            return $template;
        }

        $store = Store::get_store( $store_name, 'slug' );
        if ( ! $store ) {
            return $template;
        }

        // Block theme → WP renders block template automatically
        if ( wp_is_block_theme() ) {
            return $template;
        }

        return MultiVendorX()->util->get_template( 'store/store.php', array( 'store_id' => $store->get_id() ) );

        // $plugin_template = trailingslashit( MultiVendorX()->plugin_path ) . 'templates/store/multivendorx-store.php';
    }

    function render_context($context) {

        $path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
        $parts = explode('/', $path);

        if ($parts[0] === 'store' && !empty($parts[1])) {
            $context['multivendorx/store_slug'] = $parts[1];
        }

        return $context;
    }

    private function should_load_template() {
        // Check if we're on the store endpoint
        if ( get_query_var( 'store' ) ) {
            return true;
        }
        
        // Check if we're in the site editor
        if ( is_admin() && function_exists( 'get_current_screen' ) ) {
            $screen = get_current_screen();
            if ( $screen && $screen->id === 'site-editor' ) {
                return true;
            }
        }
        
        
        // Check if we're editing this specific template
        if ( isset( $_GET['postType'] ) && $_GET['postType'] === 'wp_template' ) {
            if ( isset( $_GET['postId'] ) && strpos( $_GET['postId'], 'multivendorx-store' ) !== false ) {
                return true;
            }
        }
        
        return false;
    }


    /**
     * Add block template to editor
     */
    public function register_block_template( $templates, $query, $type ) {

        if ( 'wp_template' !== $type ) {
            return $templates;
        }

         if ( ! $this->should_load_template() && ! is_admin() ) {
            return $templates;
        }

        $theme = get_stylesheet();
        $slug = 'multivendorx-store';
        $id    = $theme . '//' . $slug;

        foreach ( $templates as $template ) {
            if ( $template instanceof \WP_Block_Template && $template->id === $id ) {
                return $templates;
            }
        }

        $templates[] = $this->build_template_object();
        return $templates;
    }

    /**
     * Get block template for editor
     */    
    public function resolve_template_by_id( $template, $id, $type ) {

        if ( 'wp_template' !== $type ) {
            return $template;
        }

        // if ( ! get_query_var( 'store' ) ) {
        //     return $template;
        // }

        $slug = 'multivendorx-store';
        $expected_id = get_stylesheet() . '//' . $slug;

        if ( $id !== $expected_id ) {
            return $template;
        }

        return $this->build_template_object();
    }

    public function build_template_object() {
        $slug = 'multivendorx-store';
        $saved = get_posts( [
            'post_type'      => 'wp_template',
            'name'           => $slug,
            'posts_per_page' => 1,
            'post_status'    => 'publish',
        ] );

        if ( ! empty( $saved ) ) {
            $content = $saved[0]->post_content;
        } else {
            $content = file_get_contents(
                MultiVendorX()->plugin_path . 'templates/store/store.html'
            );
        }
        $template = new \WP_Block_Template();
        $template->id      = get_stylesheet() . '//' . $slug;
        $template->theme   = get_stylesheet();
        $template->slug    = $slug;
        $template->type    = 'wp_template';
        $template->title   = __( 'MultiVendorX Store', 'multivendorx' );
        $template->source  = 'plugin';
        $template->origin  = 'plugin';
        $template->status  = 'publish';
        $template->content = $content;    

        return $template;
    }

    /**
     * Flush rewrite rules
     */
    public function flash_rewrite_rules() {
        $this->register_rule();
        flush_rewrite_rules();
    }
}