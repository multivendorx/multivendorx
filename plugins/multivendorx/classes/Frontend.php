<?php

namespace MultiVendorX;

use MultiVendorX\Store\StoreUtil;

/**
 * MultiVendorX Frontend class
 *
 * @class 		Frontend class
 * @version		PRODUCT_VERSION
 * @author 		MultiVendorX
 */
class Frontend {
    /**
     * Frontend class construct function
     */
    public function __construct() {
        add_filter('template_include', array($this, 'vendor_dashboard_template'));

        add_action('woocommerce_after_shop_loop_item', array($this, 'add_text_in_shop_and_single_product_page'), 6);
        add_action('woocommerce_product_meta_start', array($this, 'add_text_in_shop_and_single_product_page'), 25);
        add_action('woocommerce_get_item_data', array($this, 'add_sold_by_text_cart'), 30, 2);
        add_filter('woocommerce_product_tabs', array($this, 'product_vendor_tab'));

        add_filter('woocommerce_related_products', array($this, 'show_related_products'), 99, 3);
        // add_filter('woocommerce_login_redirect', array($this, 'multivendorx_store_login'), 10, 2);
    
    }
    public function show_store_info($product_id) {
        
        $store_details = MultiVendorX()->setting->get_setting( 'store_branding_details', [] );
        if (in_array( 'show_store_name', $store_details )) {
            $store = StoreUtil::get_products_vendor($product_id);
            if (!$store) return;
            $name = $store->get('name');

             $logo_html = '';
            if ( in_array( 'show_store_logo_next_to_products', $store_details ) ) {
                $logo_url  = $store->get( 'image' ) ?: MultiVendorX()->plugin_url . 'assets/images/default-store.jpg';
                $logo_html = '<img src="' . esc_url( $logo_url ) . '" alt="' . esc_attr( $name ) . '" />';
            }

            return [
                'id'  => $store->get_id(),
                'name'  => $name,
                'logo_html'  => $logo_html,
            ];
            
        }
    }

    public function add_text_in_shop_and_single_product_page() {
        global $post;

        if ( apply_filters('mvx_sold_by_text_after_products_shop_page', true, $post->ID)) {
            $details = $this->show_store_info(($post->ID));

            if (!empty($details)) {
                $sold_by_text = apply_filters('mvx_sold_by_text', __('Sold By', 'multivendorx'), $post->ID);
    
                echo '<a class="by-store-name-link" style="display:block;" target="_blank" href="' 
                    . esc_url( MultiVendorX()->store->storeutil->get_store_url( $details['id'] ) ) . '">'
                    . esc_html( $sold_by_text ) . ' ' . $details['logo_html'] . esc_html( $details['name'] ) 
                    . '</a>';
            }
        }
    }

    public function add_sold_by_text_cart( $array, $cart_item ) {
        if ( apply_filters( 'mvx_sold_by_text_in_cart_checkout', true, $cart_item['product_id'] ) ) {

            $product_id    = $cart_item['product_id'];
            $details = $this->show_store_info(($product_id));

            if (!empty($details)) {
                $sold_by_text = apply_filters('mvx_sold_by_text', __('Sold By', 'multivendorx'), $product_id);
                $array[] = array(
                    'name'  => esc_html( $sold_by_text ),
                    'value' => esc_html( $details['name'] ),
                    'display' => $details['logo_html'] . esc_html( $details['name'] ),
                );

            }

        }

        return $array;
    }

    public function product_vendor_tab($tabs) {
        global $product;
        if ($product) {
            $store = StoreUtil::get_products_vendor($product->get_id());
            if ($store) {
                $title = __('Store', 'multivendorx');
                $tabs['store'] = array(
                    'title' => $title,
                    'priority' => 20,
                    'callback' => array($this, 'woocommerce_product_store_tab')
                );
            }
        }
        return $tabs;
    }

    public function woocommerce_product_store_tab() {
        MultiVendorX()->util->get_template( 'store-single-product-tab.php' );
    }

    /**
     * Show related products or not
     *
     * @return array
     */
    public function show_related_products($query, $product_id, $args) {
        if ($product_id) {
            $store = StoreUtil::get_products_vendor($product_id) ?? '';
            $related = MultiVendorX()->setting->get_setting( 'recommendation_source', '');
            if (!empty($related) && 'none' == $related) {
                return array();
            } elseif (!empty($related) && 'all_stores' == $related) {
                return $query;
            } elseif (!empty($related) && 'same_store' == $related && $store && !empty($store->get_id())) {
                $query = get_posts( array(
                    'post_type' => 'product',
                    'post_status' => 'publish',
                    'fields' => 'ids',
                    'exclude'   => $product_id,
                    'meta_query'     => [
                        [
                            'key'     => 'multivendorx_store_id',
                            'value'   => $store->get_id(),
                            'compare' => '=',
                        ],
                    ],
                    'orderby' => 'rand'
                ));
                if ($query) {
                    return $query;
                }
            }
        }
        return $query;
    }


    public function vendor_dashboard_template($template) {
        //checking change later when all function ready
        if (  is_user_logged_in() && is_page() && has_shortcode(get_post()->post_content, 'multivendorx_store_dashboard') ) {
            return MultiVendorX()->plugin_path . 'templates/store-dashboard.php';
        }
        return $template;
    }

    public function multivendorx_store_login() {
        MultiVendorX()->plugin_path . 'templates/store-dashboard.php';
    }

}