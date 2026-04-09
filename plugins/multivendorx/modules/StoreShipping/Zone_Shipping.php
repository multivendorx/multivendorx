<?php
/**
 * MultiVendorX Shipping Zone.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

use MultiVendorX\StoreShipping\Util;
use MultiVendorX\Utill;
use WC_Shipping_Zones;
defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Shipping Zone.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Zone_Shipping extends \WC_Shipping_Method {

    /**
     * Default option.
     *
     * @var string
     */
    public $default_option;

    /**
     * Default option.
     *
     * @var string
     */
    public $default;

    /**
     * Fee cost.
     *
     * @var string
     */
    public $fee_cost;

    /**
     * Constructor.
     *
     * @param int $instance_id Shipping zone instance ID.
     */
    public function __construct( $instance_id = 0 ) {
        $this->id                 = 'multivendorx_store_shipping';
        $this->instance_id        = absint( $instance_id );
        $this->method_title       = __( 'Store Shipping', 'multivendorx' );
        $this->method_description = __( 'Charge varying rates based on user defined conditions', 'multivendorx' );
        $this->supports           = array( 'shipping-zones', 'instance-settings', 'instance-settings-modal' );
        $this->default            = '';

        $zone_wise_shipping = $shipping_modules['zone-wise-shipping'] ?? array();

        // Enable / disable module.
        $this->enabled = ( ! empty( $zone_wise_shipping['enable'] ) && $zone_wise_shipping['enable'] )
            ? 'yes'
            : 'no';

        // Initialize settings.
        $this->init();

        // additional hooks for post-calculations settings.
        add_filter( 'woocommerce_shipping_chosen_method', array( $this, 'select_default_rate' ), 10, 2 );
        add_filter( 'woocommerce_package_rates', array( $this, 'woocommerce_package_rates' ), 99, 2 );

        add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
    }


    /**
     * Evaluate a cost from a sum/string.
     *
     * @param  string $sum Sum to evaluate.
     * @param  array  $args Arguments passed to the filter.
     * @return string
     */
    protected function evaluate_cost( $sum, $args = array() ) {
        include_once WC()->plugin_path() . '/includes/libraries/class-wc-eval-math.php';

        // Allow 3rd parties to process shipping cost.
        $args           = apply_filters( 'woocommerce_evaluate_shipping_cost_args', $args, $sum, $this );
        $locale         = localeconv();
        $decimals       = array( wc_get_price_decimal_separator(), $locale['decimal_point'], $locale['mon_decimal_point'], ',' );
        $this->fee_cost = $args['cost'];

        // Expand shortcodes.
        add_shortcode( 'fee', array( $this, 'fee' ) );

        $sum = do_shortcode(
            str_replace(
                array( '[qty]', '[cost]' ),
                array( $args['qty'], $args['cost'] ),
                $sum
            )
        );

        remove_shortcode( 'fee', array( $this, 'fee' ) );

        // Remove whitespace from string.
        $sum = preg_replace( '/\s+/', '', $sum );

        // Remove locale from string.
        $sum = str_replace( $decimals, '.', $sum );

        // Trim invalid start/end characters.
        $sum = rtrim( ltrim( $sum, "\t\n\r\0\x0B+*/" ), "\t\n\r\0\x0B+-*/" );

        return $sum ? \WC_Eval_Math::evaluate( $sum ) : 0;
    }

    /**
     * Force WooCommerce to recalculate shipping
     */
    public function multivendorx_force_shipping_recalculation() {
        WC()->cart->calculate_shipping();
    }

    /**
     * Work out fee (shortcode).
     *
     * @param  array $atts Shortcode attributes.
     * @return string
     */
    public function fee( $atts ) {
        $atts = shortcode_atts(
            array(
				'percent' => '',
				'min_fee' => '',
				'max_fee' => '',
            ),
            $atts,
            'fee'
        );

        $calculated_fee = 0;

        if ( $atts['percent'] ) {
            $calculated_fee = $this->fee_cost * ( floatval( $atts['percent'] ) / 100 );
        }

        if ( $atts['min_fee'] && $calculated_fee < $atts['min_fee'] ) {
            $calculated_fee = $atts['min_fee'];
        }

        if ( $atts['max_fee'] && $calculated_fee > $atts['max_fee'] ) {
            $calculated_fee = $atts['max_fee'];
        }

        return $calculated_fee;
    }

    /**
     * Get items in package.
     *
     * @param  array $package Package being shipped.
     * @return int
     */
    public function get_package_item_qty( $package ) {
        $total_quantity = 0;
        foreach ( $package['contents'] as $item_id => $values ) {
            if ( $values['quantity'] > 0 && $values['data']->needs_shipping() ) {
                $total_quantity += $values['quantity'];
            }
        }
        return $total_quantity;
    }

    /**
     * Finds and returns shipping classes and the products with said class.
     *
     * @param mixed $package Package being shipped.
     *
     * @return array
     */
    public function find_shipping_classes( $package ) {
        $found_shipping_classes = array();

        foreach ( $package['contents'] as $item_id => $values ) {
            if ( $values['data']->needs_shipping() ) {
                $found_class = $values['data']->get_shipping_class();

                if ( ! isset( $found_shipping_classes[ $found_class ] ) ) {
                    $found_shipping_classes[ $found_class ] = array();
                }

                $found_shipping_classes[ $found_class ][ $item_id ] = $values;
            }
        }
        return $found_shipping_classes;
    }

    /**
     * Init function.
     * initialize variables to be used
     *
     * @access public
     * @return void
     */
    public function init() {
        $this->instance_form_fields = array(
            'title'      => array(
                'title'       => __( 'Method title', 'multivendorx' ),
                'type'        => 'text',
                'description' => __( 'This controls the title which the user sees during checkout.', 'multivendorx' ),
                'default'     => __( 'Store Shipping', 'multivendorx' ),
                'desc_tip'    => true,
            ),
            'tax_status' => array(
                'title'   => __( 'Tax status', 'multivendorx' ),
                'type'    => 'select',
                'class'   => 'wc-enhanced-select',
                'default' => 'taxable',
                'options' => array(
                    'taxable' => __( 'Taxable', 'multivendorx' ),
                    'none'    => _x( 'None', 'Tax status', 'multivendorx' ),
                ),
            ),
        );

        $this->title      = $this->get_option( 'title' );
        $this->tax_status = $this->get_option( 'tax_status' );
    }

    /**
     * Calculate_shipping function.
     *
     * @access public
     * @param array $package (default: array()).
     * @return void
     */
    public function calculate_shipping( $package = array() ) {
        $rates = array();

        // Group products by store ID.
        $products        = $package['contents'];
        $seller_products = array();

        foreach ( $products as $product ) {
            $store_id = get_post_meta( $product['product_id'], Utill::POST_META_SETTINGS['store_id'], true );
            if ( ! empty( $store_id ) && self::is_shipping_enabled_for_seller( $store_id ) ) {
                $seller_products[ (int) $store_id ][] = $product;
            }
        }

        if ( empty( $seller_products ) ) {
            return; // no store info found.
        }

        // Loop through each store.
        foreach ( $seller_products as $store_id => $products ) {
            $zone             = WC_Shipping_Zones::get_zone_matching_package( $package );
            $shipping_methods = Util::get_shipping_methods( $zone->get_id(), $store_id );

            if ( empty( $shipping_methods ) ) {
                continue;
            }
            // Filter shipping methods (optional).
            $shipping_methods = apply_filters( 'mvx_get_shipping_methods_for_shipping_address', $shipping_methods, $package, $store_id );
            foreach ( $shipping_methods as $key => $method ) {
                $tax_rate  = ( 'none' === $method['settings']['tax_status'] ) ? false : '';
                $has_costs = false;
                $cost      = 0;

                if ( 'yes' !== $method['enabled'] ) {
                    continue;
                }

                // Flat rate shipping.
                if ( 'flat_rate' === $method['id'] ) {
                    $setting_cost = isset( $method['settings']['cost'] ) ? stripslashes_deep( $method['settings']['cost'] ) : '';

                    if ( '' !== $setting_cost ) {
                        $has_costs = true;
                        $cost      = $this->evaluate_cost(
                            $setting_cost,
                            array(
								'qty'  => $this->get_package_item_qty( $package ),
								'cost' => $package['contents_cost'],
                            )
                        );
                    }

                    // Shipping class costs.
                    $shipping_classes = WC()->shipping->get_shipping_classes();

                    if ( ! empty( $shipping_classes ) ) {
                        $found_shipping_classes = $this->find_shipping_classes( $package );
                        $highest_class_cost     = 0;
                        $calculation_type       = ! empty( $method['settings']['calculation_type'] ) ? $method['settings']['calculation_type'] : 'class';

                        foreach ( $found_shipping_classes as $shipping_class => $products_in_class ) {
                            $shipping_class_term = get_term_by( 'slug', $shipping_class, Utill::WORDPRESS_SETTINGS['product_shipping_class'] );

                            if ( $shipping_class_term && $shipping_class_term->term_id ) {
                                $term_id = $shipping_class_term->term_id;
                                $key     = 'class_cost_' . $term_id;

                                // 1. Class specific cost: class_cost_12
                                if ( ! empty( $method['settings'][ $key ] ) ) {
                                    $class_cost_string = stripslashes_deep( $method['settings'][ $key ] );
                                } elseif ( ! empty( $method['settings']['class_cost'] ) ) { // 2. Fallback to generic class_cost
                                    $class_cost_string = stripslashes_deep( $method['settings']['class_cost'] );
                                } else { // 3. Nothing found.
                                    $class_cost_string = '';
                                }
                            } else {
                                // No class → use no_class_cost.
                                $class_cost_string = ! empty( $method['settings']['no_class_cost'] )
                                    ? $method['settings']['no_class_cost']
                                    : '';
                            }
                            // Skip if empty.
                            if ( '' === $class_cost_string ) {
                                continue;
                            }

                            $has_costs = true;

                            /**
                             * Evaluate shipping class expression
                             * Example: 10 * [qty]
                             */
                            $class_cost = $this->evaluate_cost(
                                $class_cost_string,
                                array(
									'qty'  => array_sum( wp_list_pluck( $products_in_class, 'quantity' ) ),
									'cost' => array_sum( wp_list_pluck( $products_in_class, 'line_total' ) ),
                                )
                            );

                            // Add or compare.
                            if ( 'class' === $calculation_type ) {
                                $cost += $class_cost;
                            } else {
                                $highest_class_cost = max( $highest_class_cost, $class_cost );
                            }
                        }
                    }
                } elseif ( 'free_shipping' === $method['id'] ) {
                    $is_available = self::free_shipping_is_available( $package, $method );

                    if ( $is_available ) {
                        $cost      = '0';
                        $has_costs = true;
                    }
                } elseif ( isset( $method['settings']['cost'] ) && '' !== $method['settings']['cost'] ) { // local pickup or other methods.
                        $has_costs = true;
                        $cost      = $method['settings']['cost'];
                }

                if ( ! $has_costs ) {
                    continue;
                }

                $rates[] = array(
                    'id'          => $this->get_method_rate_id( $method, $store_id ),
                    'label'       => $method['title'],
                    'cost'        => $cost,
                    'description' => ! empty( $method['settings']['description'] ) ? $method['settings']['description'] : '',
                    'taxes'       => $tax_rate,
                    'default'     => 'off',
                );
            }
        }

        // Apply filters.
        $rates = apply_filters( 'mvx_get_rates_for_custom_shipping', $rates, $package );

        // Send rates to WooCommerce.
        if ( is_array( $rates ) && count( $rates ) > 0 ) {
            foreach ( $rates as $rate ) {
                $this->add_rate( apply_filters( 'multivendorx_store_before_add_shipping_rates', $rate, $package ) );
            }
        }
    }

    /**
     * Check if shipping is enabled for a seller.
     *
     * @param int $store_id Store ID.
     *
     * @return bool True if shipping by zone is enabled, otherwise false.
     */
    public static function is_shipping_enabled_for_seller( $store_id ) {
        $store            = new \MultiVendorX\Store\Store( $store_id );
        $shipping_options = $store->meta_data['shipping_options'] ?? '';
        return 'shipping_by_zone' === $shipping_options;
    }

    /**
     * See if free shipping is available based on the package and cart.
     *
     * @param array $package Shipping package.
     * @param array $method Shipping method.
     *
     * @return bool
     */
    public static function free_shipping_is_available( $package, $method ) {
        if ( isset( $method['settings']['requires'] ) && 'coupon' === $method['settings']['requires'] ) {
            $coupon_code              = $package['applied_coupons'] ? reset( $package['applied_coupons'] ) : '';
            $coupon                   = new \WC_Coupon( $coupon_code );
            $is_free_shipping_enabled = $coupon->get_free_shipping();
            if ( $is_free_shipping_enabled ) {
                return true;
            }
        } else {
            $has_met_min_amount = false;
            $min_amount         = ! empty( $method['settings']['min_amount'] ) ? $method['settings']['min_amount'] : 0;

            $line_subtotal      = wp_list_pluck( $package['contents'], 'line_subtotal', null );
            $line_total         = wp_list_pluck( $package['contents'], 'line_total', null );
            $discount_total     = array_sum( $line_subtotal ) - array_sum( $line_total );
            $line_subtotal_tax  = wp_list_pluck( $package['contents'], 'line_subtotal_tax', null );
            $line_total_tax     = wp_list_pluck( $package['contents'], 'line_tax', null );
            $discount_tax_total = array_sum( $line_subtotal_tax ) - array_sum( $line_total_tax );

            $total = array_sum( $line_subtotal ) + array_sum( $line_subtotal_tax );

            if ( WC()->cart->display_prices_including_tax() ) {
				$total = round( $total - ( $discount_total + $discount_tax_total ), wc_get_price_decimals() );
            } else {
				$total = round( $total - $discount_total, wc_get_price_decimals() );
            }

            if ( $total >= $min_amount ) {
				$has_met_min_amount = true;
            }
            return apply_filters( 'mvx_shipping_free_shipping_is_available', $has_met_min_amount, $package, $method );
        }
    }

    /**
     * Split state code from country:state string
     *
     * @param string $value [like: IN:WB].
     *
     * @return string [like: WB ]
     */
    public function split_state_code( $value ) {
        $state_code = explode( ':', $value );
        return $state_code[1];
    }

    /**
     * Alter the default rate if one is chosen in settings.
     *
     * @param string $chosen_method      Chosen shipping method.
     * @param array  $_available_methods Available shipping methods.
     *
     * @return string Selected shipping method.
     */
    public function select_default_rate( $chosen_method, $_available_methods ) {
        // Select the 'Default' method from WooCommerce settings.
        if ( is_array( $_available_methods ) && array_key_exists( $this->default, $_available_methods ) ) {
            return $this->default;
        }

        return $chosen_method;
    }

    /**
     * Hide shipping rates when free shipping is available.
     * Updated to support WooCommerce 2.6 Shipping Zones.
     *
     * @access public
     *
     * @param array $rates Array of rates found for the package.
     *
     * @return array
     */
    public function hide_shipping_when_free_is_available( $rates ) {
        if ( 'yes' !== $this->hide_method ) {
			return $rates;
        }

        // determine if free shipping is available.
        $free_shipping = false;
        foreach ( $rates as $rate_id => $rate ) {
            if ( 'free_shipping' === $rate->method_id ) {
                $free_shipping = true;
                break;
            }
        }
        // if available, remove all options from this method.
        if ( $free_shipping ) {
            foreach ( $rates as $rate_id => $rate ) {
                if ( $this->id === $rate->method_id && strpos( $rate_id, $this->id . ':' . $this->instance_id . '-' ) !== false ) {
                    unset( $rates[ $rate_id ] );
                }
            }
        }

        return $rates;
    }

    /**
     * Hide shipping rates when one has option enabled.
     *
     * @access public
     *
     * @param array $rates Array of rates found for the package.
     *
     * @return array
     */
    public function hide_other_options( $rates ) {
        $hide_key = false;

        // return if no rates have been added.
        if ( ! isset( $rates ) || empty( $rates ) ) {
            return $rates;
        }

        // cycle through available rates.
        foreach ( $rates as $key => $rate ) {
            if ( 'on' === $rate['hide_ops'] ) {
                $hide_key = $key;
            }
        }

        if ( $hide_key ) {
            return array( $hide_key => $rates[ $hide_key ] );
        }

        return $rates;
    }

    /**
     * Get method rate ID.
     *
     * @param array $method Shipping method.
     * @param int   $store_id Store ID.
     *
     * @return string
     */
    public function get_method_rate_id( $method, $store_id = 0 ) {
        $store_id = $store_id ? $store_id : 0; // ensure store ID exists.
        $rate_id  = $this->id . ':' . $method['id'] . ':' . $method['instance_id'] . ':' . $store_id;
        return apply_filters( 'multivendorx_get_store_shipping_method_id', $rate_id );
    }

    /**
     * Filter shipping rates to keep only MultiVendorX store shipping methods.
     *
     * @param array $rates Array of rates found for the package.
     * @param array $package Package information.
     *
     * @return array
     */
    public function woocommerce_package_rates( $rates, $package ) {

        // Get products from the package.
        $products = isset( $package['contents'] ) ? $package['contents'] : array();

        if ( empty( $products ) ) {
            return $rates;
        }

        // Try to extract the store ID from any product in the package.
        $store_id = '';
        foreach ( $products as $product ) {
            if ( isset( $product['product_id'] ) ) {
                $id       = $product['product_id'];
                $store_id = get_post_meta( $id, Utill::POST_META_SETTINGS['store_id'], true );
                if ( ! empty( $store_id ) ) {
                    break;
                }
            }
        }

        // If no store found, keep all rates (don’t modify).
        if ( empty( $store_id ) ) {
            return $rates;
        }

        // Allow developers to disable filtering logic if needed.
        if ( ! apply_filters( 'multivendorx_allow_supported_shipping_in_store_shipping_package', true, $package, $store_id ) && $rates ) {

            // Keep only MultiVendorX store shipping methods.
            foreach ( $rates as $key => $shipping_rate ) {
                if ( 'multivendorx_store_shipping' !== $shipping_rate->method_id ) {
                    unset( $rates[ $key ] );
                }
            }
        }
        return $rates;
    }
}
