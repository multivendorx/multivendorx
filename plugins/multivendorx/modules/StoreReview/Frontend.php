<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreReview;
use MultiVendorX\FrontendScripts;

/**
 * MultiVendorX Store Review Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter( 'multivendorx_rewrite_rules', array($this, 'add_rule_for_review'), 10, 2);
        add_filter( 'multivendorx_query_vars', array($this, 'add_query_vars_for_policy') );
        add_filter( 'multivendorx_store_tabs', [ $this, 'add_store_policy_tab' ], 10, 2 );        
    
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
    }

    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-review-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-review-frontend-script' );
    }

    public function add_rule_for_review( $rules, $instance ) {
        $rules[] = [
                '^' . $instance->custom_store_url . '/([^/]+)/reviews?$',
                'index.php?' . $instance->custom_store_url . '=$matches[1]&store_review=true',
                'top',
            ];
        $rules[] = [
                '^' . $instance->custom_store_url . '/([^/]+)/reviews/page/?([0-9]{1,})/?$',
                'index.php?' . $instance->custom_store_url . '=$matches[1]&paged=$matches[2]&store_review=true',
                'top',
            ];
        return $rules;

    }

    public function add_query_vars_for_policy( $vars ) {
         $vars[] = 'store_review';
        return $vars;
    }

    public function add_store_policy_tab( $tabs, $store_id ) {
        $tabs['reviews'] = [
                'title' => __( 'Reviews', 'multivendorx' ),
                'url'   => $this->get_store_review_url( $store_id ),
            ];
        return $tabs;
    }

    public function get_store_review_url($store_id) {
        return MultiVendorX()->store->storeutil->get_store_url( $store_id, 'reviews' );
    }

}