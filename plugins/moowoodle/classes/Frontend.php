<?php
/**
 * Frontend class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

/**
 * MooWoodle Frontend class
 *
 * @version     PRODUCT_VERSION
 * @package     MooWoodle
 * @author      DualCube
 */
class Frontend {
	/**
     * Frontend constructor.
     */
	public function __construct() {
		// Reset cart quantities after update.
		add_action( 'woocommerce_cart_updated', array( $this, 'update_cart_quantity' ) );
		add_action( 'woocommerce_product_options_pricing', array( $this, 'moowoodle_admin_price_notice' ) );
	}

	/**
	 * Enforce quantity restriction based on plugin version and settings.
	 */
	public function update_cart_quantity() {
		$group_purchase_enabled = MooWoodle()->setting->get_setting( 'group_purchase_enable', array() );

		if ( in_array( 'group_purchase_enable', $group_purchase_enabled, true ) && MooWoodle()->util->is_khali_dabba() ) {
			return;
		}

		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			if ( $cart_item['quantity'] > 1 ) {
				WC()->cart->set_quantity( $cart_item_key, 1 );
			}
		}
	}
	/**
	 * Displays a custom admin notice after the product price input
	 * on the WooCommerce product edit screen.
	 */
	public function moowoodle_admin_price_notice() {
		if ( ! MooWoodle()->util->is_khali_dabba() ) {
			printf(
				'<div class="notice notice-info inline"><p>%s</p></div>',
				esc_html__( 'In the free version, each product is limited to a quantity of 1 per cart. Upgrade to Pro for unlimited quantities!', 'moowoodle' )
			);
		}
	}
}
