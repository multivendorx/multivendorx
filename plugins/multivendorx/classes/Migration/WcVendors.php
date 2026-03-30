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
 * MultiVendorX WC Vendors class
 *
 * @class       WC Vendors class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class WcVendors {
    public function migrate_vendors() {
        $vendors = get_users(
            array(
				'role__in' => array( 'vendor' ),
				'fields'   => array( 'ID' ),
            )
        );
        $created_store_ids = array();

        foreach ( $vendors as $user ) {
            $user_id = $user->ID;

            // Change role.
            $wp_user = new \WP_User( $user_id );
            $wp_user->set_role( 'store_owner' );
            $status           = 'active';

            // Store create.
            $store = new Store();
            $store->set( 'name', get_user_meta( $user_id, 'pv_shop_name', true ) );
            $store->set( 'slug', get_user_meta( $user_id, 'pv_shop_slug', true ) );
            $store->set( 'status', $status );
            $store->set( 'who_created', $user_id );
            $store->set( 'description', get_user_meta( $user_id, 'pv_shop_description', true ) ?? '' );
            $store_id = $store->save();

            $created_store_ids[] = $store_id; 
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

            $address1 = get_user_meta($user_id, '_wcv_store_address1', true);
            $address2 = get_user_meta($user_id, '_wcv_store_address2', true);
            $address = trim($address1 . ' ' . $address2);
            $store->update_meta( 'address', $address );
            $store->update_meta( 'city', get_user_meta($user_id, '_wcv_store_city', true) );
            $store->update_meta( 'zip', get_user_meta($user_id, '_wcv_store_postcode', true) );
            $store->update_meta( 'country', get_user_meta($user_id, '_wcv_store_country', true) );
            $store->update_meta( 'state', get_user_meta($user_id, '_wcv_store_state', true) );

            $country      = get_user_meta($user_id, '_wcv_store_country', true);
            $wc_countries = new \WC_Countries();
            $calling_code = $wc_countries->get_country_calling_code( $country );
            $calling_code = ! empty( $calling_code ) ? '+' . $calling_code : '';

            $store->update_meta(
                'phone',
                array(
                    'country_code' => $calling_code,
                    'phone'        => preg_replace( '/[^0-9]/', '', get_user_meta($user_id, '_wcv_store_phone', true) ),
                )
            );
        }
        return count( $created_store_ids );
    }

    public function migrate_products() {
        $products = wc_get_products(
            array(
				'status' => 'any',
				'return' => 'ids',
            )
        );
        $updated_count = 0;
        foreach ( $products as $product_id ) {
            // Migrate product vendor.
            $author_id = (int) get_post_field( 'post_author', $product_id );
            $user      = get_user_by( 'id', $author_id );

            // Check if user is a vendor and update post meta.
            if ( in_array( 'vendor', (array) $user->roles, true ) ) {
                $active_store = get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], $active_store );
                $updated_count++;
            }
        }
        return $updated_count;
    }

    public function migrate_orders_and_commissions() {
        global $wpdb;
        $wc_orders_table      = $wpdb->prefix . 'pv_commission';
        $table_name = $wpdb->prefix . Utill::TABLES['commission'];

        $wc_orders = $wpdb->get_results( "SELECT * FROM {$wc_orders_table}" );

        foreach ( $wc_orders as $row ) {
            $order_id = $row->order_id;
            $order    = wc_get_order( $order_id );
            if ( ! $order ) {
				continue;
            }
            $store_id  = get_user_meta( $row->vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

            $suborder = wc_create_order([
                'customer_id' => $order->get_customer_id(),
            ]);
            // Set parent order
            $suborder->set_parent_id($order_id);
            $product = wc_get_product($row->product_id);
            $suborder->add_product(
                $product,
                $row->quantity,
            );
            // Copy billing & shipping
            $suborder->set_address($order->get_address('billing'), 'billing');
            $suborder->set_address($order->get_address('shipping'), 'shipping');
            $suborder->set_payment_method($order->get_payment_method());
            // Calculate totals
            $suborder->calculate_totals();
            // Set status
            $suborder->update_status($order->get_status());
            $suborder->set_created_via( Utill::ORDER_META_SETTINGS['multivendorx_store_order'] );
            $suborder->update_meta_data( Utill::POST_META_SETTINGS['store_id'], $store_id );
            $suborder->save();

            $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $table_name,
                array(
					'order_id'               => $suborder->get_id(),
                    'store_id'               => $store_id,
                    'customer_id'            => $suborder->get_customer_id(),
                    'total_order_value'      => $suborder->get_total(),
                    'net_items_cost'         => $suborder->get_total(),
                    'marketplace_commission' => $suborder->get_total() - $row->total_due,
                    'store_earning'          => $row->total_due,
                    'store_payable'          => $row->total_due,
                    'marketplace_payable'    => $suborder->get_total() - $row->total_due,
                    'currency'               => $order->get_currency(),
                    'status'                 => in_array($suborder->get_status(), ['pending', 'on-hold', 'cancelled', 'draft', 'failed']) ? 'unpaid' : 'paid',
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
            $order->save();


            // Transaction
            if ($row->status == 'paid' && in_array($suborder->get_status(), ['processing','completed'])) {
                $entry_type = 'Cr';
                $transaction_type = 'Commission';
                $amount = $row->total_due;
                $status = 'Completed';
            } 
            
            if ($row->status == 'due' && in_array($suborder->get_status(), ['processing','completed'])) {
                $entry_type = 'Cr';
                $transaction_type = 'Commission';
                $amount = $row->total_due;
                $status = 'Upcoming';
            } 

            if ($row->status == 'reversed') {
                $entry_type = 'Dr';
                $transaction_type = 'Withdraw';
                $amount = $row->total_due;
                $status = 'Completed';
            } 

            $data = array(
                'store_id'         => (int) $store_id,
                'order_id'         => (int) $suborder->get_id(),
                'commission_id'    => (int) $insert_id,
                'entry_type'       => $entry_type,
                'transaction_type' => $transaction_type,
                'amount'           => (float) $amount,
                'currency'         => $suborder->get_currency(),
                'payment_method'   => $suborder->get_payment_method(),
                'narration'        => $transaction_type,
                'status'           => $status,
            );

            $format = array( '%d', '%d', '%d', '%s', '%s', '%f', '%s', '%s', '%s', '%s' );

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert( $wpdb->prefix . Utill::TABLES['transaction'], $data, $format );
        }

        $this->deactive_previous_multivendor();
        wp_clear_scheduled_hook('multivendorx_order_migration');
    }

    // Deactive wc vendor multivendor
	public function deactive_previous_multivendor() {
		// WC vendor free deactive
		require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
		if ( is_plugin_active('wc-vendors/class-wc-vendors.php') ) {
	    	deactivate_plugins('wc-vendors/class-wc-vendors.php');    
	    }
	}

}
