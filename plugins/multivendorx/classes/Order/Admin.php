<?php

namespace MultiVendorX\Order;

use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Store\Store;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Order Admin class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */

class Admin {
    public function __construct() {
        add_filter('manage_woocommerce_page_wc-orders_columns', array($this, 'shop_order_columns'), 99);
        add_action('manage_woocommerce_page_wc-orders_custom_column', array($this, 'show_shop_order_columns'), 99, 2);
        
        add_filter('woocommerce_order_actions', array($this, 'woocommerce_order_actions'),10,2);
        add_action('woocommerce_order_action_regenerate_order_commissions', array($this, 'regenerate_order_commissions'));
        add_action('woocommerce_order_action_regenerate_suborders', array($this, 'regenerate_suborders'));
    }

    public function shop_order_columns($columns) {

        if ((!isset($_GET['post_status']) || ( isset($_GET['post_status']) && 'trash' != $_GET['post_status'] ))) {
            $suborder = array('multivendorx_suborder' => __('Suborders', 'multivendorx'));
            $title_number_pos = array_search('order_number', array_keys($columns));
            $columns = array_slice($columns, 0, $title_number_pos + 1, true) + $suborder + array_slice($columns, $title_number_pos + 1, count($columns) - 1, true);
        }
        return $columns;
    }

    /**
     * Output custom columns for orders
     *
     * @param  string $column
     */
    public function show_shop_order_columns($column, $post_id) {
        remove_filter( 'woocommerce_orders_table_query_clauses', array($this, 'wc_order_list_filter') );
        switch ($column) {
                case 'multivendorx_suborder' :
                $mvx_suborders = MultiVendorX()->order->get_suborders($post_id);
                if ($mvx_suborders) {
                    echo '<ul class="mvx-order-vendor" style="margin:0px;">';
                    foreach ($mvx_suborders as $suborder) {
                        if($suborder->get_type() == 'shop_order_refund') continue;
                        $vendor = Store::get_store_by_id($suborder->get_meta( 'multivendorx_store_id', true ));
                        $vendor_page_title = ($vendor) ? $vendor->get('name') : __('Deleted vendor', 'multivendorx');
                        $order_uri = apply_filters('mvx_admin_vendor_shop_order_edit_url', esc_url('admin.php?page=wc-orders&action=edit&id=' . $suborder->get_id() . ''), $suborder->get_id());
                        
                        printf('<li><mark class="%s tips" data-tip="%s">%s</mark> <strong><a href="%s">#%s</a></strong> &ndash; <small class="mvx-order-for-vendor">%s %s</small></li>', sanitize_title($suborder->get_status()), $suborder->get_status(), $suborder->get_status(), $order_uri, $suborder->get_order_number(), _x('for', 'Order table details', 'multivendorx'), $vendor_page_title
                        );

                        do_action('mvx_after_suborder_details', $suborder);
                    }
                    echo '<ul>';
                } else {
                    echo '<span class="na">&ndash;</span>';
                }
                break;
        }
    }

    public function woocommerce_order_actions($actions, $order) {
        if ( $order && $order->get_parent_id() )
            $actions['regenerate_order_commissions'] = __('Regenerate order commissions', 'multivendorx');
        if ( $order && !$order->get_parent_id() )
            $actions['regenerate_suborders'] = __('Regenerate suborders', 'multivendorx');
        
        return $actions;
    }

    public function regenerate_order_commissions($order) {
        if ( ! $order->get_parent_id() ) {
            return;
        }

        $commission_id = $order->get_meta( 'multivendorx_commission_id', true) ?? '';

        $commission = CommissionUtil::get_commission_db($commission_id);

        if( $commission->paid_status == 'paid' ) {
            return;
        }
        if (!in_array($order->get_status(), apply_filters( 'mvx_regenerate_order_commissions_statuses', array( 'on-hold', 'pending', 'processing', 'completed' ), $order ))) {
            return;
        }

        $order->delete_meta_data( 'multivendorx_commissions_processed' );

        $regenerate_commission_id = MultiVendorX()->commission->calculate_commission( $order, $commission_id );

        $order->update_meta_data( 'multivendorx_commission_id', $regenerate_commission_id );
        $order->update_meta_data( 'multivendorx_commissions_processed', 'yes' );
        $order->save();
    }

    public function regenerate_suborders($order) {
        MultiVendorX()->order->create_vendor_orders($order);
    }
}