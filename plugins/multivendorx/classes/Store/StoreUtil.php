<?php

namespace MultiVendorX\Store;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * Store Util class
 *
 * @version		2.2.0
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */

class StoreUtil {

    public static function get_store() {
        global $wpdb;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table}" ), ARRAY_A );

        return $store ?: [];
    }

    public function get_store_tabs( $store_id ) {
        $tabs = [
            'products'      => [
                'title' => __( 'Products', 'multivendorx' ),
                'url'   => $this->get_store_url( $store_id ),
            ],
            'reviews'       => [
                'title' => __( 'Reviews', 'multivendorx' ),
                'url'   => $this->get_store_review_url( $store_id ),
            ],
        ];

        return apply_filters( 'multivendorx_store_tabs', $tabs, $store_id );
    }


    public function get_store_url( $store_id, $tab = '' ) {
        if ( ! $store_id ) {
            return '';
        }

        $store_data    = new Store( $store_id );
        $store_slug    = $store_data ? $store_data->get('slug') : '';
        $custom_store_url = 'store';

        $path = '/' . $custom_store_url . '/' . $store_slug . '/';
        if ( $tab ) {
            $tab  = untrailingslashit( trim( $tab, " \n\r\t\v\0/\\" ) );
            $path .= $tab;
            $path = trailingslashit( $path );
        }

        return apply_filters( 'multivendorx_get_store_url', home_url( $path ), $custom_store_url, $store_id, $tab );
    }

    public function get_store_review_url($store_id) {
        return $this->get_store_url( $store_id, 'reviews' );
    }


    public static function get_store_capability() {
        $capabilities = [
            'products' => [
                'label' => 'Manage Products',
                'desc'  => 'Set how vendors handle their product listings',
                'capability' =>
                [
                    //'manage_users' => 'Manage Users',
                    'manage_products' => 'Manage Products',
                    'read_products' => 'View Products',
                    'edit_products' => 'Edit Products',
                    'delete_products' => 'Delete Products',
                    'publish_products' => 'Publish Products',
                    'upload_files' => 'Upload Files',
                ],
            ],
            'orders' => [
                'label' => 'Manage Orders',
                'desc'  => 'Set how vendors handle their order listings',
                'capability' =>
                [
                    'read_shop_orders' => 'View Orders',
                    'view_shop_orders' => 'Manage Orders',
                    'edit_shop_orders' => 'Edit Orders',
                    'delete_shop_orders' => 'Delete Orders',
                    'add_shop_orders_note' => 'Add Order Notes',
                ],
            ],
            'coupons' => [
                'label' => 'Coupon Management',
                'desc'  => 'Set how vendors handle their coupons listings',
                'capability' =>
                [
                    'manage_shop_coupons' => 'Manage Coupons',
                    'read_shop_coupons' => 'View Coupons',
                    'edit_shop_coupons' => 'Edit Coupons',
                    'delete_shop_coupons' => 'Delete Coupons',
                ],
            ],
            'analytics' => [
                'label' => 'Analytics & Report',
                'desc'  => 'Set how vendors handle their coupons listings',
                'capability' =>
                [
                    'read_shop_report' => 'View Reports',
                    'edit_shop_report' => 'Edit Sales Data',
                    'export_shop_report' => 'Export Data',
                ],
            ],
            'inventory' => [
                'label' => 'Inventory Management',
                'desc'  => 'Set how vendors handle their coupons listings',
                'capability' =>
                [
                    'read_shop_report' => 'Manage Inventory',
                    'edit_shop_report' => 'Track Stock',
                    'export_shop_report' => 'Set Stock Alerts',
                ],
            ],
            'commission' => [
                'label' => 'Commission & Earning',
                'desc'  => 'Set how vendors handle their coupons listings',
                'capability' =>
                [
                    'read_shop_earning' => 'View Earning',
                    'edit_withdrawl_request' => 'Request Withdrawl',
                    'view_commission_history' => 'Commission History',
                ],
            ]
        ];
        
        return $capabilities;
    }

    public static function get_products_vendor( $product_id ) {
        $vendor_data = false;
        if ( $product_id > 0 ) {
            $vendor = get_post_meta( $product_id, 'multivendorx_store_id', true );
            $vendor_obj = Store::get_store_by_id( $vendor );

            if ( $vendor_obj ) {
                $vendor_data = $vendor_obj;
            }

            if ( ! $vendor_data ) {
                $product_obj = get_post( $product_id );
                if ( is_object( $product_obj ) ) {
                    $author_id = $product_obj->post_author;
                    if ( $author_id ) {
                        $vendor_data = Store::get_store_by_id( $author_id );
                    }
                }
            }
        }
        return $vendor_data;
    }

}
