<?php

namespace MultiVendorX\Elementor\Widgets;

defined('ABSPATH') || exit;

use Elementor\Widget_Heading;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Description extends Widget_Heading{

	use StoreHelper;

	public function get_name()
	{
		return 'multivendorx_store_description';
	}

	public function get_title()
	{
		return __('Store Description', 'multivendorx');
	}

	public function get_icon()
	{
		return 'eicon-editor-paragraph';
	}

	public function get_categories()
	{
		return array('multivendorx');
	}

	protected function register_controls(){
		parent::register_controls();

		$this->update_control(
			'title',
			[
				'label'   => __('Default Description', 'multivendorx'),
				'type'    => Controls_Manager::TEXTAREA,
				'default' => __('No store description available.', 'multivendorx'),
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->update_control(
			'header_size',
			[
				'default' => 'p', 
			]
		);

		$this->remove_control('link');
	}

	protected function render() {
		$store = $this->get_store_data();
		if (! $store) {
			return;
		}

		$description = $store['storeDescription'] ?: $this->get_settings_for_display()['empty_text'];

		echo '<div class="multivendorx-store-description">';
		echo wp_kses_post(wpautop($description));
		echo '</div>';
	}
}
