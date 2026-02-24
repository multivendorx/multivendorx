<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Image;
use MultiVendorX\Elementor\StoreHelper;

class Store_Banner extends Widget_Image {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_banner';
	}

	public function get_title() {
		return __( 'Store Banner', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-image-box';
	}

	public function get_categories() {
		return [ 'multivendorx' ];
	}

	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
			'image',
			[
				'label' => __( 'Choose Banner', 'multivendorx' ),
				'dynamic' => [
					'active'  => true,
					'default' => '{{multivendorx-store-banner}}',
				],
			]
		);

		// Hide controls that might break a banner layout
		$this->remove_control( 'caption_source' );
		$this->remove_control( 'caption' );
	}

	protected function render() {

		$store = $this->get_store_data();
		if ( ! $store ) {
			return;
		}
		// Keep original key structure
		$banner = ! empty( $store['storeBanner'] ) ? $store['storeBanner'] : '';

		if ( empty( $banner ) ) {
			return;
		}

		// If banner is stored as attachment ID, convert to URL
		if ( is_numeric( $banner ) ) {
			$banner = wp_get_attachment_url( $banner );
		}

		printf(
			'<div class="multivendorx-store-banner">
				<img class="multivendorx-store-banner-img" src="%1$s" alt="%2$s" />
			</div>',
			esc_url( $banner ),
			esc_attr( $store['storeName'] ?? '' )
		);
	}
}