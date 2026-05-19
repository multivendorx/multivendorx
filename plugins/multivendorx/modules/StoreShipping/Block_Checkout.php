<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

use MultiVendorX\FrontendScripts;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Block Checkout class.
 */
class Block_Checkout {

	/**
	 * Constructor.
	 */
	public function __construct() {
        add_filter( 'multivendorx_register_scripts', array( $this, 'register_script' ) );
        add_filter( 'multivendorx_localize_scripts', array( $this, 'localize_scripts' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );

		add_action('init',array( $this, 'register_checkout_update_callback' ),20);
		add_action('woocommerce_checkout_create_order',array( $this, 'save_order_meta' ),20,2);
	}
	/**
	 * Register follow store frontend script
	 *
	 * @param array $scripts Scripts array.
	 * @return array Modified scripts array
	 */
    public function register_script( $scripts ) {
        $base_url = MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name();

        $scripts['multivendorx-store-shipping-block-checkout'] = array(
            'src'  => $base_url . 'modules/StoreShipping/blocks/index.js',
        );

        return $scripts;
    }
    /**
	 * Localize follow store frontend script
	 *
	 * @param array $scripts Scripts array.
	 * @return array Modified scripts array
	 */
    public function localize_scripts( $scripts ) {

        $scripts['multivendorx-store-shipping-block-checkout'] = array(
            'object_name' => 'blockCheckout',
            'data'        => array(
                'settings' => MultiVendorX()->setting->get_option(Utill::MULTIVENDORX_SETTINGS['geolocation']),
            ),
        );

        return $scripts;
    }

    /**
     * Load follow store JS scripts
     */
    public function load_scripts() {
		if ( ! is_checkout() ) {
			return;
		}
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-store-shipping-block-checkout' );
        FrontendScripts::localize_scripts( 'multivendorx-store-shipping-block-checkout' );
		FrontendScripts::enqueue_style( 'multivendorx-store-tabs-style' );
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
}