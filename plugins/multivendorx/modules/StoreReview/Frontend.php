<?php
/**
 * Frontend class
 *
 * @package multivendorx
 */

namespace MultiVendorX\StoreReview;

use MultiVendorX\FrontendScripts;
use MultiVendorX\Utill;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * MultiVendorX StoreReview Frontend class.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {

    /**
     * Constructor.
     */
    public function __construct() {
        add_filter( 'multivendorx_rewrite_rules', array( $this, 'add_review_rule' ), 10, 2 );
        add_filter( 'multivendorx_query_vars', array( $this, 'add_query_vars' ) );
        add_filter( 'multivendorx_store_tabs', array( $this, 'add_store_tab' ), 10, 2 );

        add_filter( 'multivendorx_register_scripts', array( $this, 'register_script' ) );
        add_filter( 'multivendorx_localize_scripts', array( $this, 'localize_scripts' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
        add_action( 'woocommerce_order_item_meta_end', array( $this, 'multivendorx_add_store_review_button' ), 10, 3 );
    }

    public function register_script( $scripts ) {
        $base_url = MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name();

        $scripts['multivendorx-review-frontend-script'] = array(
            'src'     => $base_url . 'modules/StoreReview/js/' . MULTIVENDORX_PLUGIN_SLUG . '-frontend.min.js',
            'deps'    => array( 'jquery' ),
        );

        return $scripts;
    }

    public function localize_scripts( $scripts ) {

        $scripts['multivendorx-review-frontend-script'] = array(
            'object_name' => 'review',
            'use_ajax'    => true,
            'data'        => array(
                'nonce'      => wp_create_nonce( 'review_ajax_nonce' ),
                'parameters' => MultiVendorX()->setting->get_setting( 'ratings_parameters', array() ),
            ),
        );

        return $scripts;
    }

    /**
     * Enqueue scripts.
     */
    public function enqueue_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-review-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-review-frontend-script' );
    }

    /**
     * Add review rule.
     *
     * @param array  $rules array of rules.
     * @param object $instance MultiVendorX instance.
     * @return array array of rules.
     */
    public function add_review_rule( $rules, $instance ) {
        $rules[] = array(
            '^' . $instance->custom_store_url . '/([^/]+)/reviews?$',
            'index.php?' . $instance->custom_store_url . '=$matches[1]&store_review=true',
            'top',
        );
        return $rules;
    }

    /**
     * Add query vars.
     *
     * @param array $vars array of query vars.
     * @return array array of query vars.
     */
    public function add_query_vars( $vars ) {
        $vars[] = 'store_review';
        return $vars;
    }

    /**
     * Add store tab.
     *
     * @param array $tabs array of tabs.
     * @param int   $store_id store id.
     * @return array array of tabs.
     */
    public function add_store_tab( $tabs, $store_id ) {
        $tabs['reviews'] = array(
            'title' => __( 'Reviews', 'multivendorx' ),
            'url'   => $this->get_store_review_url( $store_id ),
        );
        return $tabs;
    }

    /**
     * Get store review url.
     *
     * @param int $store_id store id.
     * @return string store review url.
     */
    public function get_store_review_url( $store_id ) {
        return MultiVendorX()->store->storeutil->get_store_url( $store_id, 'reviews' );
    }

    /**
     * Add store review button to order item meta.
     *
     * @param int    $item_id order item id.
     * @param object $item order item.
     * @param object $order order object.
     */
    public function multivendorx_add_store_review_button( $item_id, $item, $order ) {
        static $printed_stores = array(); // Track already printed store IDs.

        $product_id = $item->get_product_id();
        if ( ! $product_id ) {
            return;
        }

        // 🔹 Get store ID from product meta
        $store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
        if ( ! $store_id ) {
            return;
        }

        $store_id = absint( $store_id );

        // Avoid showing duplicate buttons for same store.
        if ( in_array( $store_id, $printed_stores, true ) ) {
            return;
        }

        $printed_stores[] = $store_id;

        // Generate review page link.
        $review_url = MultiVendorX()->store->storeutil->get_store_url( $store_id, 'reviews' );

        // Output default WooCommerce button.
        echo '<div class="multivendorx-order-review-link">';
        echo '<a href="' . esc_url( $review_url ) . '" target="_blank" class="button alt">'
            . esc_html__( 'Leave a Review', 'multivendorx' ) .
            '</a>';
        echo '</div>';
    }
}
