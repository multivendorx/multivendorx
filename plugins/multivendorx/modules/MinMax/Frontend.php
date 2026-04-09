<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\MinMax;

/**
 * MultiVendorX MinMax Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter( 'woocommerce_get_price_html', array( $this, 'add_min_max_to_shop_page' ), 10, 2 );
        add_filter( 'woocommerce_add_to_cart_validation', array( $this, 'validate_add_to_cart' ), 10, 4 );
        add_filter( 'woocommerce_add_cart_item', array( $this, 'update_cart_quantity' ) );

        add_filter( 'woocommerce_cart_item_quantity', array( $this, 'cart_quantity_message' ), 10, 3 );
        add_filter( 'woocommerce_cart_item_subtotal', array( $this, 'cart_amount_message' ), 10, 2 );
        add_filter( 'woocommerce_store_api_cart_errors', array( $this, 'cart_error_message_block' ), 10, 2 );

        add_filter( 'woocommerce_available_variation', array( $this, 'available_variation_min_max' ), 10, 3 );
        add_filter( 'woocommerce_quantity_input_args', array( $this, 'update_quantity_args' ), 10, 2 );

        add_action( 'woocommerce_cart_updated', array( $this, 'restrict_cart_quantity' ) );
        add_action( 'woocommerce_check_cart_items', array( $this, 'validate_order_rules' ) );

        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
        add_filter( 'woocommerce_loop_add_to_cart_link', array( $this, 'add_to_cart_link_min_qty' ), 10, 2 );
        add_filter( 'woocommerce_add_to_cart_quantity', array( $this, 'add_to_cart_min_qty' ), 10, 2 );
    }
    /**
     * Get min and max rules for a product or order context.
     *
     * @param int    $product_id Product ID. Default 0.
     * @param string $context    Rule context: 'quantity', 'amount', 'order_quantity', or 'order_amount'. Default 'quantity'.
     *
     * @return array {
     *     Array of min and max values.
     *
     *     @type int|float $min Minimum allowed value.
     *     @type int|float $max Maximum allowed value.
     * }
     */
    private function get_rules( $product_id = 0, $context = 'quantity' ) {

        $rules = array(
			'min' => 0,
			'max' => 0,
		);

        if ( $product_id ) {
            $meta = get_post_meta( $product_id, 'multivendorx_min_max_meta', true );
            if ( ! empty( $meta ) ) {
                $rules['min'] = (int) ( $meta[ "min_{$context}" ] ?? 0 );
                $rules['max'] = (int) ( $meta[ "max_{$context}" ] ?? 0 );

                if ( $rules['min'] || $rules['max'] ) {
                    return $rules;
                }
            }
        }

        switch ( $context ) {
            case 'quantity':
                $settings     = MultiVendorX()->setting->get_setting( 'product_quantity_rules', array() );
                $settings     = reset( $settings );
                $rules['min'] = (int) ( $settings['product_min_quantity'] ?? 0 );
                $rules['max'] = (int) ( $settings['product_max_quantity'] ?? 0 );
                break;

            case 'amount':
                $settings     = MultiVendorX()->setting->get_setting( 'product_amount_rules', array() );
                $settings     = reset( $settings );
                $rules['min'] = (float) ( $settings['product_min_amount'] ?? 0 );
                $rules['max'] = (float) ( $settings['product_max_amount'] ?? 0 );
                break;

            case 'order_quantity':
                $settings     = MultiVendorX()->setting->get_setting( 'order_quantity_rules', array() );
                $settings     = reset( $settings );
                $rules['min'] = (int) ( $settings['order_min_quantity'] ?? 0 );
                $rules['max'] = (int) ( $settings['order_max_quantity'] ?? 0 );
                break;

            case 'order_amount':
                $settings     = MultiVendorX()->setting->get_setting( 'order_amount_rules', array() );
                $settings     = reset( $settings );
                $rules['min'] = (float) ( $settings['order_min_amount'] ?? 0 );
                $rules['max'] = (float) ( $settings['order_max_amount'] ?? 0 );
                break;
        }

        return $rules;
    }
    /**
     * Validate a value against min/max rules.
     *
     * @param int|float $value         Value to validate.
     * @param int       $product_id    Product ID.
     * @param string    $context       Rule context: 'quantity', 'amount', 'order_quantity', or 'order_amount'.
     * @param bool      $return_number Whether to return the min/max number instead of a translated string. Default false.
     *
     * @return string|int|float Error message or min/max number if $return_number is true. Returns empty string if valid.
     */
    private function validate_rules( $value, $product_id, $context, $return_number = false ) {

        $rules = $this->get_rules( $product_id, $context );

        if ( $rules['min'] && $value < $rules['min'] ) {
            if ( 'quantity' === $context ) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                return $return_number ? $rules['min'] : __( 'Minimum product ' . $context . ' required is ' . $rules['min'], 'multivendorx' );
            }

            if ( 'amount' === $context ) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                return $return_number ? $rules['min'] : __( 'Minimum product ' . $context . ' required is ' . $rules['min'], 'multivendorx' );
            }

            if ( 'order_quantity' === $context ) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                return $return_number ? $rules['min'] : __( 'Minimum order quantity required is ' . $rules['min'], 'multivendorx' );
            }

            if ( 'order_amount' === $context ) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                return $return_number ? $rules['min'] : __( 'Minimum order amount required is ' . $rules['min'], 'multivendorx' );
            }
        }

        if ( $rules['max'] && $value > $rules['max'] ) {
            if ( 'quantity' === $context ) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                return $return_number ? $rules['max'] : __( 'Maximum product ' . $context . ' required is ' . $rules['max'], 'multivendorx' );
            }

            if ( 'amount' === $context ) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                return $return_number ? $rules['max'] : __( 'Maximum product ' . $context . ' required is ' . $rules['max'], 'multivendorx' );
            }

            if ( 'order_quantity' === $context ) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                return $return_number ? $rules['max'] : __( 'Maximum order quantity required is ' . $rules['max'], 'multivendorx' );
            }

            if ( 'order_amount' === $context ) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                return $return_number ? $rules['max'] : __( 'Maximum order amount required is ' . $rules['max'], 'multivendorx' );
            }
        }

        return '';
    }
    /**
     * Display minimum quantity and amount requirements on the shop page.
     *
     * @param string     $price   Current product price HTML.
     * @param WC_Product $product Product object.
     *
     * @return string Updated price HTML including min quantity/amount info.
     */
    public function add_min_max_to_shop_page( $price, $product ) {

        if ( 'external' === $product->get_type() ) {
            return $price;
        }

        $min_qty = $this->validate_rules( 0, $product->get_id(), 'quantity', true );
        $min_amt = $this->validate_rules( 0, $product->get_id(), 'amount', true );

        if ( ! $min_qty && ! $min_amt ) {
            return $price;
        }

        $html = '<div class="required">';
        if ( $min_qty ) {
            $html .= __( 'Min Qty: ', 'multivendorx' ) . $min_qty . ' ';
        }
        if ( $min_amt ) {
            $html .= __( 'Min Amount: ', 'multivendorx' ) . wc_price( $min_amt );
        }
        $html .= '</div>';

        return $price . $html;
    }
	/**
	 * Validate minimum quantity before adding a product to cart.
	 *
	 * @param bool $passed       Whether the add to cart check passed.
	 * @param int  $product_id   Product ID.
	 * @param int  $qty          Quantity being added to cart.
	 * @param int  $variation_id Variation ID, if applicable. Default 0.
	 *
	 * @return bool True if validation passed, false otherwise.
	 */
	public function validate_add_to_cart( $passed, $product_id, $qty, $variation_id = 0 ) {

		$id    = ! empty( $variation_id ) ? $variation_id : $product_id;
		$limit = $this->validate_rules( $qty, $id, 'quantity', true );

		if ( $limit && $qty < $limit ) {
			wc_add_notice(
                sprintf(
                /* translators: %d: minimum quantity required */
                    __( 'Minimum quantity required is %d', 'multivendorx' ),
                    $limit
                ),
                'error'
			);
			return false;
		}

		return $passed;
	}
    /**
     * Update cart item quantity if it violates minimum quantity rules.
     *
     * @param array $cart_item Cart item array.
     *
     * @return array Modified cart item array.
     */
    public function update_cart_quantity( $cart_item ) {

		$product_id = ! empty( $cart_item['variation_id'] ) ? $cart_item['variation_id'] : $cart_item['product_id'];
        $limit      = $this->validate_rules( $cart_item['quantity'], $product_id, 'quantity', true );

        if ( $limit ) {
            $cart_item['quantity'] = $limit;
        }

        return $cart_item;
    }
    /**
     * Append minimum/maximum quantity message to cart item HTML.
     *
     * @param string $html Current cart item HTML.
     * @param string $key  Cart item key.
     * @param array  $item Cart item array.
     *
     * @return string Modified cart item HTML with quantity message.
     */
    public function cart_quantity_message( $html, $key, $item ) {

		$id  = ! empty( $item['variation_id'] ) ? $item['variation_id'] : $item['product_id'];
        $msg = $this->validate_rules( $item['quantity'], $id, 'quantity' );

        return $msg ? $html . "<div class='required'>{$msg}</div>" : $html;
    }
    /**
     * Append minimum/maximum amount message to cart item HTML.
     *
     * Removes the default proceed-to-checkout button if a rule is violated.
     *
     * @param string $html Current cart item HTML.
     * @param array  $item Cart item array.
     *
     * @return string Modified cart item HTML with amount message.
     */
    public function cart_amount_message( $html, $item ) {
        $id  = ! empty( $item['variation_id'] ) ? $item['variation_id'] : $item['product_id'];
        $msg = $this->validate_rules( $item['line_subtotal'], $id, 'amount' );

        if ( $msg ) {
            remove_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );
            return $html . "<div class='required'>{$msg}</div>";
        } else {
            return $html;
        }
    }
    /**
     * Add cart-level error messages for quantity or amount rule violations.
     *
     * @param WP_Error $errors Cart error object.
     * @param WC_Cart  $cart   WooCommerce cart object.
     */
    public function cart_error_message_block( $errors, $cart ) {
        foreach ( $cart->get_cart() as $cart_item ) {
            $id = ! empty( $cart_item['variation_id'] )
                ? $cart_item['variation_id']
                : $cart_item['product_id'];

            $subtotal = $cart_item['line_subtotal'];
            $quantity = $cart_item['quantity'];

            $amount_msg   = $this->validate_rules( $subtotal, $id, 'amount' );
            $quantity_msg = $this->validate_rules( $quantity, $id, 'quantity' );

            if ( $amount_msg ) {
                $errors->add(
                    'multivendorx_amount_error',
                    $amount_msg,
                    array( 'severity' => 'error' )
                );
                break;
            }

            if ( $quantity_msg ) {
                $errors->add(
                    'multivendorx_quantity_error',
                    $quantity_msg,
                    array( 'severity' => 'error' )
                );
                break;
            }
        }
    }
    /**
     * Add minimum and maximum quantity rules to available variation data.
     *
     * @param array      $data      Variation data.
     * @param WC_Product $product   Parent product object.
     * @param WC_Product $variation Variation product object.
     *
     * @return array Modified variation data with min/max quantity included.
     */
    public function available_variation_min_max( $data, $product, $variation ) {

        $rules = $this->get_rules( $variation->get_id(), 'quantity' );

        if ( $rules['min'] ) {
            $data['min_qty']     = $rules['min'];
            $data['input_value'] = $rules['min'];
        }

        if ( $rules['max'] ) {
            $data['max_qty'] = $rules['max'];
        }

        return $data;
    }
    /**
     * Update quantity input arguments for a product based on min/max rules.
     *
     * @param array      $args    Quantity input args.
     * @param WC_Product $product Product object.
     *
     * @return array Modified quantity input args with min/max values.
     */
    public function update_quantity_args( $args, $product ) {

        $rules = $this->get_rules( $product->get_id(), 'quantity' );

        if ( $rules['min'] ) {
            $args['min_value'] = $rules['min'];
        }

        if ( $rules['max'] ) {
            $args['max_value'] = $rules['max'];
        }

        return $args;
    }

    /**
     * Restrict quantities in the cart to comply with min/max rules.
     *
     * Loops through all cart items and adjusts quantities if they are
     * outside the allowed min/max limits.
     */
    public function restrict_cart_quantity() {
        foreach ( WC()->cart->get_cart() as $key => $item ) {
            $id    = ! empty( $item['variation_id'] ) ? $item['variation_id'] : $item['product_id'];
            $rules = $this->get_rules( $id, 'quantity' );

            if ( $rules['max'] && $item['quantity'] > $rules['max'] ) {
                WC()->cart->set_quantity( $key, $rules['max'] );
            }

            if ( $rules['min'] && $item['quantity'] < $rules['min'] ) {
                WC()->cart->set_quantity( $key, $rules['min'] );
            }
        }
    }
    /**
     * Validate the overall order against min/max rules for quantity and amount.
     *
     * Adds WooCommerce notices if the cart violates order-level rules,
     * and prevents proceeding to checkout when errors exist.
     */
    public function validate_order_rules() {

        $qty = WC()->cart->get_cart_contents_count();
        $amt = WC()->cart->get_subtotal();

        $qty_error = $this->validate_rules( $qty, 0, 'order_quantity' );
        $amt_error = $this->validate_rules( $amt, 0, 'order_amount' );

        if ( $qty_error ) {
			wc_add_notice( $qty_error, 'error' );
        }
        if ( $amt_error ) {
			wc_add_notice( $amt_error, 'error' );
        }

        if ( $qty_error || $amt_error ) {
            remove_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );
            return;
        }
    }
    /**
     * Load frontend scripts required for quantity handling on product pages.
     *
     * Automatically sets variation quantity input to the variation's min value.
     */
    public function load_scripts() {
        if ( is_product() ) {
            wc_enqueue_js(
                "jQuery('body').on('show_variation',function(e,v){
                    jQuery('input.qty').val(v.input_value || 1);
                });"
            );
        }
    }
    /**
     * Add minimum quantity data attribute to the Add to Cart link.
     *
     * @param string     $html    Original Add to Cart HTML.
     * @param WC_Product $product Product object.
     *
     * @return string Modified Add to Cart HTML with min quantity attribute.
     */
    public function add_to_cart_link_min_qty( $html, $product ) {

        $min = $this->get_rules( $product->get_id(), 'quantity' )['min'];
        return $min ? str_replace( '<a ', '<a data-quantity="' . $min . '" ', $html ) : $html;
    }

    public function add_to_cart_min_qty( $quantity, $product_id ) {
        $min = $this->get_rules( $product_id, 'quantity' )['min'];
        if ( $min && $quantity < $min ) {
            return $min;
        }
        return $quantity;
    }
}
