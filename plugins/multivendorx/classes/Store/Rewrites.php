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
        add_filter( 'template_include', [ $this, 'store_review_template' ], 10 );
        add_filter( 'template_include', [ $this, 'dashboard_template' ], 10 );

        add_action( 'wp', [ $this, 'flash_rewrite_rules' ], 10 );

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
                '^' . $this->custom_store_url . '/([^/]+)/reviews?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]&store_review=true',
                'top',
            ],
            [
                '^' . $this->custom_store_url . '/([^/]+)/reviews/page/?([0-9]{1,})/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]&paged=$matches[2]&store_review=true',
                'top',
            ],
            [
                '^dashboard/?$',
                'index.php?pagename=dashboard',
                'top',
            ],
            [
                '^dashboard/([^/]+)/?([^/]*)/?$',
                'index.php?pagename=dashboard&dashboard_page=$matches[1]&dashboard_subpage=$matches[2]',
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
        $vars[] = 'store_review';
        $vars[] = 'dashboard_page';
        $vars[] = 'dashboard_subpage';

        foreach ( $this->query_vars as $var ) {
            $vars[] = $var;
        }

        return apply_filters( 'multivendorx_query_vars', $vars, $this );
    }

    public function store_template( $template ) {
        $store_name = get_query_var( $this->custom_store_url );

        if ( ! empty( $store_name ) ) {
            $store = Store::get_store_by_slug($store_name);

            if ( $store ) {
                 return MultiVendorX()->util->get_template( 'store.php', ['store_id' => $store->get_id()] );
            }
        }

        return $template;
    }

    public function store_review_template( $template ) {

        if ( get_query_var( 'store_review' ) ) {
            return MultiVendorX()->util->get_template( 'store-review.php', [] );
        }

        return $template;
    }

    public function dashboard_template( $template ) {
        $page     = get_query_var( 'dashboard_page' );

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