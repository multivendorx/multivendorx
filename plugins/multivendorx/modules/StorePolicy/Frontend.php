<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StorePolicy;

use MultiVendorX\FrontendScripts;

/**
 * MultiVendorX Store Policy Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter( 'multivendorx_rewrite_rules', array( $this, 'add_rule_for_policy' ), 10, 2 );
        add_filter( 'multivendorx_query_vars', array( $this, 'add_query_vars_for_policy' ) );
        add_filter( 'multivendorx_store_tabs', array( $this, 'add_store_policy_tab' ), 10, 2 );

        add_filter( 'woocommerce_product_tabs', array( $this, 'product_policy_tab' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );

        // add_filter( 'template_include', [ $this, 'store_policy_template' ] );
    }

    /**
     * Load follow store JS scripts
     */
    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-store-policy-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-store-policy-frontend-script' );
    }

    /**
     * Add rule for policy
     *
     * @param array  $rules rewrite rules.
     * @param object $instance store instance.
     *
     * @return array
     */
    public function add_rule_for_policy( $rules, $instance ) {
        $rules[] = array(
			'^' . $instance->custom_store_url . '/([^/]+)/policy?$',
			'index.php?' . $instance->custom_store_url . '=$matches[1]&store_policy=true',
			'top',
        );
        $rules[] = array(
			'^' . $instance->custom_store_url . '/([^/]+)/policy/page/?([0-9]{1,})/?$',
			'index.php?' . $instance->custom_store_url . '=$matches[1]&paged=$matches[2]&store_policy=true',
			'top',
        );
        return $rules;
    }

    /**
     * Add query vars for policy
     *
     * @param array $vars query vars.
     *
     * @return array
     */
    public function add_query_vars_for_policy( $vars ) {
        $vars[] = 'store_policy';
        return $vars;
    }

    /**
     * Add store policy tab
     *
     * @param array $tabs store tabs.
     * @param int   $store_id store id.
     *
     * @return array
     */
    public function add_store_policy_tab( $tabs, $store_id ) {
        $tabs['policy'] = array(
			'title' => __( 'Policy', 'multivendorx' ),
			'url'   => $this->get_store_policy_url( $store_id ),
		);
        return $tabs;
    }

    /**
     * Get store policy url
     *
     * @param int $store_id store id.
     *
     * @return string
     */
    public function get_store_policy_url( $store_id ) {
        return MultiVendorX()->store->storeutil->get_store_url( $store_id, 'policy' );
    }

    /**
     * Add Polices tab in product page
     *
     * @param array $tabs product tabs.
     *
     * @return array
     */
    public function product_policy_tab( $tabs ) {
        global $product;
        if ( $product ) {
            $policies = Util::get_store_policies( 0, $product->get_id() );
            if ( count( $policies ) > 0 ) {
                $tabs['policies'] = array(
                    'title'    => __( 'Policies', 'multivendorx' ),
                    'priority' => 30,
                    'callback' => array( $this, 'woocommerce_product_policies_tab' ),
                );
            }
        }

        return $tabs;
    }

    /**
     * Add Polices tab html
     *
     * @return void
     */
    public function woocommerce_product_policies_tab() {
        MultiVendorX()->util->get_template( 'store/store-single-product-policy-tab.php' );
    }
}
