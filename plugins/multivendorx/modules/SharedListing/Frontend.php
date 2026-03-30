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

        if ( 'above' === MultiVendorX()->setting->get_setting( 'more_offers_display_position', 'none' ) ) {
            add_action( 'woocommerce_single_product_summary', array( $this, 'spmv_tab_link' ), 60 );
        }

        if ( 'after' === MultiVendorX()->setting->get_setting( 'more_offers_display_position', 'none' ) ) {
            add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'spmv_tab_link' ), 99 );
        }

        add_filter( 'multivendorx_register_scripts', array( $this, 'register_script' ) );

        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
    }
    /**
     * Register frontend scripts for MultiVendorX Shared Listing module.
     *
     * @param array $scripts Existing scripts array.
     * @return array Modified scripts array including shared listing frontend script.
     */
    public function register_script( $scripts ) {
        $base_url = MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name();

        $scripts['multivendorx-sharedlisting-frontend-script'] = array(
            'src'  => $base_url . 'modules/SharedListing/js/' . MULTIVENDORX_PLUGIN_SLUG . '-frontend.min.js',
            'deps' => array( 'jquery' ),
        );

        return $scripts;
    }
    /**
     * Filters duplicate products from the main WooCommerce query.
     *
     * Excludes duplicate products based on mapped primary products.
     *
     * @param WP_Query $query The WooCommerce query object.
     * @return void
     */
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
    /**
     * Get primary and excluded products based on MultiVendorX mapping.
     *
     * @return array {
     *     @type array $primary IDs of primary products.
     *     @type array $exclude IDs of products to exclude.
     * }
     */
    public function get_excluded_product() {
        global $wpdb;

        $priority = MultiVendorX()->setting->get_setting( 'shared_listing_display', 'min_price' );

        $mapped_ids  = array();
        $primary_ids = array();

        $table = $wpdb->prefix . Utill::TABLES['products_map'];
        $limit = apply_filters( 'multivendorx_shared_listing_product_map_query_limit', 100 );
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $query = $wpdb->prepare( "SELECT product_map FROM {$table} LIMIT %d", $limit );
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $maps = $wpdb->get_results( $query );
        foreach ( $maps as $map ) {
            $ids = maybe_unserialize( $map->product_map );

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
    /**
     * Select the primary product ID from a set of product IDs based on priority.
     *
     * @param int[]  $ids Array of product IDs to evaluate.
     * @param string $priority Selection criteria: 'max_price', 'top_rated_store', 'min_price'.
     * @return int|null Selected primary product ID or null if none found.
     */
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

                // Fallback to min price if no rating found
                if ( $best <= 0 ) {
                    $selected_id = $this->get_min_price_product( $ids );
                }
                break;

            case 'min_price':
            default:
                $selected_id = $this->get_min_price_product( $ids );
                break;
        }

        return $selected_id;
    }

    /**
     * Get product with minimum price
     */
    public function get_min_price_product( array $ids ) {
        $best_price  = PHP_FLOAT_MAX;
        $selected_id = null;

        foreach ( $ids as $pid ) {
            $price = (float) get_post_meta( $pid, '_price', true );

            if ( $price > 0 && $price < $best_price ) {
                $best_price  = $price;
                $selected_id = $pid;
            }
        }

        return $selected_id;
    }

    /**
     * Add a "More Offers" tab to the WooCommerce single product tabs.
     *
     * @param array $tabs Existing WooCommerce product tabs.
     * @return array Modified tabs array.
     */
    public function add_more_offers_tab( $tabs ) {
        global $product;

        if ( get_post_meta( $product->get_id(), 'multivendorx_spmv_id', true ) ) {
            $tabs['singleproductmultistore'] = array(
                'title'    => __( 'More Offers', 'multivendorx' ),
                'priority' => 50,
                'callback' => array( $this, 'woocommerce_product_more_offers_tab' ),
            );
        }
        return $tabs;
    }
	/**
	 * Output the content for the "More Offers" WooCommerce product tab.
	 *
	 * @return void
	 */
	public function woocommerce_product_more_offers_tab() {
        global $product, $wpdb;

        $table      = $wpdb->prefix . Utill::TABLES['products_map'];
        $product_id = (int) $product->get_id();

		// Search serialized data.
		$like = '%' . $wpdb->esc_like( 'i:' . $product_id . ';' ) . '%';

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT product_map FROM {$table} WHERE product_map LIKE %s",
                $like
            )
        );
        // phpcs:enable

        if ( ! $row ) {
            return;
        }

        $map_array = maybe_unserialize( $row->product_map );
        if ( ! is_array( $map_array ) ) {
            return;
        }
        $sanitized_ids = array_filter(
            array_map( 'intval', $map_array ),
            function ( $id ) {
                return $id > 0;
            }
        );

        $product_ids = array_diff(
            array_unique( $sanitized_ids ),
            array( $product_id )
        );

        if ( count( $product_ids ) < 1 ) {
            return;
        }

        MultiVendorX()->util->get_template( 'store/shared-listing-single-product-tab.php', array( 'product_ids' => $product_ids ) );
    }

    /**
     * Display the "More Stores" button on the single product page.
     *
     * @return void
     */
    public function spmv_tab_link() {
        global $product;

        if ( get_post_meta( $product->get_id(), 'multivendorx_spmv_id', true ) ) {
			echo '<div> <button type="button" class="goto_more_offer_tab button">' . esc_html__( 'More Stores', 'multivendorx' ) . '</button> </div>';        }
	}

    /**
     * Load scripts
     *
     * @return void
     */
    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-sharedlisting-frontend-script' );
    }
}
