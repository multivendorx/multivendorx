<?php
/**
 * MultiVendorX Order Manager
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Order;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Order class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class OrderManager {

    /**
     * Container for all the classes.
     *
     * @var array
     */
    private $container = array();

    /**
     * Constructor.
     */
    public function __construct() {
        $this->init_classes();
        add_action( 'init', array( $this, 'filter_woocommerce_order_query' ) );
    }

    /**
     * Initialize all Order classes.
     */
    public function init_classes() {
        $this->container = array(
            'hook'     => new Hooks(),
            'admin'    => new Admin(),
            'frontend' => new Frontend(),
        );
    }

    /**
     * Filter the query of order table before it is fetch.
     */
    public function filter_woocommerce_order_query() {
        // Filter the query of order table before it is fetch.
        if ( is_admin() || is_account_page() ) {
            add_filter( 'woocommerce_order_query_args', array( $this, 'set_filter_order_query' ) );
        }
    }

    /**
     * A special function that filter the query in time of getting all order.
     * By default it trim the vendeor order (parent id is not 0) if query not contain 'parent'.
     * filter 'multivendorx_order_parent_filter' to filter based on parent.
     *
     * @param   mixed $query Query arguments.
     * @return  mixed
     */
    public function set_filter_order_query( $query ) {
        $parent_id = apply_filters( 'mvx_order_parent_filter', 0 );
        if ( ! $query['parent'] && $parent_id >= 0 ) {
            $query['parent'] = $parent_id;
        }
        return $query;
    }

    /**
     * Get array of suborders if available.
     * Return array of suborder as WC_Order object or IDs.
     *
     * @param int|\WC_Order $order Order ID or object.
     * @param array         $args  Arguments for query.
     * @param bool          $return_objects Return objects or IDs.
     * @return array
     */
    public function get_suborders( $order, $args = array(), $return_objects = true ) {
        $query_args = array_merge(
            array(
                'parent' => is_numeric( $order ) ? $order : $order->get_id(),
                'return' => $return_objects ? 'objects' : 'ids',
            ),
            $args
        );

        return wc_get_orders( $query_args );
    }

    /**
     * Check if order is multivendorx order.
     *
     * @param   int $id Order id.
     * @return  boolean
     */
    public function is_multivendorx_order( $id ) {
        if ( $id ) {
            $order = wc_get_order( $id );
            if ( $order->get_meta( 'multivendorx_store_id', true ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Create store order from a order.
     * It group item based on store then create suborder for each group.
     *
     * @param   object $order Order object.
     * @return  void
     */
    public function create_store_orders( $order ) {
        $suborders = MultiVendorX()->order->get_suborders( $order->get_id() ) ?? array();
        $item_info = self::group_item_store_based( $order );

        $existing_orders = array();
        foreach ( $suborders as $order ) {
            if ( $order instanceof WC_Order ) {
                $order_id     = $order->get_id();
                $store_id     = $order->get_meta( Utill::POST_META_SETTINGS['store_id'] );
                $store_exists = Store::get_store( $store_id );
                if ( $store_exists ) {
                    $existing_orders[ $order_id ] = $store_id;
                }
            }
        }

        foreach ( $item_info as $store_id => $items ) {
            if ( in_array( $store_id, $existing_orders, true ) ) {
                $suborder_id = array_keys( $existing_orders, $store_id, true );
                $store_order = self::create_sub_order( $order, $store_id, $items, $suborder_id, true );
                // Regenerate commission.
                $this->container['admin']->regenerate_order_commissions( $store_order );
            } else {
                $store_order = self::create_sub_order( $order, $store_id, $items );
                do_action( 'mvx_checkout_vendor_order_processed', $store_order, $order );
            }

            $store_order->save();
            $store = new Store($store_id);

            do_action(
            'multivendorx_notify_new_order',
                'new_order',
                array(
                    'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                    'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                    'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                    'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                    'customer_email' => $store_order->get_billing_email(),
                    'customer_phn' => $store_order->get_billing_phone(),
                    'order_id'    => $store_order->get_id(),
                    'category'    => 'activity',
                )
            );
        }
    }

    /**
     * Create suborder of a main order.
     *
     * @param   object  $parent_order Parent order object.
     * @param   int     $store_id Store store id.
     * @param   array   $items Grouped item.
     * @param   int     $suborder_id Suborder id.
     * @param   boolean $is_update Is it update.
     * @return  object
     */
    public static function create_sub_order( $parent_order, $store_id, $items, $suborder_id = 0, $is_update = false ) {
        $meta = array(
            'cart_hash',
            'customer_id',
            'currency',
            'prices_include_tax',
            'customer_ip_address',
            'customer_user_agent',
            'customer_note',
            'payment_method',
            'payment_method_title',
            'status',
            'billing_country',
            'billing_first_name',
            'billing_last_name',
            'billing_company',
            'billing_address_1',
            'billing_address_2',
            'billing_city',
            'billing_state',
            'billing_postcode',
            'billing_email',
            'billing_phone',
            'shipping_country',
            'shipping_first_name',
            'shipping_last_name',
            'shipping_company',
            'shipping_address_1',
            'shipping_address_2',
            'shipping_city',
            'shipping_state',
            'shipping_postcode',
        );

        try {
            $order = $is_update ? wc_get_order( $suborder_id ) : new \WC_Order();

            if ( $is_update ) {
                foreach ( $order->get_items() as $item_id => $item ) {
                    $order->remove_item( $item_id );
                }

                // Remove all shipping items.
                foreach ( $order->get_items( 'shipping' ) as $item_id => $item ) {
                    $order->remove_item( $item_id );
                }

                // Remove all coupons.
                foreach ( $order->get_items( 'coupon' ) as $item_id => $item ) {
                    $order->remove_item( $item_id );
                }
            }

            // set meta value of suborder from parent order.
            foreach ( $meta as $key ) {
                if ( is_callable( array( $order, "set_{$key}" ) ) ) {
                    $order->{"set_{$key}"}( $parent_order->{"get_{$key}"}() );
                }
            }

            self::create_line_item( $order, $items );
            self::create_shipping_item( $order, $items );
            self::create_coupon_item( $order, $items );

            if ( ! $is_update ) {
                // save other details for suborder.
                $order->set_created_via( Utill::ORDER_META_SETTINGS['multivendorx_store_order'] );
                $order->update_meta_data( Utill::POST_META_SETTINGS['store_id'], $store_id );
                $order->set_parent_id( $parent_order->get_id() );
            }

            $order->calculate_totals();

            /**
             * Action hook to adjust order before save.
             *
             * @since 3.4.0
             */
            do_action( 'mvx_checkout_create_order', $parent_order, $order, $items );

            return $order;
        } catch ( \Exception $e ) {
            return new \WP_Error( 'Faild to create store order', $e->getMessage() );
        }
    }

    /**
     * Get the basic info of a order items.
     * It group the item based on store.
     *
     * @param   object $order Order object.
     * @return  array
     */
    public static function group_item_store_based( $order ) {
        $items = $order->get_items();

        // Group each item.
        $grouped_items = array();
        foreach ( $items as $item_id => $item ) {
            if ( isset( $item['product_id'] ) && 0 !== $item['product_id'] ) {
                $store = Store::get_store( $item['product_id'], 'product' );
                if ( $store ) {
                    $grouped_items[ $store->get_id() ][ $item_id ] = $item;
                }
            }
        }

        // Structure data for grouped item.
        $item_info = array();
        foreach ( $grouped_items as $store_id => $items ) {
            $item_info[ $store_id ] = array(
                'store_id'     => $store_id,
                'parent_order' => $order,
                'line_items'   => $items,
            );
        }

        return $item_info;
    }

    /**
     * Create new line items for store order
     *
     * @param   object $order Order object.
     * @param   array  $items Grouped item.
     * @return  void
     */
    public static function create_line_item( $order, $items ) {
        $line_items = $items['line_items'];

        // Iterate through each item and create a order's line item.
        foreach ( $line_items as $item_id => $order_item ) {
            if ( isset( $order_item['product_id'] ) && 0 !== $order_item['product_id'] ) {
                $product = wc_get_product( $order_item['product_id'] );
                $item    = new \WC_Order_Item_Product();

                $item->set_props(
                    array(
                        'quantity'     => $order_item['quantity'],
                        'variation'    => $order_item['variation'],
                        'subtotal'     => $order_item['line_subtotal'],
                        'total'        => $order_item['line_total'],
                        'subtotal_tax' => $order_item['line_subtotal_tax'],
                        'total_tax'    => $order_item['line_tax'],
                        'taxes'        => $order_item['line_tax_data'],
                    )
                );

                if ( $product ) {
                    $item->set_props(
                        array(
                            'name'         => $order_item->get_name(),
                            'tax_class'    => $order_item->get_tax_class(),
                            'product_id'   => $order_item->get_product_id(),
                            'variation_id' => $order_item->get_variation_id(),
                        )
                    );
                }

                $item->set_backorder_meta();
                $item->add_meta_data( 'store_order_item_id', $item->get_product_id() );

                // Copy all metadata from order's item to new created item.
                $metadata = $order_item->get_meta_data();
                if ( $metadata ) {
                    foreach ( $metadata as $meta ) {
                        $item->add_meta_data( $meta->key, $meta->value );
                    }
                }

                // Action hook before new item save.
                do_action( 'mvx_vendor_create_order_line_item', $item, $item->get_product_id(), $order_item, $order );

                $order->add_item( $item );
            }
        }
    }

    /**
     * Create new shipping items for store order
     *
     * @param   object $order Order object.
     * @param   array  $items Grouped item.
     * @return  void
     */
    public static function create_shipping_item( $order, $items ) {
        $store_id     = $items['store_id'];
        $parent_order = $items['parent_order'];
        $shipping_items = $parent_order->get_items( 'shipping' );

        foreach ( $shipping_items as $item_id => $item ) {
            $shipping_store_id = (int)$item->get_meta( Utill::POST_META_SETTINGS['store_id'], true );
            if ( $shipping_store_id === $store_id ) {
                $shipping = new \WC_Order_Item_Shipping();
                $shipping->set_props(
                    array(
                        'method_title' => $item['method_title'],
                        'method_id'    => $item['method_id'],
                        'instance_id'  => $item['instance_id'],
                        'taxes'        => $item['taxes'],
                        'total'        => wc_format_decimal( $item['total'] ),
                    )
                );

                foreach ( $item->get_meta_data() as $key => $value ) {
                    $shipping->add_meta_data( $key, $value, true );
                }

                $shipping->add_meta_data( Utill::POST_META_SETTINGS['store_id'], $store_id, true );
                $item->add_meta_data( Utill::ORDER_META_SETTINGS['store_order_shipping_item_id'], $item_id );

                // Action hook to adjust item before save.
                do_action( 'mvx_vendor_create_order_shipping_item', $shipping, $item_id, $item, $order );

                $order->add_item( $shipping );
            }
        }
    }

    /**
     * Create new coupon items for store order
     *
     * @param   object $order Order object.
     * @param   array  $items Grouped item.
     * @return  void
     */
    public static function create_coupon_item( $order, $items ) {

        $parent_order = $items['parent_order'];
        $line_items   = $items['line_items'];

        // Store the product id of suborder's item.
        $product_ids = array();
        foreach ( $line_items as $item ) {
            $product_ids[] = $item->get_product_id();
        }

        foreach ( $parent_order->get_coupons() as $coupon_item ) {
            $coupon_code = $coupon_item->get_code();        // e.g. "SUMMER10".
            $coupon      = new \WC_Coupon( $coupon_code );
            if ( ! in_array(
                $coupon->get_discount_type(),
                apply_filters( 'mvx_order_available_coupon_types', array( 'fixed_product', 'percent', 'fixed_cart' ), $order, $coupon ),
                true
            )
            ) {
				continue;
            }

            $coupon_products = $coupon->get_product_ids();

            $match_coupon_product = array_intersect( $product_ids, $coupon_products );

            if ( $match_coupon_product ) {
                $item = new \WC_Order_Item_Coupon();
                $item->set_props(
                    array(
                        'code'         => $coupon_item->get_code(),
                        'discount'     => $coupon_item->get_discount(),
                        'discount_tax' => $coupon_item->get_discount_tax(),
                    )
                );

                // Avoid storing used_by - it's not needed and can get large.
                $coupon_data = $coupon->get_data();
                unset( $coupon_data['used_by'] );
                $item->add_meta_data( 'coupon_data', $coupon_data );

                // Action hook to adjust item before save.
                do_action( 'mvx_checkout_create_order_coupon_item', $item, $coupon, $order );

                // Add item to order and save.
                $order->add_item( $item );
            }
        }
    }

    /**
     * Magic getter function to get the reference of class.
     * Accept class name, If valid return reference, else Wp_Error.
     *
     * @param   mixed $class Name of the class to retrieve from the container.
     * @return  object | \WP_Error
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }
        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }
}
