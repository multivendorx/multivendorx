<?php

namespace MultiVendorX\Elementor\Widgets;

defined('ABSPATH') || exit;

use Elementor\Widget_Base;
use MultiVendorX\Utill;
use MultiVendorX\Elementor\StoreHelper;

class Store_Tab extends Widget_Base
{

	use StoreHelper;

	public function get_name()
	{
		return 'multivendorx_Store_Tab';
	}

	public function get_title()
	{
		return __('Store Tabs', 'multivendorx');
	}

	public function get_icon()
	{
		return 'eicon-products';
	}

	public function get_categories()
	{
		return array('multivendorx');
	}

	public function get_keywords()
	{
		return array('store', 'tab', 'content', 'products');
	}

	protected function register_controls()
	{
		$dynamic_default = \Elementor\Plugin::instance()
			->dynamic_tags
			->tag_data_to_tag_text(null, 'multivendorx-store-dummy-products');

		$this->add_control(
			'products',
			[
				'type' => \Elementor\Controls_Manager::HIDDEN,
				'dynamic' => [
					'active'  => true,
					'default' => $dynamic_default,
				],
			],
			[
				'position' => ['of' => '_title'],
			]
		);
	}

	protected function render()
	{
		$store = $this->get_store_data();
		if (! $store) {
			return;
		}

		if (Utill::is_store_page()) {
			MultiVendorX()->util->get_template('store/store-tabs.php', array('store_id' => $store['storeId']));
		} else {
			$settings = $this->get_settings_for_display();
		?>
			<div class="woocommerce">
				<div class="product">
					<div class="woocommerce-tabs wc-tabs-wrapper">
						<ul class="tabs wc-tabs">
							<li class="active">Products</li>
							<li>Policy</li>
							<li>Reviews</li>
						</ul>
						<div class="panel entry-content wc-tab">
						<?php 
							echo $settings['products'];
						?>
						</div>
					</div>
				</div>
			</div>
		<?php
			
		}
	}
}
