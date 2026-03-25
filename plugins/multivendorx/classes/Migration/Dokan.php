<?php
/**
 * Install class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Migration;

use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Dokan migration class
 *
 * @class       Dokan class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Dokan {
    public function __construct() {
        $this->migrate_vendors();
        $this->migrate_products();
        $this->migrate_orders_and_commissions();
    }

    public function migrate_vendors() {
        $vendors = get_users(
            array(
				'role__in' => array( 'seller' ),
				'fields'   => array( 'ID' ),
            )
        );

        foreach ( $vendors as $user ) {
            $user_id = $user->ID;

            // Change role.
            $wp_user = new \WP_User( $user_id );
            $wp_user->set_role( 'store_owner' );

            // Get all user meta.
            $profile_settings = get_user_meta( $user_id, 'dokan_profile_settings', true );
            $userdata         = get_userdata( $user_id );
            $status           = 'active';

            // Store create.
            $store = new Store();
            $store->set( 'name', get_user_meta( $user_id, 'dokan_store_name', true ) );
            $store->set( 'slug', $userdata->user_nicename );
            $store->set( 'status', $status );
            $store->set( 'who_created', $user_id );
            $store->set( 'description', get_user_meta( $user_id, '_vendor_description', true ) ?? '' );
            $store_id = $store->save();

            // primary owner set and add store-users table.
            StoreUtil::set_primary_owner( $user_id, $store_id );
            update_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['active_store'], $store_id );
            StoreUtil::add_store_users(
                array(
					'store_id' => $store_id,
					'users'    => (array) $user_id,
					'role_id'  => 'store_owner',
				)
            );

            // add meta in store-meta table.
            $store->update_meta( 'primary_email', $user->email );
            $store->update_meta( 'emails', array( $user->email ) );

            if ( ! empty( $profile_settings['address'] ) && is_array( $profile_settings['address'] ) ) {
                $address = $profile_settings['address'];
                if ( ! empty( $address['street_1'] ) ) {
                    $store->update_meta( 'address', $address['street_1'] );
                }

                if ( ! empty( $address['city'] ) ) {
                    $store->update_meta( 'city', $address['city'] );
                }

                if ( ! empty( $address['zip'] ) ) {
                    $store->update_meta( 'zip', $address['zip'] );
                }

                if ( ! empty( $address['country'] ) ) {
                    $store->update_meta( 'country', $address['country'] );
                }

                if ( ! empty( $address['state'] ) ) {
                    $store->update_meta( 'state', $address['state'] );
                }

                $country      = $profile_settings['address']['country'] ?? '';
                $wc_countries = new \WC_Countries();
                $calling_code = $wc_countries->get_country_calling_code( $country );
                $calling_code = ! empty( $calling_code ) ? '+' . $calling_code : '';

                $store->update_meta(
                    'phone',
                    array(
						'country_code' => $calling_code,
						'phone'        => preg_replace( '/[^0-9]/', '', $profile_settings['phone'] ),
                    )
                );
            }

            if ( ! empty( $profile_settings['banner'] ) ) {
                $banner_url = wp_get_attachment_url( $profile_settings['banner'] );
                if ( $banner_url ) {
                    $store->update_meta( 'banner', $banner_url );
                }
            }

            if ( ! empty( $profile_settings['gravatar'] ) ) {
                $logo_url = wp_get_attachment_url( $profile_settings['gravatar'] );
                if ( $logo_url ) {
                    $store->update_meta( 'image', $logo_url );
                }
            }
        }
    }

    public function migrate_products() {
        $products = wc_get_products(
            array(
				'status' => 'any',
				'return' => 'ids',
            )
        );

        foreach ( $products as $product_id ) {
            // Migrate product vendor.
            $author_id = (int) get_post_field( 'post_author', $product_id );
            $user      = get_user_by( 'id', $author_id );

            // Check if user is a vendor and update post meta.
            if ( in_array( 'seller', (array) $user->roles, true ) ) {
                $active_store = get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], $active_store );
            }
        }
    }

    public function migrate_orders_and_commissions() {
        global $wpdb;
        $table      = $wpdb->prefix . 'dokan_orders';
        $table_name = $wpdb->prefix . Utill::TABLES['commission'];

        $dokan_orders = $wpdb->get_results( "SELECT * FROM {$table}" );

        foreach ( $dokan_orders as $row ) {
            $order_id = $row->order_id;
            $order    = wc_get_order( $order_id );
            if ( ! $order ) {
				continue;
            }

            $seller_id = $row->seller_id;
            $store_id  = get_user_meta( $seller_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

            $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $table_name,
                array(
					'order_id'               => $order_id,
                    'store_id'               => $store_id,
                    'customer_id'            => $order->get_customer_id(),
                    'total_order_value'      => $row->order_total,
                    'net_items_cost'         => $row->order_total,
                    'marketplace_commission' => $row->order_total - $row->net_amount,
                    'store_earning'          => $row->net_amount,
                    'store_payable'          => $row->net_amount,
                    'marketplace_payable'    => $row->order_total - $row->net_amount,
                    'currency'               => $order->get_currency(),
                    'status'                 => 'paid',
                ),
                array(
					'%d',
					'%d',
					'%d',
					'%f',
					'%f',
					'%f',
					'%f',
					'%f',
					'%f',
					'%s',
					'%s',
                )
			);

            $insert_id = $wpdb->insert_id;
            $order->update_meta_data( 'multivendorx_store_id', $store_id );
            $order->update_meta_data( 'multivendorx_commission_id', $insert_id );
            $order->update_meta_data( 'multivendorx_commissions_processed', 'yes' );
            $order->delete_meta_data( '_dokan_vendor_id' );
            $order->save();
        }

        $balance_table = $wpdb->prefix . 'dokan_vendor_balance';
        $dokan_vendor_balances = $wpdb->get_results( "SELECT * FROM {$balance_table}" );

        foreach ( $dokan_vendor_balances as $row ) {
            $order_id = $row->trn_id;
            $order    = wc_get_order( $order_id );
            $store_id  = get_user_meta( $row->vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

            if ($row->debit > 0) {
                $entry_type = 'Cr';
                $transaction_type = 'Commission';
                $amount = $row->debit;
            } 
            
            if ($row->credit > 0 && $row->trn_type == 'dokan_withdraw') {
                $entry_type = 'Dr';
                $transaction_type = 'Withdraw';
                $amount = $row->credit;
            } 

            if ($row->credit > 0 && $row->trn_type == 'dokan_refund') {
                $entry_type = 'Dr';
                $transaction_type = 'Refund';
                $amount = $row->credit;
            } 

            $data = array(
                'store_id'         => (int) $store_id,
                'order_id'         => (int) $order_id,
                'commission_id'    => (int) $order->get_meta( 'multivendorx_commission_id', true ),
                'entry_type'       => $entry_type,
                'transaction_type' => $transaction_type,
                'amount'           => (float) $amount,
                'currency'         => $order->get_currency(),
                'payment_method'    =>$order->get_payment_method(),
                'narration'        => $row->perticulars,
                'status'           => 'Completed',
            );

            $format = array( '%d', '%d', '%d', '%s', '%s', '%f', '%s', '%s', '%s', '%s' );

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert( $wpdb->prefix . Utill::TABLES['transaction'], $data, $format );
        }
    }
}
