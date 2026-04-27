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

        echo '<p>' . esc_html__( 'Browse all products listed by this seller across their stores. Each section below represents a different store they manage.', 'multivendorx' ) . '</p>';

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

        // WooCommerce default products per page
        $posts_per_page = wc_get_default_products_per_row() * wc_get_default_product_rows_per_page();

        foreach ( $stores as $store ) {

            $store_id = isset( $store['id'] ) ? (int) $store['id'] : 0;

            if ( ! $store_id ) {
                continue;
            }

            // Optional: Store title
            if ( ! empty( $store['name'] ) ) {
                echo '<h4>' . sprintf( esc_html__( 'Products from %s', 'multivendorx' ), esc_html( $store['name'] ) ) . '</h4>';
            }

            $args = array(
                'post_type'      => 'product',
                'posts_per_page' => $posts_per_page,
                'post_status'    => 'publish',
                'meta_query'     => array(
                    array(
                        'key'     => Utill::POST_META_SETTINGS['store_id'],
                        'value'   => $store_id,
                        'compare' => '=',
                    ),
                ),
            );

            $args = apply_filters(
                'multivendorx_bp_shop_product_query_args',
                $args,
                $user_id,
                array( $store_id )
            );

            $query = new \WP_Query( $args );

            if ( $query->have_posts() ) {

                woocommerce_product_loop_start();

                while ( $query->have_posts() ) {
                    $query->the_post();

                    do_action( 'woocommerce_shop_loop' );
                    wc_get_template_part( 'content', 'product' );
                }

                woocommerce_product_loop_end();
                echo '</div>';

            } else {
                echo '<p>' . esc_html__( 'No products available in this store yet.', 'multivendorx' ) . '</p>';
            }

            wp_reset_postdata();
        }
    }
}
