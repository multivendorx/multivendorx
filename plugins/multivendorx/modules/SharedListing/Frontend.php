<?php

/**
 * Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SharedListing;

use MultiVendorX\Utill;
use MultiVendorX\StoreReview\Util;
use MultiVendorX\FrontendScripts;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Frontend SharedListing controller.
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'pre_get_posts', array( $this, 'filter_duplicate_product' ) );
        add_filter( 'woocommerce_product_tabs', array( $this, 'add_more_offers_tab' ) );

        if ( MultiVendorX()->setting->get_setting( 'more_offers_display_position', 'none' ) == 'above' ) {
            add_action( 'woocommerce_single_product_summary', array( $this, 'spmv_tab_link' ), 60 );
        }

        if ( MultiVendorX()->setting->get_setting( 'more_offers_display_position', 'none' ) == 'after' ) {
            add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'spmv_tab_link' ), 99 );
        }

        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
    }

    public function filter_duplicate_product( $query ) {
        if ( ! $query->is_main_query() || ! ( is_shop() || is_product_category() ) ) {
            return;
        }

        $data = $this->get_excluded_product();

        if ( empty( $data['exclude'] ) ) {
            return;
        }

        $query->set( 'post__not_in', $data['exclude'] );
    }

    public function get_excluded_product() {
        global $wpdb;

        $priority = MultiVendorX()->setting->get_setting( 'spmv_show_order', 'min_price' );

        $mapped_ids = $primary_ids = array();

        $table = $wpdb->prefix . Utill::TABLES['products_map'];

        $maps = $wpdb->get_results( "SELECT product_map FROM {$table}" );

        foreach ( $maps as $map ) {
            $ids = json_decode( $map->product_map, true );

            if ( empty( $ids ) ) {
                continue;
            }

            $mapped_ids = array_merge( $mapped_ids, $ids );

            $selected_id = $this->select_primary_product( $ids, $priority );

            if ( $selected_id ) {
                $primary_ids[] = $selected_id;
            }
        }

        return array(
            'primary' => array_unique( $primary_ids ),
            'exclude' => array_diff( array_unique( $mapped_ids ), $primary_ids ),
        );
    }

    public function select_primary_product( array $ids, string $priority ) {
        $selected_id = null;

        switch ( $priority ) {
            case 'max_price':
                $best = 0;
                foreach ( $ids as $pid ) {
                    $price = (float) get_post_meta( $pid, '_price', true );
                    if ( $price > $best ) {
                        $best        = $price;
                        $selected_id = $pid;
                    }
                }
                break;

            case 'top_rated_store':
                $best = 0;
                foreach ( $ids as $pid ) {
                    $store_id = get_post_meta( $pid, 'multivendorx_store_id', true );
                    $rating   = Util::get_overall_rating( $store_id );

                    if ( $rating > $best ) {
                        $best        = $rating;
                        $selected_id = $pid;
                    }
                }
                break;

            case 'min_price':
            default:
                $best = PHP_FLOAT_MAX;
                foreach ( $ids as $pid ) {
                    $price = (float) get_post_meta( $pid, '_price', true );
                    if ( $price > 0 && $price < $best ) {
                        $best        = $price;
                        $selected_id = $pid;
                    }
                }
                break;
        }

        return $selected_id;
    }

    public function add_more_offers_tab( $tabs ) {
        global $product;

        if ( get_post_meta( $product->get_id(), 'multivendorx_spmv_id', true ) ) {
            $tabs['singleproductmultistore'] = array(
                'title'    => __( 'More Offers', 'multivendorx' ),
                'priority' => 50,
                'callback' => array( $this, 'woocommerce_product_spmv_tab' ),
            );
        }
        return $tabs;
    }

    public function woocommerce_product_spmv_tab() {
        global $product, $wpdb;

        $table = $wpdb->prefix . Utill::TABLES['products_map'];

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT product_map FROM {$table} WHERE JSON_CONTAINS(product_map, %s)",
                json_encode( (int) $product->get_id() )
            )
        );

        $product_ids = array_diff(
            json_decode( $row->product_map, true ),
            array( (int) $product->get_id() )
        );

        if ( count( $product_ids ) <= 1 ) {
			return;
        }

        MultiVendorX()->util->get_template( 'store/spmv-single-product-tab.php', array( 'product_ids' => $product_ids ) );
    }

    public function spmv_tab_link() {
        global $product;

        if ( get_post_meta( $product->get_id(), 'multivendorx_spmv_id', true ) ) {
            echo '<div> <button type="button" class="goto_more_offer_tab button">More Stores</button> </div>';
        }
    }

    /**
     * Load scripts
     *
     * @return void
     */
    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-spmv-frontend-script' );
    }
}
