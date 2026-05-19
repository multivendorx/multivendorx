<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Block Checkout class.
 */
class Block_Checkout {

	/**
	 * Constructor.
	 */
	public function __construct() {

		add_action('init',array( $this, 'register_checkout_update_callback' ),20);
		add_action('woocommerce_checkout_create_order',array( $this, 'save_order_meta' ),20,2);

		// add_filter('woocommerce_cart_shipping_packages',array( $this, 'add_user_location_to_shipping_package' ));
	}

	/**
	 * Register Store API checkout update callback.
	 *
	 * @return void
	 */
	public function register_checkout_update_callback() {

		if ( ! function_exists( 'woocommerce_store_api_register_update_callback' ) ) {
			return;
		}

		woocommerce_store_api_register_update_callback(
			array(
				'namespace' => 'multivendorx',
				'callback'  => array( $this, 'update_checkout_location' ),
			)
		);
	}

	/**
	 * Handle checkout location updates from frontend.
	 *
	 * @param array $data Incoming frontend data.
	 *
	 * @return void
	 */
	public function update_checkout_location( $data ) {

		if ( empty( $data ) || ! is_array( $data ) ) {
			return;
		}

		$user_location = sanitize_text_field(
			$data['user_location'] ?? ''
		);

		$user_lat = sanitize_text_field(
			$data['user_location_lat'] ?? ''
		);

		$user_lng = sanitize_text_field(
			$data['user_location_lng'] ?? ''
		);

		/**
		 * Store location data in WooCommerce session.
		 */
		if ( function_exists( 'WC' ) && WC()->session ) {

			WC()->session->set(
				'_multivendorx_user_location',
				$user_location
			);

			WC()->session->set(
				'_multivendorx_user_location_lat',
				$user_lat
			);

			WC()->session->set(
				'_multivendorx_user_location_lng',
				$user_lng
			);
		}
	}

	/**
	 * Save location data into order meta.
	 *
	 * @param \WC_Order $order Order object.
	 * @param array     $data  Checkout data.
	 *
	 * @return void
	 */
	public function save_order_meta( $order, $data ) {

		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return;
		}

		$user_location = WC()->session->get(
			'_multivendorx_user_location'
		);

		$user_lat = WC()->session->get(
			'_multivendorx_user_location_lat'
		);

		$user_lng = WC()->session->get(
			'_multivendorx_user_location_lng'
		);

		/**
		 * Save order meta values.
		 */
		if ( ! empty( $user_location ) ) {

			$order->update_meta_data(
				'_multivendorx_user_location',
				$user_location
			);
		}

		if ( ! empty( $user_lat ) ) {

			$order->update_meta_data(
				'_multivendorx_user_location_lat',
				$user_lat
			);
		}

		if ( ! empty( $user_lng ) ) {

			$order->update_meta_data(
				'_multivendorx_user_location_lng',
				$user_lng
			);
		}
	}

	/**
	 * Add user location data to shipping packages.
	 *
	 * @param array $packages Shipping packages.
	 *
	 * @return array
	 */
	public function add_user_location_to_shipping_package( $packages ) {

		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return $packages;
		}

		foreach ( $packages as $index => $package ) {

			$packages[ $index ]['multivendorx_user_location'] = WC()->session->get(
				'_multivendorx_user_location'
			);

			$packages[ $index ]['multivendorx_user_location_lat'] = WC()->session->get(
				'_multivendorx_user_location_lat'
			);

			$packages[ $index ]['multivendorx_user_location_lng'] = WC()->session->get(
				'_multivendorx_user_location_lng'
			);
		}

		return $packages;
	}
}