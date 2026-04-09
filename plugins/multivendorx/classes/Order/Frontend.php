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
 * @version     PRODUCT_VERSION
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
        add_filter( 'woocommerce_account_orders_columns', array( $this, 'woocommerce_my_account_my_orders_columns' ), 99 );
        add_action( 'woocommerce_my_account_my_orders_column_multivendorx_suborder', array( $this, 'woocommerce_my_account_my_orders_column_multivendorx_suborder' ), 99 );

        add_filter( 'woocommerce_customer_available_downloads', array( $this, 'woocommerce_customer_available_downloads' ), 99 );
    }

    /**
     * Filter the query arguments used in My Account > Orders.
     *
     * @param array $query Query args.
     */
    public function woocommerce_my_account_my_orders_query( $query ) {
        if ( ! isset( $query['post_parent'] ) ) {
            $query['post_parent'] = 0;
        }
        return $query;
    }

    /**
     * Add suborders column to order list
     *
     * @param  array $columns Order columns.
     * @return array
     */
    public function woocommerce_my_account_my_orders_columns( $columns ) {
        $suborder_column = array(
                'multivendorx_suborder' => __( 'Store orders', 'multivendorx' ),
            );
            $new_columns = [];

            foreach ( $columns as $key => $label ) {
                $new_columns[$key] = $label;
                if ( 'order-actions' === $key ) {
                    $new_columns['multivendorx_suborder'] = $suborder_column['multivendorx_suborder'];
                }
            }

            return $new_columns;
    }

    /**
     * Add suborders to order list
     *
     * @param  object $order Order object.
     * @return void
     */
    public function woocommerce_my_account_my_orders_column_multivendorx_suborder( $order ) {
        $multivendorx_suborders = MultiVendorX()->order->get_suborders( $order->get_id(), array( 'type' => 'shop_order' ) );

        if ( $multivendorx_suborders ) {
            echo '<ul class="multivendorx-store-suborder" style="margin:0;list-style:none;">';
            foreach ( $multivendorx_suborders as $suborder ) {
                $store     = Store::get_store( $suborder->get_meta( Utill::POST_META_SETTINGS['store_id'], true ) );
                $order_uri = esc_url( $suborder->get_view_order_url() );

                printf(
                    // '<li><strong><a href="%s" title="%s">#%s</a></strong> &ndash; <small class="multivendorx-order-for-vendor">%s %s</small></li>',
                    '<li><mark class="%s tips" data-tip="%s">%s</mark> <span class="store-suborder">$70 for 3qty</span> <div class="suborder-buttons"><button class="woocommerce-button button">View</button> <button class="woocommerce-button button">Invoive</button> </div></li>',
                    esc_url( $order_uri ),
                    esc_attr( sanitize_title( $suborder->get_status() ) ),
                    esc_html( $suborder->get_order_number() ),
                    esc_html_x( 'for', 'Order table details', 'multivendorx' ),
                    esc_html( $store->get( 'name' ) )
                );

                do_action( 'mvx_after_suborder_details', $suborder );
            }
            echo '</ul>';
        } else {
            echo '<span class="na">&ndash;</span>';
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
}
