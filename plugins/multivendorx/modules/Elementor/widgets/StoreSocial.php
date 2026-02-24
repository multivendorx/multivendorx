<?php

namespace MultiVendorX\Elementor\Widgets;

defined('ABSPATH') || exit;

use Elementor\Widget_Social_Icons;
use MultiVendorX\Elementor\StoreHelper;

class Store_Social extends Widget_Social_Icons
{

	use StoreHelper;

	public function get_name()
	{
		return 'multivendorx_store_social';
	}

	public function get_title()
	{
		return __('Store Social', 'multivendorx');
	}

	public function get_icon()
	{
		return 'eicon-social-icons';
	}

	public function get_categories()
	{
		return ['multivendorx'];
	}

	protected function register_controls()
	{
		parent::register_controls();

		$this->update_control(
			'social_icon_list',
			[
				'default' => [
					[
						'social_icon' => [
							'value' => 'fab fa-facebook',
							'library' => 'fa-brands',
						],
					],
					[
						'social_icon' => [
							'value' => 'fab fa-twitter',
							'library' => 'fa-brands',
						],
					],
					[
						'social_icon' => [
							'value' => 'fab fa-instagram',
							'library' => 'fa-brands',
						],
					],
					[
						'social_icon' => [
							'value' => 'fab fa-youtube',
							'library' => 'fa-brands',
						],
					],
					[
						'social_icon' => [
							'value' => 'fab fa-pinterest',
							'library' => 'fa-brands',
						],
					],
				],
			]
		);
	}

	protected function render() {
		$store = $this->get_store_data();
		if ( ! $store ) {
			return;
		}
		
		// -------------------------------
		// Render Dynamic Social Icons
		// -------------------------------
		$social_platforms = [
			'facebook'  => 'fab fa-facebook',
			'twitter'   => 'fab fa-twitter',
			'instagram' => 'fab fa-instagram',
			'youtube'   => 'fab fa-youtube',
			'pinterest' => 'fab fa-pinterest',
			'linkedin'  => 'fab fa-linkedin',
		];

		echo '<div class="multivendorx-store-social-icons">';

		foreach ( $social_platforms as $key => $icon_class ) {
			if ( ! empty( $store[ $key ] ) ) {
				printf(
					'<a href="%1$s" target="_blank" rel="noopener noreferrer"><i class="%2$s"></i></a>',
					esc_url( $store[ $key ] ),
					esc_attr( $icon_class )
				);
			}
		}

		echo '</div>';
	}
}
