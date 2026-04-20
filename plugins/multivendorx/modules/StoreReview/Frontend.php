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
 * @version     5.0.0
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
        add_filter( 'multivendorx_store_frontend_localize_scripts', array( $this, 'multivendorx_store_frontend_localize_scripts' ) );
        add_filter( 'multivendorx_stores_details', array( $this, 'multivendorx_stores_details' ), 10, 2 );
        add_filter( 'multivendorx_customer_tab_count', array( $this, 'customer_count' ), 10 );
    }
	/**
	 * Register frontend scripts for the Store Review module.
	 *
	 * Adds the script details to the provided scripts array including
	 * source path and dependencies.
	 *
	 * @param array $scripts Array of existing scripts to register.
	 * @return array Modified array with the Store Review frontend script included.
	 */
    public function register_script( $scripts ) {
        $base_url = MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name();

        $scripts['multivendorx-review-frontend-script'] = array(
            'src'  => $base_url . 'modules/StoreReview/js/' . MULTIVENDORX_PLUGIN_SLUG . '-frontend.min.js',
            'deps' => array( 'jquery' ),
        );

        return $scripts;
    }
	/**
	 * Localize frontend scripts for the Store Review module.
	 *
	 * Provides localized data (e.g., AJAX URLs or settings) to the frontend
	 * JavaScript via the `wp_localize_script` mechanism.
	 *
	 * @param array $scripts Array of registered scripts to localize.
	 * @return array Modified array with localization data for the Store Review script.
	 */
    public function localize_scripts( $scripts ) {

        $scripts['multivendorx-review-frontend-script'] = array(
            'object_name' => 'review',
            'use_ajax'    => true,
            'data'        => array(
                'parameters' => MultiVendorX()->setting->get_setting( 'ratings_parameters', array() ),
            ),
        );

        return $scripts;
    }

    /**
     * Enqueue scripts.
     */
    public function enqueue_scripts() {
        if ( is_product() || Utill::is_store_page()) {
            FrontendScripts::load_scripts();
            FrontendScripts::enqueue_script( 'multivendorx-review-frontend-script' );
            FrontendScripts::localize_scripts( 'multivendorx-review-frontend-script' );
        }
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
    public function multivendorx_add_store_review_button( $item_id, $item, $order ) {// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
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
	/**
	 * Localize store frontend script data.
	 *
	 * Adds necessary data to the frontend block/item for a store, including:
	 * - Login URL with redirect.
	 * - Verified buyer status.
	 * - Review status for the current user.
	 *
	 * @param array $item Store-related data array to be enriched for frontend scripts.
	 * @return array Modified store data array including login URL, review status, and verification info.
	 */
    public function multivendorx_store_frontend_localize_scripts( $item ) {
        $store_id = isset( $item['storeDetails']['storeId'] )
            ? absint( $item['storeDetails']['storeId'] )
            : 0;

        $user_id = ! empty( $item['currentUserId'] )
            ? absint( $item['currentUserId'] )
            : 0;

        $is_logged_in = $user_id > 0;

        $myaccount_url = wc_get_page_permalink( 'myaccount' );

		$item['loginUrl'] = add_query_arg( 'redirect_to', rawurlencode( get_permalink() ), $myaccount_url );

        $storereview = MultiVendorX()->setting->get_setting(
            'is_store_review_verified',
            array()
        );

        $is_verified_buyer_only = reset( $storereview ) ?? false;

        $item['isVerifiedBuyerOnly'] = (bool) $is_verified_buyer_only;

        $item['reviewStatus']    = '';
        $item['isVerifiedBuyer'] = false;
        if ( $is_logged_in && $store_id ) {

            // Get review status.
            $item['reviewStatus'] = Util::get_user_review_status(
                $store_id,
                $user_id
            );
            // If verified-only enabled → check verified buyer.
            if ( $is_verified_buyer_only ) {
                $item['isVerifiedBuyer'] = Util::is_verified_buyer(
                    $store_id,
                    $user_id
                );
            }
        }

        return $item;
    }

    /**
     * Add extra details to store data for REST/API or frontend usage.
     *
     * @param array $store Existing store data.
     * @param int   $store_id   Store ID.
     *
     * @return array Modified store data with additional keys.
     */
    public function multivendorx_stores_details( $store, $store_id ) {
        $store['rating'] = Util::get_overall_rating( $store_id );
        return $store;
    }

    public function customer_count( $total ) {
        $base_args     = array( 'count' => true );
        $pending_args  = array_merge(
            $base_args,
            array(
				'status' => 'pending',
			)
        );
        $pending_count = Util::get_review_information( $pending_args );
        return (int) $total + $pending_count;
    }
}
