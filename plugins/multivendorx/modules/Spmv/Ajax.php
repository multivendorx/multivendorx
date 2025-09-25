<?php
/**
 * MultiVendorX Ajax class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SPMV;

/**
 * MultiVendorX SPMV Ajax class
 *
 * @class       Ajax class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Ajax {
    public function __construct(){

        add_action('wp_ajax_mvx_auto_search_product', array($this, 'mvx_auto_suggesion_product'));
        add_action('wp_ajax_nopriv_mvx_auto_search_product', array($this, 'mvx_auto_suggesion_product'));

    }

    public function mvx_auto_suggesion_product() {
        global $wpdb;
        check_ajax_referer('search-products', 'security');
        $user = wp_get_current_user();
        $term = wc_clean(empty($term) ? stripslashes(wc_clean($_REQUEST['protitle'])) : $term);
        $is_admin = isset($_REQUEST['is_admin']) ? wc_clean($_REQUEST['is_admin']) : '';

        if (empty($term)) {
            wp_die();
        }

        $data_store = \WC_Data_Store::load('product');
        $ids = $data_store->search_products($term, '', false);

        $include = array();
        foreach ($ids as $id) {
            $product_map_id = get_post_meta($id, '_mvx_spmv_map_id', true);
            if ($product_map_id) {
                $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}mvx_products_map WHERE product_map_id=%d", $product_map_id));
                $product_ids = wp_list_pluck($results, 'product_id');
                if($product_ids){
                    $include[] = min($product_ids);
                }
            } else {
                $include[] = $id;
            }
        }

        if ($include) {
            $ids = array_slice(array_intersect($ids, $include), 0, 10);
        } else {
            $ids = array();
        }
        $product_objects = apply_filters('mvx_auto_suggesion_product_objects', array_map('wc_get_product', $ids), $user);
        $html = '';
        if (count($product_objects) > 0) {
            $html .= "<ul>";
            foreach ($product_objects as $product_object) {
                if ($product_object) {
                    // if ( mvx_is_product_type_avaliable($product_object->get_type())) {
                    //     if ($is_admin == 'false') {
                    //         $html .= "<li><a data-product_id='{$product_object->get_id()}' href='javascript:void(0)'>" . rawurldecode($product_object->get_formatted_name()) . "</a></li>";
                    //     } else {
                    //         $html .= "<li data-element='{$product_object->get_id()}'><a href='" . wp_nonce_url(admin_url('edit.php?post_type=product&action=duplicate_product&singleproductmultiseller=1&post=' . $product_object->get_id()), 'woocommerce-duplicate-product_' . $product_object->get_id()) . "'>" . rawurldecode($product_object->get_formatted_name()) . "</a></li>";
                    //     }
                    // } else
                    if (current_user_can('edit_products')) {
                        $html .= "<li data-element='{$product_object->get_id()}'><a href='" . wp_nonce_url(admin_url('edit.php?post_type=product&action=duplicate_product&singleproductmultiseller=1&post=' . $product_object->get_id()), 'woocommerce-duplicate-product_' . $product_object->get_id()) . "'>" . rawurldecode($product_object->get_formatted_name()) . "</a></li>";
                    }
                }
            }
            $html .= "</ul>";
        } else {
            $html .= "<ul><li class='mvx_no-suggesion'>" . __('No Suggestion found', 'multivendorx') . "</li></ul>";
        }

        wp_send_json(array('html' => $html, 'results_count' => count($product_objects)));
    }

}