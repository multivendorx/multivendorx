<?php

namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Social_Icons;
use MultiVendorX\Elementor\StoreHelper;

class Store_Social extends Widget_Social_Icons {


	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_social';
	}

	public function get_title() {
		return __( 'Store Social', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-social-icons';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
			'social_icon_list',
			array(
				'default' => array(
					array(
						'social_icon' => array(
							'value'   => 'fab fa-facebook',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value'   => 'fab fa-twitter',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value'   => 'fab fa-instagram',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value'   => 'fab fa-youtube',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value'   => 'fab fa-pinterest',
							'library' => 'fa-brands',
						),
					),
				),
			)
		);
	}

	protected function render() {
		$store = $this->get_store_data();
		if ( ! $store ) {
			return;
		}

		$settings = $this->get_settings_for_display();

		// 5. Logic: Use the dynamic store name
		$name = ! empty( $store['storeName'] ) ? $store['storeName'] : $settings['title'];

		$tag = $settings['header_size'];

		printf(
			'<%1$s class="multivendorx-store-name elementor-heading-title">%2$s</%1$s>',
			esc_attr( $tag ),
			esc_html( $name )
		);
	}
}
