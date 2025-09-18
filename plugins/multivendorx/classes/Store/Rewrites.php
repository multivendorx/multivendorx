<?php

namespace MultiVendorX\Store;

defined('ABSPATH') || exit;

/**
 * Store Rewrites class
 *
 * @version		2.2.0
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */

class Rewrites {

    public $query_vars = [];
    public $custom_store_url = '';

    /**
     * Hook into the functions
     */
    public function __construct() {
        $this->custom_store_url = 'store';

        add_action( 'init', [ $this, 'register_rule' ] );
        add_filter( 'query_vars', [ $this, 'register_query_var' ] );
        add_filter( 'template_include', [ $this, 'store_template' ], 10 );
        add_filter( 'template_include', [ $this, 'dashboard_template' ], 10 );

        add_action( 'wp', [ $this, 'flash_rewrite_rules' ], 10 );
        add_action( 'pre_get_posts', [ $this, 'store_query_filter' ] );

    }

    public function store_query_filter( $query ) {
        if ( is_admin() || ! $query->is_main_query() ) {
            return;
        }

        $store_slug = get_query_var( 'store' );
        if ( empty( $store_slug ) ) {
            return;
        }

        $store_obj = Store::get_store_by_slug( $store_slug );
        if ( ! $store_obj ) {
            return;
        }

        $store_id = $store_obj->get_id();
        if ( ! $store_id ) {
            return;
        }

        // Force query to load products
        $query->set( 'post_type', 'product' );

        // Add vendor filter
        $meta_query   = $query->get( 'meta_query', [] );
        $meta_query[] = [
            'key'     => 'multivendorx_store_id',
            'value'   => $store_id,
            'compare' => '=',
        ];
        $query->set( 'meta_query', $meta_query );
       
        // Pagination fix
        $paged = max( 1, get_query_var( 'paged' ) );
        $query->set( 'paged', $paged );
        $query->set( 'wc_query', 'product_query' ); // WooCommerce flag


    }

    public function register_rule() {

        $rules = [
            [
                '^' . $this->custom_store_url . '/([^/]+)/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]',
                'top',
            ],
            [
                '^' . $this->custom_store_url . '/([^/]+)/page/([0-9]{1,})/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]&paged=$matches[2]',
                'top',
            ],
            [
                '^dashboard/?$',
                'index.php?pagename=dashboard',
                'top',
            ],
            [
                '^dashboard/([^/]+)/?([^/]*)/?$',
                'index.php?pagename=dashboard&tab=$matches[1]&subtab=$matches[2]',
                'top',
            ],
        ];

        $rules = apply_filters( 'multivendorx_rewrite_rules', $rules, $this );

        foreach ( $rules as $rule ) {
            add_rewrite_rule( $rule[0], $rule[1], $rule[2] );
        }
    }

    public function register_query_var( $vars ) {
        $vars[] = $this->custom_store_url;
        $vars[] = 'tab';
        $vars[] = 'subtab';

        foreach ( $this->query_vars as $var ) {
            $vars[] = $var;
        }

        return apply_filters( 'multivendorx_query_vars', $vars, $this );
    }

    public function store_template( $template ) {
        $store_name = get_query_var( $this->custom_store_url );

        if ( ! empty( $store_name ) ) {
            $store = Store::get_store_by_slug($store_name);

            // if ( get_query_var( 'store_review' ) ) {
            //     return MultiVendorX()->util->get_template( 'store-review.php', [] );
            // }

            if ( $store ) {
                MultiVendorX()->util->get_template( 'store.php', ['store_id' => $store->get_id()] );
                exit;
            }
        }

        return $template;
    }

    public function dashboard_template( $template ) {
        $page     = get_query_var( 'tab' );

        if ( ! empty( $page ) ) {
            return MultiVendorX()->util->get_template( 'store-dashboard.php', [] );
        }

        return $template;
    }
    
    public function flash_rewrite_rules() {
        $this->register_rule();
        flush_rewrite_rules();
    }
}