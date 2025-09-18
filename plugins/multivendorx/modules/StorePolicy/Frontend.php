<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StorePolicy;
use MultiVendorX\Store\StoreUtil;

/**
 * MultiVendorX Store Policy Frontend class
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
        add_filter( 'multivendorx_rewrite_rules', array($this, 'add_rule_for_policy'), 10, 2);
        add_filter( 'multivendorx_query_vars', array($this, 'add_query_vars_for_policy') );
        add_filter( 'multivendorx_store_tabs', [ $this, 'add_store_policy_tab' ], 10, 2 );

        add_filter('woocommerce_product_tabs', array($this, 'product_policy_tab'));
        
        // add_filter( 'template_include', [ $this, 'store_policy_template' ] );

    }

    public function add_rule_for_policy ( $rules, $instance ) {
        $rules[] = [
                '^' . $instance->custom_store_url . '/([^/]+)/policy?$',
                'index.php?' . $instance->custom_store_url . '=$matches[1]&store_policy=true',
                'top',
        ];
        $rules[] = [
                '^' . $instance->custom_store_url . '/([^/]+)/policy/page/?([0-9]{1,})/?$',
                'index.php?' . $instance->custom_store_url . '=$matches[1]&paged=$matches[2]&store_policy=true',
                'top',
        ];
        return $rules;

    }

    public function add_query_vars_for_policy( $vars ) {
        $vars[] = 'store_policy';
        return $vars;
    }

    public function add_store_policy_tab( $tabs, $store_id ) {
        $tabs['policy'] = [
                'title' => __( 'Policy', 'multivendorx' ),
                'url'   => $this->get_store_policy_url( $store_id ),
            ];
        return $tabs;
    }

    public function get_store_policy_url($store_id) {
        return MultiVendorX()->store->storeutil->get_store_url( $store_id, 'policy' );
    }

    // public function store_policy_template( $template ) {

    //     if ( get_query_var( 'store_policy' ) ) {
    //         return MultiVendorX()->util->get_template( 'store-policy.php', [] );
    //     }

    //     return $template;
    // }

    public function product_policy_tab($tabs) {
        global $product;
        if ($product) {
            $policies = StoreUtil::get_store_product_policies($product->get_id());
            if (count($policies) > 0) {
                $tabs['policies'] = array(
                    'title' => __('Policies', 'multivendorx'),
                    'priority' => 30,
                    'callback' => array($this, 'woocommerce_product_policies_tab')
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
        MultiVendorX()->util->get_template( 'store-single-product-policy-tab.php' );
    }
}