<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\CustomerQueries;

use MultiVendorX\FrontendScripts;


/**
 * MultiVendorX Questions & Answers Frontend class
 *
 * @class       Frontend class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter( 'woocommerce_product_tabs', array( $this, 'product_customer_queries_tab' ) );
        add_filter( 'multivendorx_register_scripts', array( $this, 'register_script' ) );
        add_filter( 'multivendorx_localize_scripts', array( $this, 'localize_scripts' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
        add_filter( 'multivendorx_customer_tab_count', array( $this, 'customer_count' ), 10 );
    }
    /**
     * Register the frontend Q&A script for WooCommerce products.
     *
     * @param array $scripts Existing scripts array.
     * @return array Modified scripts array including Q&A script.
     */
    public function register_script( $scripts ) {
        $base_url = MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name();

        $scripts['multivendorx-customer-queries-frontend-script'] = array(
            'src'  => $base_url . 'modules/CustomerQueries/js/' . MULTIVENDORX_PLUGIN_SLUG . '-frontend.min.js',
            'deps' => array( 'jquery' ),
        );

        return $scripts;
    }

    /**
     * Localize the frontend Q&A script.
     *
     * @param array $scripts Scripts array to localize.
     * @return array Localized scripts array.
     */
    public function localize_scripts( $scripts ) {

        $scripts['multivendorx-customer-queries-frontend-script'] = array(
            'object_name' => 'customerQueriesFrontend',
            'use_ajax'    => true,
        );

        return $scripts;
    }

    /**
     * Load scripts
     *
     * @return void
     */
    public function load_scripts() {
        if (is_product()) {
            FrontendScripts::load_scripts();
            FrontendScripts::enqueue_script( 'multivendorx-customer-queries-frontend-script' );
            FrontendScripts::localize_scripts( 'multivendorx-customer-queries-frontend-script' );
        }
    }

    /**
     * Add Question and answer tab
     *
     * @param array $tabs Tabs.
     *
     * @return array
     */
    public function product_customer_queries_tab( $tabs ) {
        global $product;

        $queries_count = 0;

        if ( isset( $product ) && $product instanceof \WC_Product ) {
            $product_id = $product->get_id();

            $queries_count = Util::get_question_information(
                array(
					'product_ids'         => array( $product_id ),
					'question_visibility' => 'public',
					'has_answer'          => true,
					'count'               => true,
                )
            );

            $queries_count = intval( $queries_count );
        }

        $tabs['customer_queries'] = array(
            /* translators: %d: Number of answered questions for this product */
            'title'    => sprintf( __( 'Customer Queries (%d)', 'multivendorx' ), $queries_count ),
            'priority' => 50,
            'callback' => array( $this, 'multivendorx_customer_queries_tab_content' ),
        );

        return $tabs;
    }

    /**
     * Add Question and answer tab html
     *
     * @return void
     */
    public function multivendorx_customer_queries_tab_content() {
        global $product;
        MultiVendorX()->util->get_template( 'store/store-single-product-customer-queries-tab.php', array( 'product_id' => $product->get_id() ) );
    }

    public function customer_count( $total ) {
        $base_args        = array( 'count' => true );
        $unanswered_args  = array_merge(
            $base_args,
            array(
				'no_answer' => true,
			)
        );
        $unanswered_count = (int) Util::get_question_information( $unanswered_args );
        return (int) $total + $unanswered_count;
    }
}
