<?php

namespace MultiVendorX\Commission;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Commission class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
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
            'hooks'    => new Hooks(),
        );
    }

    /**
     * Calculate the commission and insert or update in database.
     * @param   mixed $order
     * @param   mixed $commission_id
     * @return  mixed
     */
    public function calculate_commission( $order = null , $commission_id = null ) {
        global $wpdb;

        if ( $order ) {
            $store_id = $order->get_meta('multivendorx_store_id');
            $vendor = Store::get_store_by_id( $store_id );

            $commission_type = MultiVendorX()->setting->get_setting( 'commission_type' );

            $commission_amount = $shipping_amount = $tax_amount = $shipping_tax_amount = 0;
            $commission_rates = [];

            if ( $commission_type == 'per_item' ) {
                foreach ( $order->get_items() as $item_id => $item ) {
                    $product_id = $item['variation_id'] ? $item['variation_id'] : $item['product_id'];

                    $item_commission = $this->get_item_commission( $product_id, $item_id, $item, $order, $vendor );
                    $commission_values = $this->get_commission_amount( $product_id, $item, $vendor );
                    $commission_rate = [
                        'mode' => 'store',
                        'type' => 'per_item',
                        'commission_val' => (float) ( $commission_values['commission_val'] ?? 0 ),
                        'commission_fixed' => (float) ( $commission_values['commission_fixed'] ?? 0 )
                    ];
                    
                    wc_update_order_item_meta( $item_id, 'multivendorx_store_item_commission', $item_commission );
                    $commission_amount += floatval($item_commission);
                    $commission_rates[$item_id] = $commission_rate;
                }
            } elseif ( $commission_type == 'store_order' ) {
                $commission_per_store_order = MultiVendorX()->setting->get_setting( 'commission_per_store_order' );
                foreach ($commission_per_store_order as $row) {
                    if (array_key_exists('rule_type', $row)) {  
                        switch ($row['rule_type']) {
                            case 'order_value':
                                $order_total = (float) $order->get_total();
    
                                if (
                                    ($row['rule'] === 'less_than'  && $order_total <= (float) $row['order_value']) ||
                                    ($row['rule'] === 'more_than' && $order_total >  (float) $row['order_value'])
                                ) {
                                    $commission_amount = $order_total * ((float) $row['commission_percentage'] / 100) + (float) $row['commission_fixed'];
                                    break 2;
                                }
                                break;
    
                            case 'price':
                            case 'quantity':
                                foreach ($order->get_items() as $item_id => $item) {
                                    // $line_total = $order->get_item_subtotal($item, false, false) * $item['qty'];
                                    $store_coupon = false;
                                    if ( $order->get_coupon_codes() ) {
                                        foreach ( $order->get_coupon_codes() as $coupon_code ) {
                                            $coupon   = new \WC_Coupon( $coupon_code );
                                            $store_id = (int) get_post_meta( $coupon->get_id(), 'multivendorx_store_id', true );

                                            if ( $store_id && Store::get_store_by_id( $store_id ) ) {
                                                $store_coupon = true;
                                            }
                                        }
                                    }

                                    if ( MultiVendorX()->setting->get_setting( 'commission_include_coupon' ) == 'seperate' && empty( MultiVendorX()->setting->get_setting( 'admin_coupon_excluded' ) ) && !$store_coupon ) {
                                        $line_total = $order->get_item_total( $item, false, false ) * $item['qty'];
                                    } else {
                                        $line_total = $order->get_item_subtotal( $item, false, false ) * $item['qty'];
                                    }
    
                                    $base_value = $row['rule_type'] === 'price'
                                        ? (float) wc_get_product($item['variation_id'] ?: $item['product_id'])->get_price()
                                        : (float) $row['product_qty'];
    
                                    $compare_value = $row['rule_type'] === 'price'
                                        ? (float) $line_total
                                        : (float) $item['qty'];
    
                                    if (
                                        ($row['rule'] === 'less_than'  && $compare_value <= $base_value) ||
                                        ($row['rule'] === 'more_than' && $compare_value >  $base_value)
                                    ) {
                                        $commission_amount += $line_total * ((float) $row['commission_percentage'] / 100) + (float) $row['commission_fixed'];
                                    }
                                }
    
                                if ($commission_amount > 0) {
                                    break 2; // exit foreach + switch
                                }
                                break;
                        }
                    } 
                }

                if ($commission_amount <= 0) {
                    $default_store_order_commission = reset($commission_per_store_order);                    
                    $commission_amount = (float) $order->get_total() * ((float) $default_store_order_commission['commission_percentage'] / 100) + (float) $default_store_order_commission['commission_fixed'];
                }

            }
            
            // Action hook to adjust items commission rates before save.
            $order->update_meta_data('multivendorx_order_items_commission_rates', apply_filters('mvx_vendor_order_items_commission_rates', $commission_rates, $order));
            
            if ( MultiVendorX()->setting->get_setting( 'commission_include_coupon' ) == 'store' && empty( MultiVendorX()->setting->get_setting( 'admin_coupon_excluded' )) ) {
                $total_discount = $order->get_discount_total();
                $commission_amount = (float) $commission_amount - (float) $total_discount;
            }

            // $order->save(); // Avoid using save() if it will save letter in same flow.

            // && !get_user_meta($vendor_id, '_vendor_give_shipping', true)
            // && !get_user_meta($vendor_id, '_vendor_give_tax', true)
            // transfer shipping charges
            if ( !empty(MultiVendorX()->setting->get_setting('give_shipping')) ) {
                $shipping_amount = $order->get_shipping_total();
            }
            // transfer tax charges
            foreach ( $order->get_items( 'tax' ) as $key => $tax ) { 
                if ( MultiVendorX()->setting->get_setting('give_tax') == 'full_tax' && MultiVendorX()->setting->get_setting('give_shipping') ) {
                    $tax_amount += $tax->get_tax_total();
                    $shipping_tax_amount = $tax->get_shipping_tax_total();
                } else if ( MultiVendorX()->setting->get_setting('give_tax') == 'full_tax' ) {
                    $tax_amount += $tax->get_tax_total();
                    $shipping_tax_amount = 0;
                }

                if (MultiVendorX()->setting->get_setting('give_tax') == 'commision_based_tax' ) {
                    $tax_rate_id    = $tax->get_rate_id();
                    $tax_percent    = \WC_Tax::get_rate_percent( $tax_rate_id );
                    $tax_rate       = str_replace( '%', '', $tax_percent );
                    if ( $tax_rate ) {
                        $tax_amount = ( $commission_amount * $tax_rate ) / 100;
                    }
                }
            }

            // in commission total add facilitator_fee and gateway fee.
            $commission_total = (float) $commission_amount + (float) $shipping_amount + (float) $tax_amount + (float) $shipping_tax_amount;
            $commission_total = apply_filters( 'mvx_commission_total_amount', $commission_total, $commission_id );

            // insert | update commission into commission table.
            $data = [
                'order_id'              => $order->get_id(),
                'store_id'              => $store_id,
                'customer_id'           => $order->get_customer_id(),
                'total_order_amount'    => $order->get_total(),
                'commission_amount'     => $commission_amount,
                'shipping_amount'       => $shipping_amount,
                'tax_amount'            => $tax_amount,
                'shipping_tax_amount'   => $shipping_tax_amount,
                'discount_amount'       => $order->get_discount_total(),
                'commission_total'      => $commission_total,
                'currency'              => get_woocommerce_currency(),
                'status'                => $order->get_status() == 'cancelled' ? 'cancelled' : 'paid'
            ];
            $format = [ "%d", "%d", "%d", "%f", "%f", "%f", "%f", "%f", "%f", "%f", "%s", "%s" ];
            if ( ! $commission_id ) {
                $wpdb->insert( $wpdb->prefix . Utill::TABLES['commission'], $data, $format );
                $commission_id = $wpdb->insert_id;
            } else {
                $wpdb->update( $wpdb->prefix . Utill::TABLES['commission'], $data, ['ID' => $commission_id], $format );
            }

            return $commission_id;
        }
        return false;
    }

    /**
     * Get commission value of a item.
     * @param   int $product_id
     * @param   int $item_id
     * @param   object $item
     * @param   object $order
     * @param   object $vendor
     * @return  float
     */
    public function get_item_commission( $product_id, $item_id, $item, $order, $vendor ) {
        $amount = 0;
        $commission = [];
        $product_value_total = 0;

        // Check order coupon created by vendor or not
        $store_coupon = false;
        if ( $order->get_coupon_codes() ) {
            foreach ( $order->get_coupon_codes() as $coupon_code ) {
                $coupon   = new \WC_Coupon( $coupon_code );
                $store_id = (int) get_post_meta( $coupon->get_id(), 'multivendorx_store_id', true );

                if ( $store_id && Store::get_store_by_id( $store_id ) ) {
                    $store_coupon = true;
                }
            }
        }


        // Calculate item total based on condition
        if ( MultiVendorX()->setting->get_setting( 'commission_include_coupon' ) == 'seperate' && empty( MultiVendorX()->setting->get_setting( 'admin_coupon_excluded' ) ) && !$store_coupon ) {
            $line_total = $order->get_item_total( $item, false, false ) * $item['qty'];
        } else {
            $line_total = $order->get_item_subtotal( $item, false, false ) * $item['qty'];
        }
        // Filter the item total before calculating item commission.
        $line_total = apply_filters( 'mvx_get_commission_line_total', $line_total, $item, $order );

        if ( $product_id && $vendor ) {
            
            // Get the commission info of the product.
            $commission = $this->get_commission_amount( $product_id, $item, $vendor );

            // Filter to adjust commission before use.
            $commission = apply_filters('mvx_get_commission_amount', $commission, $product_id, $vendor->term_id, $item, $order);
            
            $commission_type = MultiVendorX()->setting->get_setting( 'commission_type' );

            if ( !empty($commission) && $commission_type == 'per_item' ) {
                $amount = (float) $line_total * ( (float) $commission['commission_val'] / 100 ) + ((float) $commission['commission_fixed'] * $item['qty']);
            }


            // if ( MultiVendorX()->setting->get_setting( 'revenue_sharing_mode' ) ) {
            //     if ( MultiVendorX()->setting->get_setting( 'revenue_sharing_mode' ) == 'revenue_sharing_mode_admin' ) {
            //         $amount = (float) $line_total - (float) $amount;
            //         if ( $amount < 0 ) {
            //             $amount = 0;
            //         }
            //     }
            // }

            $product_value_total += $item->get_total();

            if ( apply_filters( 'mvx_admin_pay_commission_more_than_order_amount', true ) && $amount > $product_value_total) {
                $amount = $product_value_total;
            }
        }

        return apply_filters( 'vendor_commission_amount', $amount, $product_id, $item, $order );
    }

    /**
     * Get the commission amount associate with a product.
     * @param   mixed $product_id
     * @param   mixed $variation_id
     * @param   mixed $item
     * @param   mixed $vendor
     * @return  array | bool
     */
    //product
    //category
    //store
    //global

    public function get_commission_amount( $product_id, $item, $vendor ) {
        $data = [];
        $product = wc_get_product( $product_id );
        
        if ( $product && $vendor ) {

            // Variable Product 
            $data['commission_val'] = $product->get_meta('multivendorx_variable_product_percentage_commission', true);
            $data['commission_fixed'] = $product->get_meta('multivendorx_variable_product_fixed_commission', true);

            if ( ! empty( $data['commission_val'] ) || ! empty( $data['commission_fixed'] ) ) {
                return $data;
            }

            // Simple Product
            $data['commission_val'] = $product->get_meta('multivendorx_product_percentage_commission', true);
            $data['commission_fixed'] = $product->get_meta('multivendorx_product_fixed_commission', true);

            if ( ! empty( $data['commission_val'] ) || ! empty( $data['commission_fixed'] ) ) {
                return $data;
            }
            
            // Category
            $category_wise_commission = $this->get_category_wise_commission( $product );
            if ( $category_wise_commission && $category_wise_commission->commission_percentage || $category_wise_commission->commission_fixed ) {
                return [
                    'commission_val' => $category_wise_commission->commission_percentage,
                    'commission_fixed' => $category_wise_commission->commission_fixed
                ];
            }
            
            // store commission
            $store_commission_percentage = (float) ($vendor->get_meta('commission_percentage') ?? 0);
            $store_commission_fixed = (float) ($vendor->get_meta('commission_fixed') ?? 0);
           
            if ( $store_commission_percentage > 0 || $store_commission_fixed > 0 ) {
                return [
                    'commission_val' => $store_commission_percentage,
                    'commission_fixed' => $store_commission_fixed
                ]; 
            }

            // Global 
            $commission_per_item = reset(MultiVendorX()->setting->get_setting( 'commission_per_item' ));

            if ( ! empty($commission_per_item) ) {
                return [
                    'commission_val' => $commission_per_item['commission_percentage'],
                    'commission_fixed' => $commission_per_item['commission_fixed']
                ];
            }
        }
        return false;
    }

    /**
     * Calculate category lebel commission of a product.
     * @param   object $product
     * @return  \stdClass | null
     */
    public function get_category_wise_commission( $product ) {

        // Get the terms => ['product_cat'] of the prodcut.
        $terms = get_the_terms( $product->get_id(), 'product_cat' );
        if ( !$terms || is_wp_error( $terms ) ) {
            return null;
        }
        $max_commission_amount = PHP_INT_MIN;
        $max_commission_term = null;

        foreach ( $terms as $term ) {
            // calculate current term's commission.
            $total_commission_amount = 0;
            $commission_percentage = (float) get_term_meta( $term->term_id, 'multivendorx_category_percentage_commission', true );
            $commission_fixed = (float) get_term_meta( $term->term_id, 'multivendorx_category_fixed_commission', true );
            $total_commission_amount = $commission_percentage + $commission_fixed;

            // compare current term's commission with previously store term's commission.
            if ( $total_commission_amount > $max_commission_amount ) {
                $max_commission_amount = $total_commission_amount;
                $max_commission_term = $term;
            }
        }

        // Store commission value of maximum commission category.
        $category_wise_commission = new \stdClass();
        $category_wise_commission->commission_percentage = (float) ( get_term_meta( $max_commission_term->term_id, 'multivendorx_category_percentage_commission', true ) ?? 0 );
        $category_wise_commission->commission_fixed = (float) ( get_term_meta( $max_commission_term->term_id, 'multivendorx_category_fixed_commission', true ) ?? 0 );

        // Filter hook to adjust category wise commission after calculation.
        return apply_filters( 'mvx_category_wise_commission', $category_wise_commission, $product );
    }

    /**
     * Summary of calculate_commission_refunds
     * @param   mixed $vendor_order
     * @param   mixed $refund_id
     * @return  void
     */
    public function calculate_commission_refunds( $vendor_order, $refund_id ) {
        // $refund = new \WC_Order_Refund( $refund_id );
        $commission_id = $vendor_order->get_props( '_commission_id' );
        $vendor_id = $vendor_order->get_props( '_vendor_id', true );
        
        $commission_amount = get_post_meta( $commission_id, '_commission_amount', true);
        $included_coupon = get_post_meta( $commission_id, '_commission_include_coupon', true) ? true : false;
        $included_tax = get_post_meta( $commission_id, '_commission_total_include_tax', true) ? true : false;
        $items_commission_rates = $vendor_order->get_meta( 'multivendorx_order_items_commission_rates', true);
        
        $refunded_total = $refunds = $global_refunds = $commission_refunded_items = array();

        if($commission_id){
            $line_items_commission_refund = $global_commission_refund = 0;
            foreach ($vendor_order->get_refunds() as $_refund) {
                $line_items_refund = $shipping_item_refund = $tax_item_refund = $amount = $refund_item_totals = 0;
                // if commission refund exists
                if ($_refund->get_meta('_refunded_commissions', true)) {
                    $commission_amt = get_post_meta($_refund->get_id(), '_refunded_commissions', true);
                    $refunds[$_refund->get_id()][$commission_id] = $commission_amt[$commission_id];
                }
                /** WC_Order_Refund items **/
                foreach ($_refund->get_items() as $item_id => $item) { 
                    $refunded_item_id = $item['refunded_item_id'];
                    $refund_amount = $item['line_total'];
                    $refunded_item_id = $item['refunded_item_id'];
                    
                    if ($refund_amount != 0) { 
                        $refunded_total[$commission_id] += $refund_amount;
                        $line_items_refund += $refund_amount;
                        
                        if(isset($items_commission_rates[$refunded_item_id])){
                            if ($items_commission_rates[$refunded_item_id]['type'] == 'fixed_with_percentage') {
                                $amount = (float) $refund_amount * ( (float) $items_commission_rates[$refunded_item_id]['commission_val'] / 100 ) + (float) $items_commission_rates[$refunded_item_id]['commission_fixed'];
                            } else if ($items_commission_rates[$refunded_item_id]['type'] == 'fixed_with_percentage_qty') {
                                $amount = (float) $refund_amount * ( (float) $items_commission_rates[$refunded_item_id]['commission_val'] / 100 ) + ((float) $items_commission_rates[$refunded_item_id]['commission_fixed'] * $item['quantity']);
                            } else if ($items_commission_rates[$refunded_item_id]['type'] == 'percent') {
                                $amount = (float) $refund_amount * ( (float) $items_commission_rates[$refunded_item_id]['commission_val'] / 100 );
                            } else if ($items_commission_rates[$refunded_item_id]['type'] == 'fixed') {
                                $amount = (float) $items_commission_rates[$refunded_item_id]['commission_val'] * $item['quantity'];
                            }
                            if (isset($items_commission_rates[$refunded_item_id]['mode']) && $items_commission_rates[$refunded_item_id]['mode'] == 'admin') {
                                $amount = (float) $refund_amount - (float) $amount;
                            }
                            $line_items_commission_refund += $amount;
                            $refund_item_totals += $amount;
                            $commission_refunded_items[$_refund->get_id()][$refunded_item_id] = $amount;
                        }
                    }
                }
                // add items total refunds
                $refunds[$_refund->get_id()][$commission_id]['line_item'] = $refund_item_totals;
                
                if($line_items_commission_refund != 0){
                    update_post_meta( $commission_id, '_commission_refunded_items', $line_items_commission_refund );
                    update_post_meta( $commission_id, '_commission_refunded_items_data', $commission_refunded_items );
                }
                
                /** WC_Order_Refund shipping **/
                $refund_shipping_totals = 0;
                foreach ($_refund->get_items('shipping') as $item_id => $item) { 
                    if ( 0 < get_post_meta($commission_id, '_shipping', true) && get_post_meta($commission_id, '_commission_total_include_shipping', true) ){
                        if($item['total'] != 0){
                            $shipping_item_refund += $item['total'];
                            $refund_shipping_totals += $item['total'];
                        }
                    }
                }
                if($shipping_item_refund != 0){
                    $amount = $shipping_item_refund;
                    if( $refund_shipping_totals )
                        $refunds[$_refund->get_id()][$commission_id]['shipping'] = $refund_shipping_totals;
                    update_post_meta( $commission_id, '_commission_refunded_shipping', $shipping_item_refund );
                }
                
                /** WC_Order_Refund tax **/
                $refund_tax_totals = 0;
                foreach ($_refund->get_items('tax') as $item_id => $item) { 
                    if ( 0 < get_post_meta($commission_id, '_tax', true) && get_post_meta($commission_id, '_commission_total_include_tax', true) ){
                        if($item['tax_total'] != 0 || $item['shipping_tax_total'] != 0){
                            $tax_item_refund += $item['tax_total'] + $item['shipping_tax_total'];
                            $refund_tax_totals += $item['tax_total'] + $item['shipping_tax_total'];
                        }
                    }
                }
                if($tax_item_refund != 0){
                    $amount = $tax_item_refund;
                    if( $refund_tax_totals )
                        $refunds[$_refund->get_id()][$commission_id]['tax'] = $refund_tax_totals;
                    update_post_meta( $commission_id, '_commission_refunded_tax', $tax_item_refund );
                }
                
                // if global refund applied in this refund
                $refund_amount = $_refund->get_amount() - abs( $line_items_refund );
                if ( !$_refund->get_items() && !$_refund->get_items('shipping') && !$_refund->get_items('tax') ) {
                    $global_refunds[$_refund->get_id()] = $_refund;
                }
                
            }
   
            // global refund calculation
            foreach ( $global_refunds as $_refund ) {
                //$rate_to_refund = $_refund->get_amount() / $order->get_total();
                //$commission_total = MVX_Commission::commission_totals($commission_id, 'edit');

                if(!$_refund->get_meta('_refunded_commissions', true)){
                    $refunds[$_refund->get_id()][$commission_id]['global'] = $_refund->get_amount() * -1;
                    $global_commission_refund += $_refund->get_amount() * -1;
                }else{
                    $refunded_commission = $_refund->get_meta('_refunded_commissions', true);
                    $refunded_commission_amt_data = isset($refunded_commission[$commission_id]) ? $refunded_commission[$commission_id] : array();
                    $refunded_commission_amt = array_sum($refunded_commission_amt_data);
                    $global_commission_refund += $refunded_commission_amt;
                }
            }
            if($global_commission_refund != 0){
                update_post_meta( $commission_id, '_commission_refunded_global', $global_commission_refund );
            }
       
            // update the refunded commissions in the order to easy manage these in future
            $refunded_amt_total = 0;
            if($refunds) :
                foreach ( $refunds as $_refund_id => $commissions_refunded ) {
                    $comm_refunded_amt = $commissions_refunded_total = 0;
                    foreach ( $commissions_refunded as $commission_id => $data_amount ) {
                        $amount = array_sum($data_amount);
                        $commissions_refunded_total = $amount;
                        if( -($amount) != 0 ){
                            $comm_refunded_amt += $amount;
                            $note = sprintf( __( 'Refunded %s from commission', 'multivendorx' ), wc_price( abs( $amount ) ) );
                            if($_refund_id == $refund_id){
                                MVX_Commission::add_commission_note($commission_id, $note, $vendor_id);
                                /**
                                 * Action hook after add commission refund note.
                                 *
                                 * @since 3.4.0
                                 */
                                do_action( 'mvx_create_commission_refund_after_commission_note', $commission_id, $data_amount, $refund_id, $vendor_order );
                            }
                            //update_post_meta( $commission_id, '_commission_amount', $amount );

                            //if( $amount == 0 ) update_post_meta($commission_id, '_paid_status', 'cancelled');
                        }
                    }
                    $refunded_amt_total += $comm_refunded_amt;

                    update_post_meta( $_refund_id, '_refunded_commissions', $commissions_refunded );
                    update_post_meta( $_refund_id, '_refunded_commissions_total', $commissions_refunded_total );
                }
                
                update_post_meta( $commission_id, '_commission_refunded_data', $refunds );
                update_post_meta( $commission_id, '_commission_refunded', $refunded_amt_total );
                // Trigger notification emails.
                if ( MVX_Commission::commission_totals($commission_id, 'edit') == 0  ) {
                    do_action( 'mvx_commission_fully_refunded', $commission_id, $vendor_order );
                    update_post_meta($commission_id, '_paid_status', 'refunded'); 
                } else {
                    do_action( 'mvx_commission_partially_refunded', $commission_id, $vendor_order );
                    update_post_meta($commission_id, '_paid_status', 'partial_refunded');
                }
                /**
                 * Action hook after commission refund save.
                 *
                 * @since 3.4.0
                 */
                do_action('mvx_after_create_commission_refunds', $vendor_order, $commission_id);
            endif;
        }
    }
}
