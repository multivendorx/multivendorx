<?php

namespace MultiVendorX\Commission;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Commission class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class CommissionManager {
    private $container = array();
    public function __construct() {
        $this->init_classes();
        new Hooks();
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->container = array(
            'hooks' => new Hooks(),
        );
    }

    /**
     * Calculate the commission and insert or update in database.
     *
     * @param   mixed $order
     * @param   mixed $commission_id
     * @return  mixed
     */
    public function calculate_commission( $order = null, $commission_id = null ) {
        global $wpdb;

        if ( $order ) {
            $store_id = $order->get_meta( 'multivendorx_store_id' );
            $vendor   = Store::get_store_by_id( $store_id );

            $commission_type = MultiVendorX()->setting->get_setting( 'commission_type' );

            $commission_amount = $shipping_amount = $tax_amount = $shipping_tax_amount = $marketplace_payable = $store_payable = $coupon_amount = 0;
            $commission_rates  = $rules_array = array();

            if ( $commission_type == 'per_item' ) {
                $per_item          = $this->calc_item_commissions( $order->get_items(), $order, $vendor, $commission_rates );
                $commission_amount = $per_item['commission_amount'];
                $commission_rates  = $per_item['commission_rates'];
                $rules_array       = $per_item['rules_array'];
            } elseif ( $commission_type == 'store_order' ) {
                $store_order_commision = $this->calc_store_order_commission( $order, $order->get_items() );
                $commission_amount     = $store_order_commision['commission_amount'];
                $rules_array           = $store_order_commision['rules_array'];
            }

            // Action hook to adjust items commission rates before save.
            $order->update_meta_data( 'multivendorx_order_items_commission_rates', apply_filters( 'mvx_vendor_order_items_commission_rates', $commission_rates, $order ) );

            $marketplace_commission = $commission_amount;
            $store_earning          = (float) ( $order->get_subtotal() - $order->get_discount_total() - $commission_amount );

            // For migrate users
            if ( $vendor->get_meta( 'revenue_mode_store' ) ) {
                $marketplace_commission = (float) ( $order->get_subtotal() - $order->get_discount_total() - $commission_amount );
                $store_earning          = $commission_amount;
            }

            // Coupons
            $coupon              = $this->calc_coupon_split( $order, $store_earning, $marketplace_commission );
            $store_coupon_amount = $coupon['store_coupon_amount'];
            $admin_coupon_amount = $coupon['admin_coupon_amount'];

            // transfer shipping charges
            if ( MultiVendorX()->modules->is_active( 'store-shipping' ) ) {
                $shipping_amount = $order->get_shipping_total();
            }

            $tax_calculation    = $this->calc_tax_split( $order, $store_earning, $marketplace_commission );
            $admin_tax          = $tax_calculation['admin_tax'];
            $store_tax          = $tax_calculation['store_tax'];
            $admin_shipping_tax = $tax_calculation['admin_shipping_tax'];
            $store_shipping_tax = $tax_calculation['store_shipping_tax'];

            $store_payable       = (float) $store_earning + (float) $shipping_amount + (float) $store_tax + (float) $store_shipping_tax + $store_coupon_amount;
            $marketplace_payable = (float) $marketplace_commission + (float) $admin_tax + (float) $admin_shipping_tax + $admin_coupon_amount;

            $status = $order->get_status() == 'cancelled' ? 'cancelled' : 'unpaid';
            if ( $commission_id ) {
                $commission = CommissionUtil::get_commission_db( $commission_id );
                $status     = $commission->status;
            }

            // insert | update commission into commission table.
            $data   = array(
                'order_id'                 => $order->get_id(),
                'store_id'                 => $store_id,
                'customer_id'              => $order->get_customer_id(),
                'total_order_value'        => $order->get_total(),
                'net_items_cost'           => (float) $order->get_subtotal() - (float) $order->get_discount_total(),
                'marketplace_commission'   => $marketplace_commission,
                'store_earning'            => $store_earning,
                'store_shipping'           => $shipping_amount,
                'store_tax'                => $store_tax,
                'store_shipping_tax'       => $store_shipping_tax,
                'marketplace_tax'          => $admin_tax,
                'marketplace_shipping_tax' => $admin_shipping_tax,
                'store_discount'           => $store_coupon_amount,
                'admin_discount'           => $admin_coupon_amount,
                'store_payable'            => $store_payable,
                'marketplace_payable'      => $marketplace_payable,
                'currency'                 => get_woocommerce_currency(),
                'status'                   => $status,
                'rules_applied'            => serialize( $rules_array ),
            );
            $format = array( '%d', '%d', '%d', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%s', '%s', '%s' );

            $filtered = apply_filters(
                'multivendorx_before_commission_insert',
                array(
                    'data'   => $data,
                    'format' => $format,
                ),
                $vendor,
                ( $order->get_subtotal() - $order->get_discount_total() ),
                $order,
                false
            );

            $data   = $filtered['data'];
            $format = $filtered['format'];

            if ( ! $commission_id ) {
                $wpdb->insert( $wpdb->prefix . Utill::TABLES['commission'], $data, $format );
                $commission_id = $wpdb->insert_id;
            } else {
                $wpdb->update( $wpdb->prefix . Utill::TABLES['commission'], $data, array( 'ID' => $commission_id ), $format );
            }

            return $commission_id;
        }
        return false;
    }

    public function calc_tax_split( $order, $store_earning, $marketplace_commission, $refund = false ) {
        $item_tax_total     = (float) $order->get_cart_tax();
        $shipping_tax_total = (float) $order->get_shipping_tax();

        if ( $refund ) {
            foreach ( $order->get_refunds() as $refund ) {
                $refunded_item_tax     += abs( (float) $refund->get_cart_tax() );
                $refunded_shipping_tax += abs( (float) $refund->get_shipping_tax() );
            }

            $item_tax_total     = (float) ( $order->get_cart_tax() - $refunded_item_tax );
            $shipping_tax_total = (float) ( $order->get_shipping_tax() - $refunded_shipping_tax );
        }

        $tax_on_shipping = MultiVendorX()->setting->get_setting( 'taxable' );
        if ( MultiVendorX()->setting->get_setting( 'give_tax' ) == 'no_tax' || empty( $tax_on_shipping ) ) {
            $admin_tax          = $item_tax_total;
            $store_tax          = 0;
            $admin_shipping_tax = $shipping_tax_total;
            $store_shipping_tax = 0;
        } elseif ( MultiVendorX()->setting->get_setting( 'give_tax' ) == 'full_tax' ) {
            $admin_tax = 0;
            $store_tax = $item_tax_total;
            if ( ! empty( $tax_on_shipping ) ) {
                $store_shipping_tax = $shipping_tax_total;
                $admin_shipping_tax = 0;
            }
        } elseif ( MultiVendorX()->setting->get_setting( 'give_tax' ) == 'commision_based_tax' ) {
            $order_total = ( $order->get_subtotal() - $order->get_discount_total() );
            $admin_tax   = $item_tax_total * ( $marketplace_commission / $order_total );
            $store_tax   = $item_tax_total * ( $store_earning / $order_total );
            if ( ! empty( $tax_on_shipping ) ) {
                $admin_shipping_tax = $shipping_tax_total * ( $marketplace_commission / $order_total );
                $store_shipping_tax = $shipping_tax_total * ( $store_earning / $order_total );
            }
        }

        return array(
            'admin_tax'          => $admin_tax ?? 0,
            'store_tax'          => $store_tax ?? 0,
            'admin_shipping_tax' => $admin_shipping_tax ?? 0,
            'store_shipping_tax' => $store_shipping_tax ?? 0,
        );
    }

    public function calc_item_commissions( $items, $order, $vendor, $commission_rates = array(), $is_refund = false ) {
        $commission_amount = 0;
        $commission_rates  = array();

        $rules_array = array(
            'commission_amount' => array(
                'type'  => MultiVendorX()->setting->get_setting( 'commission_type' ),
                'rules' => array(),
            ),
        );
        foreach ( $items as $item_id => $item ) {
            $product_id = ! empty( $item['variation_id'] ) ? $item['variation_id'] : $item['product_id'];

            $commission_values = $this->get_commission_amount( $product_id, $item, $vendor );
            // If refund
            $refund_amount = 0;
            if ( $is_refund ) {
                $refund_amount = $this->get_item_refunded_total( $order, $item_id );
            } else {
                $rules_array['commission_amount']['rules'][ $product_id ] = array(
					'fixed'      => $commission_values['commission_fixed'],
					'percentage' => $commission_values['commission_val'],
                );
            }

            $item_commission = $this->get_item_commission( $product_id, $item_id, $item, $order, $vendor, $refund_amount );

            $commission_rates[ $item_id ] = array(
                'mode'             => 'store',
                'type'             => 'per_item',
                'commission_val'   => (float) ( $commission_values['commission_val'] ?? 0 ),
                'commission_fixed' => (float) ( $commission_values['commission_fixed'] ?? 0 ),
            );

            wc_update_order_item_meta( $item_id, 'multivendorx_store_item_commission', $item_commission );

            $commission_amount += (float) $item_commission;
        }

        return array(
			'commission_amount' => $commission_amount,
			'commission_rates'  => $commission_rates,
			'rules_array'       => $rules_array,
		);
    }

    public function calc_store_order_commission( $order, $items = array(), $is_refund = false ) {
        $commission_amount          = 0;
        $commission_per_store_order = MultiVendorX()->setting->get_setting( 'commission_per_store_order' );

        $rules_array = array(
            'commission_amount' => array(
                'type'  => MultiVendorX()->setting->get_setting( 'commission_type' ),
                'rules' => array(),
            ),
        );

        $order_total = (float) $order->get_subtotal() - (float) $order->get_discount_total();
        if ( $is_refund ) {
            $order_total -= (float) $this->get_item_refunded_total( $order );
        }

        foreach ( $commission_per_store_order as $row ) {
            if ( ! is_array( $row ) || ! array_key_exists( 'rule_type', $row ) ) {
                continue;
            }

            switch ( $row['rule_type'] ) {
                case 'order_value':
                    $base_val = (float) $row['order_value'];
                    if ( ( $row['rule'] === 'less_than' && $order_total <= $base_val ) ||
                        ( $row['rule'] === 'more_than' && $order_total > $base_val ) ) {
                        $commission_amount = $order_total > 0 ? ( $order_total * ( (float) $row['commission_percentage'] / 100 ) + (float) $row['commission_fixed'] ) : 0;

                        $rules_array['commission_amount']['rules'][] = array(
                            'rule_type'  => $row['rule_type'],
                            'rule'       => $row['rule'],
                            'value'      => $row['order_value'],
                            'fixed'      => $row['commission_fixed'],
                            'percentage' => $row['commission_percentage'],
                        );
                        return (float) $commission_amount;
                    }
                    break;

                case 'price':
                case 'quantity':
                    foreach ( $items as $item_id => $item ) {
                        $qty        = (float) $item['qty'];
                        $line_total = (float) $order->get_item_total( $item, false, false ) * $qty;

                        if ( $is_refund ) {
                            $ref_amt    = $this->get_item_refunded_total( $order, $item_id );
                            $line_total = max( 0, $line_total - (float) $ref_amt * $qty );
                        }

                        if ( $row['rule_type'] === 'price' ) {
                            $compare_value = $line_total;
                            $base_value    = (float) $row['product_price'];
                        } else {
                            $compare_value = $qty;
                            $base_value    = (float) $row['product_qty'];
                        }

                        if ( ( $row['rule'] === 'less_than' && $compare_value <= $base_value ) ||
                            ( $row['rule'] === 'more_than' && $compare_value > $base_value ) ) {
                            $commission_amount += $line_total > 0 ? ( $line_total * ( (float) $row['commission_percentage'] / 100 ) + (float) $row['commission_fixed'] ) : 0;

                            $rules_array['commission_amount']['rules'][] = array(
                                $item['product_id'] => array(
                                    'rule_type'  => $row['rule_type'],
                                    'rule'       => $row['rule'],
                                    'value'      => $base_value,
                                    'fixed'      => $row['commission_fixed'],
                                    'percentage' => $row['commission_percentage'],
                                ),
                            );
                        }
                    }
                    if ( $commission_amount > 0 ) {
                        return (float) $commission_amount;
                    }
                    break;
            }
        }

        $default                                     = reset( $commission_per_store_order );
        $commission_amount                           = $order_total > 0 ? ( $order_total * ( (float) $default['commission_percentage'] / 100 ) + (float) $default['commission_fixed'] ) : 0;
        $rules_array['commission_amount']['rules'][] = array(
            'rule_type'  => 'global',
            'fixed'      => $default['commission_fixed'],
            'percentage' => $default['commission_percentage'],
        );

        return array(
			'commission_amount' => $commission_amount,
			'rules_array'       => $rules_array,
		);
    }

    public function calc_coupon_split( $order, $store_earning, $marketplace_commission ) {
        $store_coupon_amount = $admin_coupon_amount = 0;
        $store_coupon        = false;
        $base_total          = $order->get_subtotal() - $order->get_discount_total();

        if ( $order->get_coupon_codes() ) {
            foreach ( $order->get_coupon_codes() as $coupon_code ) {
                $coupon   = new \WC_Coupon( $coupon_code );
                $store_id = (int) get_post_meta( $coupon->get_id(), Utill::POST_META_SETTINGS['store_id'], true );

                if ( $store_id && Store::get_store_by_id( $store_id ) ) {
                    $store_coupon = true;
                }
            }
        }

        // 1st check exclude admin coupon setting on and the coupon is not store coupon OR
        // 2nd check the commission_include_coupon set to admin
        if ( ( ! empty( MultiVendorX()->setting->get_setting( 'admin_coupon_excluded' ) ) && ! $store_coupon ) || MultiVendorX()->setting->get_setting( 'commission_include_coupon' ) == 'admin' ) {
            $store_coupon_amount = sprintf( '%+0.2f', ( $order->get_discount_total() * ( $store_earning / $base_total ) ) );
        } elseif ( MultiVendorX()->setting->get_setting( 'commission_include_coupon' ) == 'store' ) {
            $store_coupon_amount = sprintf( '%+0.2f', - ( $order->get_discount_total() * ( $marketplace_commission / $base_total ) ) );
        }

        $admin_coupon_amount = (float) ( $order->get_discount_total() - $store_coupon_amount );
        return array(
			'store_coupon_amount' => (float) $store_coupon_amount,
			'admin_coupon_amount' => $admin_coupon_amount,
		);
    }

    /**
     * Get commission value of a item.
     *
     * @param   int    $product_id
     * @param   int    $item_id
     * @param   object $item
     * @param   object $order
     * @param   object $vendor
     * @return  float
     */
    public function get_item_commission( $product_id, $item_id, $item, $order, $vendor, $after_refund_amount = null ) {
        $amount              = 0;
        $commission          = array();
        $product_value_total = 0;

        $line_total = $after_refund_amount ? ( ( $order->get_item_total( $item, false, false ) - $after_refund_amount ) * $item['qty'] ) : $order->get_item_total( $item, false, false ) * $item['qty'];
        // Filter the item total before calculating item commission.
        $line_total = apply_filters( 'mvx_get_commission_line_total', $line_total, $item, $order );

        if ( $product_id && $vendor ) {

            // Get the commission info of the product.
            $commission = $this->get_commission_amount( $product_id, $item, $vendor );

            // Filter to adjust commission before use.
            $commission = apply_filters( 'mvx_get_commission_amount', $commission, $product_id, $vendor->term_id, $item, $order );

            $commission_type = MultiVendorX()->setting->get_setting( 'commission_type' );

            if ( ! empty( $commission ) && $commission_type == 'per_item' ) {
                $amount = $line_total > 0 ? ( (float) $line_total * ( (float) $commission['commission_val'] / 100 ) + ( (float) $commission['commission_fixed'] * $item['qty'] ) ) : 0;
            }

            $product_value_total += $item->get_total();

            if ( apply_filters( 'mvx_admin_pay_commission_more_than_order_amount', true ) && $amount > $product_value_total ) {
                $amount = $product_value_total;
            }
        }

        return apply_filters( 'vendor_commission_amount', $amount, $product_id, $item, $order );
    }

    /**
     * Get the commission amount associate with a product.
     *
     * @param   mixed $product_id
     * @param   mixed $variation_id
     * @param   mixed $item
     * @param   mixed $vendor
     * @return  array | bool
     */
    // product
    // category
    // store
    // global

    public function get_commission_amount( $product_id, $item, $vendor ) {
        $data    = array();
        $product = wc_get_product( $product_id );

        if ( $product && $vendor ) {

            // Variable Product
            $data['commission_val']   = $product->get_meta( 'multivendorx_variable_product_percentage_commission', true );
            $data['commission_fixed'] = $product->get_meta( 'multivendorx_variable_product_fixed_commission', true );

            if ( ! empty( $data['commission_val'] ) || ! empty( $data['commission_fixed'] ) ) {
                return $data;
            }

            // Simple Product
            $data['commission_val']   = $product->get_meta( 'multivendorx_product_percentage_commission', true );
            $data['commission_fixed'] = $product->get_meta( 'multivendorx_product_fixed_commission', true );

            if ( ! empty( $data['commission_val'] ) || ! empty( $data['commission_fixed'] ) ) {
                return $data;
            }

            // Category
            $category_wise_commission = $this->get_category_wise_commission( $product );
            if ( $category_wise_commission && $category_wise_commission->commission_percentage || $category_wise_commission->commission_fixed ) {
                return array(
                    'commission_val'   => $category_wise_commission->commission_percentage,
                    'commission_fixed' => $category_wise_commission->commission_fixed,
                );
            }

            // store commission
            $store_commission_percentage = (float) ( $vendor->get_meta( 'commission_percentage' ) ?? 0 );
            $store_commission_fixed      = (float) ( $vendor->get_meta( 'commission_fixed' ) ?? 0 );

            if ( $store_commission_percentage > 0 || $store_commission_fixed > 0 ) {
                return array(
                    'commission_val'   => $store_commission_percentage,
                    'commission_fixed' => $store_commission_fixed,
                );
            }

            // Global
            $commission_per_item = reset( MultiVendorX()->setting->get_setting( 'commission_per_item', array() ) );

            if ( ! empty( $commission_per_item ) ) {
                return array(
                    'commission_val'   => $commission_per_item['commission_percentage'],
                    'commission_fixed' => $commission_per_item['commission_fixed'],
                );
            }
        }
        return false;
    }

    /**
     * Calculate category lebel commission of a product.
     *
     * @param   object $product
     * @return  \stdClass | null
     */
    public function get_category_wise_commission( $product ) {

        // Get the terms => ['product_cat'] of the prodcut.
        $terms = get_the_terms( $product->get_id(), 'product_cat' );
        if ( ! $terms || is_wp_error( $terms ) ) {
            return null;
        }
        $max_commission_amount = PHP_INT_MIN;
        $max_commission_term   = null;

        foreach ( $terms as $term ) {
            // calculate current term's commission.
            $total_commission_amount = 0;
            $commission_percentage   = (float) get_term_meta( $term->term_id, 'multivendorx_category_percentage_commission', true );
            $commission_fixed        = (float) get_term_meta( $term->term_id, 'multivendorx_category_fixed_commission', true );
            $total_commission_amount = $commission_percentage + $commission_fixed;

            // compare current term's commission with previously store term's commission.
            if ( $total_commission_amount > $max_commission_amount ) {
                $max_commission_amount = $total_commission_amount;
                $max_commission_term   = $term;
            }
        }

        // Store commission value of maximum commission category.
        $category_wise_commission                        = new \stdClass();
        $category_wise_commission->commission_percentage = (float) ( get_term_meta( $max_commission_term->term_id, 'multivendorx_category_percentage_commission', true ) ?? 0 );
        $category_wise_commission->commission_fixed      = (float) ( get_term_meta( $max_commission_term->term_id, 'multivendorx_category_fixed_commission', true ) ?? 0 );

        // Filter hook to adjust category wise commission after calculation.
        return apply_filters( 'mvx_category_wise_commission', $category_wise_commission, $product );
    }

    /**
     * Summary of calculate_commission_refunds
     *
     * @param   mixed $vendor_order
     * @param   mixed $refund_id
     * @return  void
     */
    public function calculate_commission_refunds( $vendor_order, $refund_id ) {
        global $wpdb;
        $commission_id = $vendor_order->get_meta( 'multivendorx_commission_id', true );
        $store_id      = $vendor_order->get_meta( 'multivendorx_store_id', true );
        $vendor        = Store::get_store_by_id( $store_id );

        if ( $commission_id ) {
            $commission_amount = $marketplace_payable = $store_payable = 0;

            if ( ! empty( $vendor_order->get_refunds() ) ) {
                $commission_type = MultiVendorX()->setting->get_setting( 'commission_type' );

                $commission_rates = array();

                if ( $commission_type == 'per_item' ) {
                    $per_item          = $this->calc_item_commissions( $vendor_order->get_items(), $vendor_order, $vendor, $commission_rates, true );
                    $commission_amount = $per_item['commission_amount'];
                } elseif ( $commission_type == 'store_order' ) {
                    $store_order_commision = $this->calc_store_order_commission( $vendor_order, $vendor_order->get_items(), true );
                    $commission_amount     = $store_order_commision['commission_amount'];
                }
            }

            $marketplace_commission = $commission_amount;
            $store_earning          = (float) ( $vendor_order->get_subtotal() - $vendor_order->get_discount_total() - $this->get_item_refunded_total( $vendor_order ) - $commission_amount );

            $commission = CommissionUtil::get_commission_db( $commission_id );

            if ( ( $vendor_order->get_total() - $vendor_order->get_total_refunded() ) == 0 ) {
                $status = 'refunded';
            } else {
                $status = 'partially_refunded';
            }

            // Coupons
            $coupon              = $this->calc_coupon_split( $vendor_order, $store_earning, $marketplace_commission );
            $store_coupon_amount = $coupon['store_coupon_amount'];
            $admin_coupon_amount = $coupon['admin_coupon_amount'];

            foreach ( $vendor_order->get_refunds() as $refund ) {
                if ( MultiVendorX()->modules->is_active( 'store-shipping' ) ) {
                    $refunded_shipping += abs( (float) $refund->get_shipping_total() );
                }
            }

            $tax_calculation    = $this->calc_tax_split( $vendor_order, $store_earning, $marketplace_commission, true );
            $admin_tax          = $tax_calculation['admin_tax'];
            $store_tax          = $tax_calculation['store_tax'];
            $admin_shipping_tax = $tax_calculation['admin_shipping_tax'];
            $store_shipping_tax = $tax_calculation['store_shipping_tax'];

            $store_shipping      = $vendor_order->get_shipping_total() - $refunded_shipping;
            $store_payable       = (float) $store_earning + (float) $store_shipping + (float) $store_tax + (float) $store_shipping_tax + $store_coupon_amount;
            $marketplace_payable = (float) $marketplace_commission + (float) $admin_tax + (float) $admin_shipping_tax + $admin_coupon_amount;

            $store_refunded = $commission->store_refunded + (
                                ( $commission->store_earning - $store_earning ) +
                                ( $commission->store_shipping - $store_shipping ) +
                                ( $commission->store_tax - $store_tax ) +
                                ( $commission->store_shipping_tax - $store_shipping_tax ) +
                                ( $commission->store_discount - $store_coupon_amount )
                            );

            $marketplace_refunded = $commission->marketplace_refunded + (
                                ( $commission->marketplace_commission - $marketplace_commission ) +
                                ( $commission->marketplace_tax - $admin_tax ) +
                                ( $commission->marketplace_shipping_tax - $admin_shipping_tax ) +
                                ( $commission->admin_discount - $admin_coupon_amount )
                            );

            $data = array(
                'order_id'                 => $vendor_order->get_id(),
                'store_id'                 => $store_id,
                'total_order_value'        => $vendor_order->get_total(),
                'marketplace_commission'   => $marketplace_commission,
                'store_earning'            => $store_earning,
                'store_shipping'           => $store_shipping,
                'store_tax'                => $store_tax,
                'store_shipping_tax'       => $store_shipping_tax,
                'marketplace_tax'          => $admin_tax,
                'marketplace_shipping_tax' => $admin_shipping_tax,
                'store_discount'           => $store_coupon_amount,
                'admin_discount'           => $admin_coupon_amount,
                'store_payable'            => $store_payable,
                'marketplace_payable'      => $marketplace_payable,
                'store_refunded'           => $store_refunded,
                'marketplace_refunded'     => $marketplace_refunded,
                'currency'                 => get_woocommerce_currency(),
                'status'                   => $status,
                'rules_applied'            => $commission->rules_applied,
            );

            $format = array( '%d', '%d', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%f', '%s', '%s', '%s' );

            $filtered = apply_filters(
                'multivendorx_before_commission_insert',
                array(
                    'data'   => $data,
                    'format' => $format,
                ),
                $vendor,
                ( $vendor_order->get_subtotal() - $vendor_order->get_discount_total() - $this->get_item_refunded_total( $vendor_order ) ),
                $vendor_order,
                true
            );

            $data   = $filtered['data'];
            $format = $filtered['format'];

            $wpdb->update( $wpdb->prefix . Utill::TABLES['commission'], $data, array( 'ID' => $commission_id ), $format );

            do_action( 'mvx_after_create_commission_refunds', $vendor_order, $commission_id );

            $refund_status = MultiVendorX()->setting->get_setting( 'customer_refund_status' );
            if ( ! empty( $refund_status ) && in_array( $vendor_order->get_status(), $refund_status ) ) {
                $data = array(
                    'store_id'         => (int) $store_id,
                    'order_id'         => (int) $vendor_order->get_id(),
                    'commission_id'    => $commission_id ? (int) $commission_id : null,
                    'entry_type'       => 'Dr',
                    'transaction_type' => 'Refund',
                    'amount'           => abs( (float) $commission->store_payable - $store_payable ),
                    'currency'         => get_woocommerce_currency(),
                    'payment_method'   => $vendor->get_meta( 'payment_method' ) ?? '',
                    'narration'        => 'Withdrawal via refund',
                    'status'           => 'Completed',
                );

                $format = array( '%d', '%d', '%d', '%s', '%s', '%f', '%s', '%s', '%s', '%s' );

                $wpdb->insert(
                    $wpdb->prefix . Utill::TABLES['transaction'],
                    $data,
                    $format
                );
            }

            return $commission_id;
        }
    }

    /**
     * Get refunded total for specific item OR all items (excluding shipping, taxes, etc.)
     *
     * @param WC_Order $order
     * @param int|null $item_id  If null, returns total refund for all items.
     * @return float
     */
    public function get_item_refunded_total( $order, $item_id = null ) {

        $refunded_total = 0;

        // Loop through all refunds in this order
        foreach ( $order->get_refunds() as $refund ) {
            foreach ( $refund->get_items() as $refund_item ) {
                $refunded_item_id = $refund_item->get_meta( '_refunded_item_id', true );

                if ( $item_id !== null ) {
                    if ( (int) $refunded_item_id === (int) $item_id ) {
                        $refunded_total += abs( (float) $refund_item->get_total() );
                    }
                } else {
                    $refunded_total += abs( (float) $refund_item->get_total() );
                }
            }
        }

        return $refunded_total;
    }
}
