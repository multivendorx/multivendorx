<?php
/**
 * MultiVendorX Admin class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SPMV;
use MultiVendorX\FrontendScripts;

/**
 * MultiVendorX SPMV Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Admin {

    public function __construct() {
        add_action('admin_enqueue_scripts', array($this, 'mvx_kill_auto_save'));


        add_filter('woocommerce_duplicate_product_exclude_meta', array($this, 'exclude_postmeta_copy_to_draft'), 10, 1);
        add_action('woocommerce_product_duplicate', array($this, 'mvx_product_duplicate_update_meta'), 10, 2);
        add_action('save_post_product', array($this, 'update_duplicate_product_title'), 10, 3);
        // add_filter('woocommerce_product_tabs', array(&$this, 'product_single_product_multivendor_tab'));
        // add_action('woocommerce_single_product_summary', array($this, 'product_single_product_multivendor_tab_link'), 60);
        add_filter( 'wp_insert_post_data', array( $this, 'override_wc_product_post_parent' ), 99, 2 );
    }

    public function mvx_kill_auto_save() {
        if ('product' == get_post_type()) {
            wp_dequeue_script('autosave');
        }

        FrontendScripts::admin_load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-admin-product-auto-search-script' );
        FrontendScripts::localize_scripts( 'multivendorx-admin-product-auto-search-script' );
    }

    public function exclude_postmeta_copy_to_draft($arr = array()) {
        $exclude_arr = array('_sku', '_sale_price', '_sale_price_dates_from', '_sale_price_dates_to', '_sold_individually', '_backorders', '_upsell_ids', '_crosssell_ids', 'multivendorx_store_id', 'multivendorx_product_fixed_commission', 'multivendorx_product_percentage_commission');
        $final_arr = array_merge($arr, $exclude_arr);
        return $final_arr;
    }

    public function mvx_product_duplicate_update_meta($duplicate, $product) {
        // global $MVX;
        $singleproductmultiseller = isset($_REQUEST['singleproductmultiseller']) ? absint($_REQUEST['singleproductmultiseller']) : '';
        if ($singleproductmultiseller == 1) {
            $has_mvx_spmv_map_id = get_post_meta($product->get_id(), '_mvx_spmv_map_id', true);
            if($has_mvx_spmv_map_id){
                $data = array('product_id' => $duplicate->get_id(), 'product_map_id' => $has_mvx_spmv_map_id);
                update_post_meta($duplicate->get_id(), '_mvx_spmv_map_id', $has_mvx_spmv_map_id);
                mvx_spmv_products_map($data, 'insert');
            }else{
                $data = array('product_id' => $duplicate->get_id());
                $map_id = mvx_spmv_products_map($data, 'insert');
                if($map_id){
                    update_post_meta($duplicate->get_id(), '_mvx_spmv_map_id', $map_id);
                    // Enroll in SPMV parent product too 
                    $data = array('product_id' => $product->get_id(), 'product_map_id' => $map_id);
                    mvx_spmv_products_map($data, 'insert');
                    update_post_meta($product->get_id(), '_mvx_spmv_map_id', $map_id);
                    update_post_meta($product->get_id(), '_mvx_spmv_product', true);
                }
            }
            update_post_meta($duplicate->get_id(), '_mvx_spmv_product', true);

            $duplicate->save();
        }
        // Update GTIN if available
        // $gtin_data = wp_get_post_terms($product->get_id(), $MVX->taxonomy->mvx_gtin_taxonomy);
        // if ($gtin_data) {
        //     $gtin_type = isset($gtin_data[0]->term_id) ? $gtin_data[0]->term_id : '';
        //     wp_set_object_terms($duplicate->get_id(), $gtin_type, $MVX->taxonomy->mvx_gtin_taxonomy, true);
        // }
        // $gtin_code = get_post_meta($product->get_id(), '_mvx_gtin_code', true);
        // if ($gtin_code)
        //     update_post_meta($duplicate->get_id(), '_mvx_gtin_code', $gtin_code);
    }

    public function update_duplicate_product_title($post_ID, $post, $update) {
        global $wpdb;
        $is_spmv_pro = get_post_meta($post_ID, '_mvx_spmv_product', true);
        if ($is_spmv_pro) {
            $post = get_post(absint($post_ID));
            if($post){
                $title = str_replace(" (Copy)","",$post->post_title);
                $wpdb->update($wpdb->posts, array('post_title' => $title), array('ID' => $post_ID));
            }
        }
    }

    public function override_wc_product_post_parent( $data, $postarr ){
        if ( 'product' === $data['post_type'] && isset( $_POST['product-type'] ) ) { 
            $product_type = wc_clean( wp_unslash( $_POST['product-type'] ) ); 
            switch ( $product_type ) {
                case 'variable':
                    $data['post_parent'] = $postarr['post_parent'];
                    break;
            }
        }
        return $data;
    }

    // function product_single_product_multivendor_tab($tabs) {
    //     global $product, $MVX;
    //     $title = apply_filters('mvx_more_vendors_tab', __('More Offers', 'multivendorx'));
    //     $tabs['singleproductmultivendor'] = array(
    //         'title' => $title,
    //         'priority' => 80,
    //         'callback' => array($this, 'product_single_product_multivendor_tab_template')
    //     );

    //     return $tabs;
    // }

    /**
     * Add vendor tab html
     *
     * @return void
     */
    // function product_single_product_multivendor_tab_template() {
    //     global $woocommerce, $MVX, $post, $wpdb;
    //     $more_product_array = array();
    //     $results = array();
    //     $more_products = apply_filters('mvx_single_product_multiple_vendor_products_array', $this->get_multiple_vendors_array_for_single_product($post->ID), $post->ID);
    //     $more_product_array = $more_products['more_product_array'];
    //     $results = $more_products['results'];
    //     $MVX->template->get_template('single-product/multiple-vendors-products.php', array('results' => $results, 'more_product_array' => $more_product_array));
    // }
}