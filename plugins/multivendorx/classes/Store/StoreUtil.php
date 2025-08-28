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
    public static function create_store( $args ) {
        global $wpdb;

        if ( empty( $args ) ) {
            return false;
        }

        // insert data 
        $result = $wpdb->insert( "{$wpdb->prefix}" . Utill::TABLES['store'], $args );
        return $result ? $wpdb->insert_id : false;
    }

    public static function create_store_meta( $args ) {
        global $wpdb;

        if ( empty( $args ) ) {
            return false;
        }

        // insert data 
        $result = $wpdb->insert( "{$wpdb->prefix}" . Utill::TABLES['store_meta'], $args );
        return $result ? $wpdb->insert_id : false;
    }

    public static function update_store( $id, $args ) {
        global $wpdb;
        if ( empty( $id ) || empty( $args ) ) return false;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $result = $wpdb->update( $table, $args, [ 'ID' => $id ] );

        return $result;
    }

    public static function update_store_meta( $id, $args ) {
        global $wpdb;
        if ( empty( $id ) || empty( $args ) ) return false;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];
        $result = $wpdb->update( $table, $args, [ 'store_id' => $id ] );

        return $result;
    }

    public static function get_store_by_id( $id ) {
        global $wpdb;

        if ( empty( $id ) ) return false;

        // Get store basic data
        $store_table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$store_table} WHERE id = %d", $id ),
            ARRAY_A
        );

        if ( ! $store ) {
            return false;
        }

        // Get store meta data
        $store_meta_table = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];
        $meta = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$store_meta_table} WHERE store_id = %d", $id ),
            ARRAY_A
        );
        if ( ! empty( $meta ) ) {
            // Remove ID and store_id if not needed
            unset( $meta['ID'], $meta['store_id'] );
        }

        return array_merge( $store, $meta );
    }

    public static function get_store_by_slug( $slug ) {
        global $wpdb;
        if ( empty( $slug ) ) return false;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE slug = %s", $slug ), ARRAY_A );

        return $store ?: false;
    }

    public static function get_store_by_name( $name ) {
        global $wpdb;
        if ( empty( $name ) ) return false;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $like = '%' . $wpdb->esc_like( $name ) . '%';
        $store = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE name LIKE %s",
                $like
            ),
            ARRAY_A
        );

        return $store ?: [];
    }

    public static function get_store() {
        global $wpdb;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table}" ), ARRAY_A );

        return $store ?: [];
    }

    public function get_store_meta() {

    }


    public static function get_store_tabs( $store_id ) {
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

        $store_data    = $this->get_store_by_id( $store_id );
        $store_slug    = $store_data ? $store_data['slug'] : '';
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
                    'manage_users' => 'Manage Users',
                    'manage_products' => 'Manage Products',
                    'read_products' => 'Read Products',
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
                    'read_shop_orders' => 'Read Orders',
                    'edit_shop_orders' => 'Edit Orders',
                    'delete_shop_orders' => 'Delete Orders',
                ],
            ],
            'coupons' => [
                'label' => 'Manage Coupons',
                'desc'  => 'Set how vendors handle their coupons listings',
                'capability' =>
                [
                    'read_shop_coupons' => 'Read Coupons',
                    'edit_shop_coupons' => 'Edit Coupons',
                    'delete_shop_coupons' => 'Delete Coupons',
                ],
            ]
        ];
        
        return $capabilities;
    }

    public static function get_products_vendor( $product_id ) {
        $vendor_data = false;
        if ( $product_id > 0 ) {
            $vendor = get_post_meta( $product_id, 'multivendorx_store_id', true );
            $vendor_obj = self::get_store_by_id( $vendor );

            if ( $vendor_obj ) {
                $vendor_data = $vendor_obj;
            }

            if ( ! $vendor_data ) {
                $product_obj = get_post( $product_id );
                if ( is_object( $product_obj ) ) {
                    $author_id = $product_obj->post_author;
                    if ( $author_id ) {
                        $vendor_data = self::get_store_by_id( $author_id );
                    }
                }
            }
        }
        return $vendor_data;
    }

}