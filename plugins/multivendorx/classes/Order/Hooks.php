<?php
/**
 * MultiVendorX Order Hook class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Order;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Order Hook class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Hooks {
    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'woocommerce_checkout_create_order_line_item', array( $this, 'add_metadata_for_line_item' ), 10, 4 );
        add_action( 'woocommerce_checkout_create_order_shipping_item', array( $this, 'add_metadate_for_shipping_item' ), 10, 4 );
        add_action( 'woocommerce_analytics_update_order_stats', array( $this, 'remove_suborder_analytics' ), 10, 1 );

        // Create store order after valid checkout processed.
        add_action( 'woocommerce_checkout_order_processed', array( $this, 'create_store_order' ) );
        add_action( 'woocommerce_store_api_checkout_order_processed', array( $this, 'create_store_order' ) );

        // Create store order from backend.
        add_action( 'woocommerce_new_order', array( $this, 'manually_create_store_order' ), 10, 2 );

        // After crate suborder order try to sync order status.
        add_action( 'woocommerce_order_status_changed', array( $this, 'parent_order_to_store_order_status_sync' ), 10, 4 );
        add_action( 'woocommerce_order_status_changed', array( $this, 'store_order_to_parent_order_status_sync' ), 10, 4 );

        add_action( 'woocommerce_order_status_changed', array( $this, 'trigger_order_status_notifications' ), 50, 4 );
    }

    /**
     * Add metadata for line item in time of checkout process.
     *
     * @param   mixed $item Line Item Object.
     * @param   mixed $item_key Line Item Key.
     * @param   mixed $values Line Item Array.
     * @param   mixed $order Order Object.
     * @return  void
     */
    public function add_metadata_for_line_item( $item, $item_key, $values, $order ) {
        if ( $order && $order->get_parent_id() === 0 ) {
            $store = Store::get_store( $item['product_id'], 'product' );
            if ( $store ) {
                $item->add_meta_data( Utill::ORDER_META_SETTINGS['sold_by'], $store->get( 'name' ) );
            }
        }
    }

    /**
     * Add metadata for shipping item in time of checkout process.
     *
     * @param mixed $item Shipping Item Object.
     * @param mixed $package_key Package Key.
     * @param mixed $package Package Array.
     * @param mixed $order Order Object.
     * @return void
     */
    public function add_metadate_for_shipping_item( $item, $package_key, $package, $order ) {
        $store_id = $package['store_id'] ?? $package_key;
        if ( $order && $order->get_parent_id() === 0 ) {
            $item->add_meta_data( Utill::POST_META_SETTINGS['store_id'], $store_id, true );
            $package_qty = array_sum( wp_list_pluck( $package['contents'], 'quantity' ) );
            $item->add_meta_data( 'package_qty', $package_qty, true );
            do_action( 'mvx_add_shipping_package_meta' );
        }
    }

    /**
     * Woocommerce admin dashboard restrict dual order report
     *
     * @param   int $order_id Parent Order ID.
     * @return  void
     */
    public function remove_suborder_analytics( $order_id ) {
        global $wpdb;
        $order = new StoreOrder( $order_id );
        if ( $order->is_store_order() ) {
            $wpdb->delete( $wpdb->prefix . 'wc_order_stats', array( 'order_id' => $order_id ) );

            if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
                MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
            }

            \WC_Cache_Helper::get_transient_version( 'woocommerce_reports', true );
        }
    }

    /**
     * Create the store orders of a main order from backend.
     *
     * @param int    $order_id Parent Order ID.
     * @param object $order    Order Object.
     * @return void
     */
    public function manually_create_store_order( $order_id, $order ) {
        $this->create_store_order( $order );
    }

    /**
     * Create the store orders of a main order.
     *
     * @param   mixed $order Order Object.
     * @return  void
     */
    public function create_store_order( $order ) {
        if ( is_numeric( $order ) ) {
            $order = wc_get_order( $order );
        }

        if ( $order->get_parent_id() || $order->get_meta( Utill::ORDER_META_SETTINGS['has_sub_order'] ) ) {
            return;
        }

        MultiVendorX()->order->create_store_orders( $order );

        $order->update_meta_data( Utill::ORDER_META_SETTINGS['has_sub_order'], true );
        $order->save();
    }

    /**
     * Create the store orders of a main order form backend.
     *
     * @param   int $order_id Parent Order ID.
     * @return  void
     */
    public function manually_create_order_item_and_suborder( $order_id = 0 ) {
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
			return;
        }

        $items = $order->get_items();
        foreach ( $items as $key => $value ) {
            if ( $order || ( function_exists( 'wcs_is_subscription' ) && wcs_is_subscription( $order ) ) ) {
                $general_cap = apply_filters( 'mvx_sold_by_text', __( 'Sold By', 'multivendorx' ) );
                $store       = Store::get_store( $value['product_id'], 'product' );
                if ( $store ) {
                    if ( ! wc_get_order_item_meta( $key, Utill::POST_META_SETTINGS['store_id'] ) ) {
                        wc_add_order_item_meta( $key, Utill::POST_META_SETTINGS['store_id'], $store->get_id() );
                    }

                    if ( ! wc_get_order_item_meta( $key, $general_cap ) ) {
                        wc_add_order_item_meta( $key, $general_cap, $store->get( 'name' ) );
                    }
                }
            }
        }

        $this->create_store_order( $order_id );
    }

    /**
     * Sync store order based on parent order status change for first time.
     * Except first time whenever parent order status change it skip for store order.
     *
     * @param   mixed $order_id Parent Order ID.
     * @param   mixed $old_status Old Status.
     * @param   mixed $new_status New Status.
     * @param   mixed $order Order Object.
     * @return  void
     */
    public function parent_order_to_store_order_status_sync( $order_id, $old_status, $new_status, $order ) {
        if ( ! $order_id ) {
			return;
        }

        if ( empty( $new_status ) ) {
            $new_status = $order->get_status( 'edit' );
        }

        // If order is not a main order or sync before then return.
        if ( $order->get_parent_id() || $order->get_meta( Utill::ORDER_META_SETTINGS['order_status_synchronized'], true ) ) {
            return;
        }

        remove_action( 'woocommerce_order_status_completed', 'wc_paying_customer' );

        // Check if order have suborder then sync.
        $suborders = MultiVendorX()->order->get_suborders( $order );
        if ( $suborders ) {
            foreach ( $suborders as $suborder ) {
                if ( $suborder && $suborder->get_status() !== $new_status ) {
                    $suborder->update_status( $new_status, _x( 'Update via parent order: ', 'Order note', 'multivendorx' ) );

                    $updated = true;
                }
            }

            if ( $updated ) {
                $order->update_meta_data( Utill::ORDER_META_SETTINGS['order_status_synchronized'], true );
                $order->save();
            }
        }

        add_action( 'woocommerce_order_status_completed', 'wc_paying_customer' );
    }

    /**
     * Sync parent order base on store order.
     * If all store order is in same status then change the parent order.
     *
     * @param   mixed  $order_id Store Order ID.
     * @param   mixed  $old_status Old Status.
     * @param   mixed  $new_status New Status.
     * @param   object $order Order Object.
     * @return  void
     */
    public function store_order_to_parent_order_status_sync( $order_id, $old_status, $new_status, $order ) {

        $store_id = $order ? absint( $order->get_meta( Utill::POST_META_SETTINGS['store_id'], true ) ) : 0;

        if ( get_current_user_id() === $store_id ) {
            $parent_order_id = $order->get_parent_id();
            if ( $parent_order_id ) {
                // Remove the action to prevent recursion call.
                remove_action( 'woocommerce_order_status_changed', array( $this, 'parent_order_to_store_order_status_sync' ), 10, 4 );

                $suborders        = MultiVendorX()->order->get_suborders( $parent_order_id );
                $all_status_equal = true;
                foreach ( $suborders as $suborder ) {
                    if ( $suborder->get_status( 'edit' ) !== $new_status ) {
                        $all_status_equal = false;
                        break;
                    }
                }

                if ( $all_status_equal ) {
                    $parent_order = wc_get_order( $parent_order_id );
                    $parent_order->update_status( $new_status, _x( "Sync from store's suborders: ", 'Order note', 'multivendorx' ) );
                }

                // Add the action back.
                add_action( 'woocommerce_order_status_changed', array( $this, 'parent_order_to_store_order_status_sync' ), 10, 4 );
            }
        }
    }

    /**
     * Trigger order status notifications.
     * If all store order is in same status then change the parent order.
     *
     * @param   mixed  $order_id Store Order ID.
     * @param   mixed  $old_status Old Status.
     * @param   mixed  $new_status New Status.
     * @param   object $order Order Object.
     * @return  void
     */
    public function trigger_order_status_notifications( $order_id, $old_status, $new_status, $order ) {

        $store_id = $order ? absint( $order->get_meta( Utill::POST_META_SETTINGS['store_id'], true ) ) : 0;

        $store = new Store($store_id);
        if ( $order->get_parent_id() > 0 ) {
            if ($new_status == 'processing') {
                do_action(
                    'multivendorx_notify_order_processing',
                        'order_processing',
                        array(
                            'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                            'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                            'customer_email' => $order->get_billing_email(),
                            'customer_phn' => $order->get_billing_phone(),
                            'order_id'    => $order->get_id(),
                            'category'    => 'activity',
                        )
                    );
            }

            if ($new_status == 'completed') {
                do_action(
                    'multivendorx_notify_order_completed',
                        'order_completed',
                        array(
                            'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                            'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                            'customer_email' => $order->get_billing_email(),
                            'customer_phn' => $order->get_billing_phone(),
                            'order_id'    => $order->get_id(),
                            'category'    => 'activity',
                        )
                    );
            }
            
            if ($new_status == 'cancelled') {
                do_action(
                    'multivendorx_notify_order_cancelled',
                        'order_cancelled',
                        array(
                            'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                            'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                            'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                            'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                            'customer_email' => $order->get_billing_email(),
                            'customer_phn' => $order->get_billing_phone(),
                            'order_id'    => $order->get_id(),
                            'category'    => 'activity',
                        )
                    );
            }

            if ($new_status == 'refunded') {
                do_action(
                    'multivendorx_notify_order_refunded',
                        'order_refunded',
                        array(
                            'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                            'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                            'customer_email' => $order->get_billing_email(),
                            'customer_phn' => $order->get_billing_phone(),
                            'order_id'    => $order->get_id(),
                            'category'    => 'activity',
                        )
                    );
            }

            if ($old_status == 'refund-requested' && $new_status == 'processing') {
                do_action(
                    'multivendorx_notify_refund_rejected',
                        'refund_rejected',
                        array(
                            'customer_email' => $order->get_billing_email(),
                            'customer_phn' => $order->get_billing_phone(),
                            'order_id'    => $order->get_id(),
                            'category'    => 'activity',
                        )
                    );
            }

        }

    }
}
