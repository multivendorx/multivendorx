<?php
/**
 * MultiVendorX Rewrites class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;
use MultiVendorX\FrontendScripts;

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
        add_action( 'wp', array( $this, 'flash_rewrite_rules' ), 99 );

        // Make endpoint behave like a page
        add_action( 'pre_get_posts', array( $this, 'make_endpoint_virtual_page' ) );

        // Load correct template
        add_filter( 'template_include', array( $this, 'load_store_template' ) );
        // For PHP template query of products.
        // add_action( 'pre_get_posts', array( $this, 'store_query_filter' ) );
        add_filter( 'body_class', array( $this, 'add_sidebar_class_for_block_template' ), 10 );
        add_action( 'wp_enqueue_scripts', array( $this, 'register_store_state' ) );
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

    // Virtual page
    public function make_endpoint_virtual_page( $query ) {
        if ( ! is_admin() && $query->is_main_query() && get_query_var( $this->custom_store_url ) ) {
            $page = get_page_by_path( 'store' );

            if ( $page ) {
                $query->is_page     = true;
                $query->is_singular = true;
                $query->post_type   = 'page';
                $query->posts       = array( $page );
            }
        }
    }

    // Load template
    public function load_store_template( $template ) {
        $store_name = get_query_var( $this->custom_store_url );

        if ( ! empty( $store_name ) ) {

            $filtered_template = apply_filters( 'multivendorx_store_elementor_template', '' );

            if ( $filtered_template && file_exists( $filtered_template ) ) {
                return $filtered_template;
            }

            // Path to plugin block template
            $plugin_template = MultiVendorX()->plugin_path . 'templates/store/store.html';

            if ( file_exists( $plugin_template ) ) {
                // Use a temporary PHP wrapper to render the block template
                return MultiVendorX()->plugin_path . 'templates/store/store-wrapper.php';
            }

            // Classic PHP fallback
            $store = Store::get_store( $store_name, 'slug' );
            return MultiVendorX()->util->get_template( 'store/store.php', array( 'store_id' => $store->get_id() ) );
        }

        return $template;
    }

    public function register_store_state() {
        $store_slug = get_query_var( $this->custom_store_url );

        if ( ! $store_slug ) {
            return;
        }

        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-store-name-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-description-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-email-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-phone-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-social-icons-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-logo-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-banner-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-policy-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-review-script' );
        FrontendScripts::enqueue_script( 'multivendorx-highlighted-store-products-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-address-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-quick-info-script' );
        FrontendScripts::enqueue_script( 'multivendorx-product-category-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-tabs-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-provider-script' );
        FrontendScripts::enqueue_script( 'multivendorx-store-coupons-script' );
        FrontendScripts::localize_scripts( 'multivendorx-store-provider-script' );
    }

    public function add_sidebar_class_for_block_template( $classes ) {
        $classes  = array_filter(
            $classes,
            function ( $class ) {
				return strpos( $class, 'multivendorx-sidebar-' ) !== 0;
			}
        );
        $position = MultiVendorX()->setting->get_setting( 'store_sidebar', '' );
        if ( ! empty( $position ) ) {
            $classes[] = 'multivendorx-sidebar-' . $position;
        }
        return $classes;
    }

    /**
     * Flush rewrite rules
     */
    public function flash_rewrite_rules() {
        $this->register_rule();
        flush_rewrite_rules();
    }
}
