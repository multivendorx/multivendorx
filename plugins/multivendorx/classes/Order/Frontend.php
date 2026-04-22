<?php
/**
 * MultiVendorX Order Frontend Class.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Order;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Order Frontend class
 *
 * @version     5.0.0
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Constructor
     */
    public function __construct() {
        // customer's order list (my account).
        add_filter( 'woocommerce_my_account_my_orders_query', array( $this, 'woocommerce_my_account_my_orders_query' ), 99 );
        add_filter( 'woocommerce_my_account_my_orders_column_order-number', array( $this, 'add_suborder_tag' ), 99 );
        add_filter( 'woocommerce_customer_available_downloads', array( $this, 'woocommerce_customer_available_downloads' ), 99 );
        add_filter( 'woocommerce_email_enabled_new_order', array( $this, 'disable_new_order_email_conditionally' ), 10, 2 );
    }

    /**
     * Filter the query arguments used in My Account > Orders.
     *
     * @param array $query Query args.
     */
    public function woocommerce_my_account_my_orders_query( $query ) {
        $display_type = MultiVendorX()->setting->get_setting( 'display_customer_order', '' );
        if ( $display_type === 'mainorder' ) {
            $query['meta_query'][] = array(
                'key'     => 'multivendorx_store_id',
                'compare' => 'NOT EXISTS',
            );
        }

        if ( $display_type === 'suborders' ) {
            $query['meta_query'][] = array(
                'key'     => 'multivendorx_store_id',
                'compare' => 'EXISTS',
            );
        }
        return $query;
    }

    public function add_suborder_tag( $order ) {
        echo '<a href="' . esc_url( $order->get_view_order_url() ) . '">#' . esc_html( $order->get_order_number() ) . '</a>';

        if ( $order->get_parent_id() > 0 ) {
            $store_id = $order->get_meta( Utill::POST_META_SETTINGS['store_id'] );

            if ( $store_id ) {
                $store      = new Store( $store_id );
                $store_name = $store->get( 'name' );

                echo ' <span class="suborder-label">'
                    . __( 'Sold by', 'multivendorx' ) . ' '
                    . esc_html( $store_name )
                    . '</span>';
            }
        }
    }

    /**
     * Remove downloads for suborders
     *
     * @param array $downloads Customer downloads.
     * @return array
     */
    public function woocommerce_customer_available_downloads( $downloads ) {
        $parent_downloads = array();
        foreach ( $downloads as $download ) {
            if ( ! wp_get_post_parent_id( $download['order_id'] ) ) {
                $parent_downloads[] = $download;
            }
        }
        return $parent_downloads;
    }

    public function disable_new_order_email_conditionally( $enabled, $order ) {
        if ( ! $order || ! is_a( $order, 'WC_Order' ) ) {
            return $enabled;
        }

        if ( MultiVendorX()->setting->get_setting( 'display_customer_order' ) == 'suborders' ) {
            return false;
        }

        if ( ( $order->get_parent_id() > 0 ) && MultiVendorX()->setting->get_setting( 'display_customer_order' ) == 'mainorder' ) {
            return false;
        }

        return $enabled;
    }
}
