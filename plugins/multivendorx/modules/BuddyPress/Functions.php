<?php
/**
 * MultiVendorX Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\BuddyPress;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

/**
 * MultiVendorX 
 *
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Functions {

    public function __construct() {
        add_action( 'bp_setup_nav', array( $this, 'bp_add_shop_profile_tab' ), 10 );
    }

    /**
     * Add Shop tab
     */
    public function bp_add_shop_profile_tab() {

        bp_core_new_nav_item( array(
            'name'                => __( 'Shop', 'multivendorx' ),
            'slug'                => 'shop',
            'position'            => 80,
            'screen_function'     => array( $this, 'bp_shop_tab_screen' ),
            'default_subnav_slug' => 'shop',
            'item_css_id'         => 'user-shop'
        ) );
    }

    /**
     * Screen loader
     */
    public function bp_shop_tab_screen() {

        add_action( 'bp_template_content', array( $this, 'bp_shop_tab_content' ) );

        bp_core_load_template(
            apply_filters( 'bp_core_template_plugin', 'members/single/plugins' )
        );
    }

    /**
     * Content renderer
     */
    public function bp_shop_tab_content() {

        echo '<h3>' . esc_html__( 'User Stores Products', 'multivendorx' ) . '</h3>';

        $user_id = bp_displayed_user_id();

        if ( ! $user_id ) {
            echo '<p>' . esc_html__( 'No user found.', 'multivendorx' ) . '</p>';
            return;
        }

        // Get all stores of this user
        $stores = Store::get_store( $user_id, 'user' );

        if ( empty( $stores ) ) {
            echo '<p>' . esc_html__( 'No stores found for this user.', 'multivendorx' ) . '</p>';
            return;
        }

        $store_ids = array_map( function( $store ) {
            return isset( $store['id'] ) ? (int) $store['id'] : 0;
        }, $stores );
        $store_ids = array_filter( $store_ids );

        if ( empty( $store_ids ) ) {
            echo '<p>' . esc_html__( 'No stores found for this user.', 'multivendorx' ) . '</p>';
            return;
        }

        // Query products linked to these stores
        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => -1,
            'post_status'    => 'publish',
            'no_found_rows'  => true,
            'meta_query'     => array(
                array(
                    'key'     => Utill::POST_META_SETTINGS['store_id'],
                    'value'   => $store_ids,
                    'compare' => 'IN',
                ),
            ),
        );

        $args = apply_filters( 'multivendorx_bp_shop_product_query_args', $args, $user_id, $store_ids );

        $query = new \WP_Query( $args );

        if ( ! $query->have_posts() ) {
            do_action( 'woocommerce_no_products_found' );
            wp_reset_postdata();
            return;
        }

        woocommerce_product_loop_start();

        while ( $query->have_posts() ) {
            $query->the_post();

            do_action( 'woocommerce_shop_loop' );
            wc_get_template_part( 'content', 'product' );
        }

        woocommerce_product_loop_end();

        wp_reset_postdata();
    }
}
