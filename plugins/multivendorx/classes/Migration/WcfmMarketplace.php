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
 * MultiVendorX WCFM migration class
 *
 * @class       WCFM class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class WcfmMarketplace {

    public function migrate_vendors() {
        $vendors           = get_users(
            array(
				'role__in' => array( 'wcfm_vendor' ),
				'fields'   => array( 'ID' ),
            )
        );
        $created_store_ids = array();

        foreach ( $vendors as $user ) {
            $user_id = $user->ID;

            // Change role.
            $wp_user = new \WP_User( $user_id );
            $wp_user->set_role( 'store_owner' );

            // Get all user meta.
            $profile_settings = get_user_meta( $user_id, 'wcfmmp_profile_settings', true );
            $status           = 'active';

            // Store create.
            $store = new Store();
            $store->set( 'name', $profile_settings['store_name'] );
            $store->set( 'slug', $profile_settings['store_slug'] );
            $store->set( 'status', $status );
            $store->set( 'who_created', $user_id );
            $store->set( 'description', get_user_meta( $user_id, '_store_description', true ) ?? '' );
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
            $store->update_meta( 'store_email', array(
                'list'    => array( $profile_settings['store_email'] ),
                'primary' => $profile_settings['store_email'],
            ) );
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
        return count( $created_store_ids );
    }

    public function migrate_products() {
        $products      = wc_get_products(
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
            if ( in_array( 'wcfm_vendor', (array) $user->roles, true ) ) {
                $active_store = get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], $active_store );
                ++$updated_count;
            }
        }
        return $updated_count;
    }

    public function migrate_orders_and_commissions() {
        global $wpdb;
        $wcfm_orders_table = $wpdb->prefix . 'wcfm_marketplace_orders';
        $table_name        = $wpdb->prefix . Utill::TABLES['commission'];

        $wcfm_orders = $wpdb->get_results( "SELECT * FROM {$wcfm_orders_table}" );

        foreach ( $wcfm_orders as $row ) {
            $order_id = $row->order_id;
            $order    = wc_get_order( $order_id );
            if ( ! $order ) {
				continue;
            }
            $store_id = get_user_meta( $row->vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

            $suborder = wc_create_order(
                array(
					'customer_id' => $order->get_customer_id(),
                )
            );
            // Set parent order
            $suborder->set_parent_id( $order_id );
            $product = wc_get_product( $row->product_id );
            $suborder->add_product(
                $product,
                $row->quantity,
                array(
                    'subtotal' => $row->item_sub_total,
                    'total'    => $row->item_total,
                )
            );
            // Copy billing & shipping
            $suborder->set_address( $order->get_address( 'billing' ), 'billing' );
            $suborder->set_address( $order->get_address( 'shipping' ), 'shipping' );
            $suborder->set_payment_method( $order->get_payment_method() );
            // Calculate totals
            $suborder->calculate_totals();
            // Set status
            $suborder->update_status( 'processing' );
            $suborder->set_created_via( Utill::ORDER_META_SETTINGS['multivendorx_store_order'] );
            $suborder->update_meta_data( Utill::POST_META_SETTINGS['store_id'], $store_id );
            $suborder->save();

            $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $table_name,
                array(
					'order_id'               => $suborder->get_id(),
                    'store_id'               => $store_id,
                    'customer_id'            => $row->customer_id,
                    'total_order_value'      => $suborder->get_total(),
                    'net_items_cost'         => $row->item_total,
                    'marketplace_commission' => $suborder->get_total() - $row->commission_amount,
                    'store_earning'          => $row->commission_amount,
                    'store_payable'          => $row->total_commission,
                    'marketplace_payable'    => $suborder->get_total() - $row->total_commission,
                    'currency'               => $order->get_currency(),
                    'status'                 => in_array( $row->order_status, array( 'pending', 'on-hold', 'cancelled', 'draft', 'failed' ) ) ? 'unpaid' : 'paid',
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
        }

        $balance_table        = $wpdb->prefix . 'wcfm_marketplace_vendor_ledger';
        $wcfm_vendor_balances = $wpdb->get_results( "SELECT * FROM {$balance_table}" );

        foreach ( $wcfm_vendor_balances as $row ) {
            $wcfm_commission_id = $row->reference_id;

            $query = $wpdb->prepare(
                "SELECT * FROM {$wcfm_orders_table} WHERE ID = %d",
                $wcfm_commission_id
            );

            $wcfm_order = $wpdb->get_row( $query );

            if ( in_array( $wcfm_order->order_status, array( 'pending', 'on-hold', 'cancelled', 'draft', 'failed' ) ) ) {
                continue;
            }

            $matched_suborder = null;
            $suborders        = MultiVendorX()->order->get_suborders( $wcfm_order->order_id );
            foreach ( $suborders as $sub ) {
                $suborder = wc_get_order( $sub->ID );
                foreach ( $suborder->get_items() as $item_id => $item ) {
                    $product_id = $item->get_product_id();
                    if ( $product_id == $wcfm_order->product_id ) {
                        $matched_suborder = $suborder;
                        break 2;
                    }
                }
            }

            $store_id = get_user_meta( $row->vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

            if ( $row->reference == 'order' ) {
                $entry_type       = 'Cr';
                $transaction_type = 'Commission';
                $amount           = $row->credit;
            }

            if ( $row->reference == 'withdraw' ) {
                $entry_type       = 'Dr';
                $transaction_type = 'Withdraw';
                $amount           = $row->debit;
            }

            if ( $row->reference == 'refund' ) {
                $entry_type       = 'Dr';
                $transaction_type = 'Refund';
                $amount           = $row->debit;
            }

            $data = array(
                'store_id'         => (int) $store_id,
                'order_id'         => (int) $matched_suborder->get_id(),
                'commission_id'    => (int) $matched_suborder->get_meta( 'multivendorx_commission_id', true ),
                'entry_type'       => $entry_type,
                'transaction_type' => $transaction_type,
                'amount'           => (float) $amount,
                'currency'         => $matched_suborder->get_currency(),
                'payment_method'   => $matched_suborder->get_payment_method(),
                'narration'        => $transaction_type,
                'status'           => 'Completed',
            );

            $format = array( '%d', '%d', '%d', '%s', '%s', '%f', '%s', '%s', '%s', '%s' );

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert( $wpdb->prefix . Utill::TABLES['transaction'], $data, $format );
        }
        $this->deactive_previous_multivendor();
        wp_clear_scheduled_hook( 'multivendorx_order_migration' );
    }

    // Deactive WCFM multivendor
	public function deactive_previous_multivendor() {
		// WCFM free deactive
		require_once ABSPATH . '/wp-admin/includes/plugin.php';
		if ( is_plugin_active( 'wc-multivendor-marketplace/wc-multivendor-marketplace.php' ) ) {
	    	deactivate_plugins( 'wc-multivendor-marketplace/wc-multivendor-marketplace.php' );
	    }
	    // WCFM frontend manager deactive
	    if ( is_plugin_active( 'wc-frontend-manager/wc_frontend_manager.php' ) ) {
	    	deactivate_plugins( 'wc-frontend-manager/wc_frontend_manager.php' );
	    }
	    // WCFM membership deactive
	    if ( is_plugin_active( 'wc-multivendor-membership/wc-multivendor-membership.php' ) ) {
	    	deactivate_plugins( 'wc-multivendor-membership/wc-multivendor-membership.php' );
	    }
	}
}
