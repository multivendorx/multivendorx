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
				'section_image',
				[
						'label' => __( 'Banner', 'multivendorx' ),
				]
		);

		$this->update_control(
				'image',
				[
						'dynamic' => [
								'default' => \Elementor\Plugin::instance()
											->dynamic_tags
											->tag_data_to_tag_text( null, 'multivendorx-store-banner' ),
						],
						'selectors' => [
								'{{WRAPPER}} > .elementor-widget-container > .elementor-image > img' => 'width: 100%;',
						]
				],
				[
						'recursive' => true,
				]
		);
		
		$this->remove_control( 'caption_source' );
		$this->remove_control( 'caption' );
	}

	protected function render() {
		echo '<div class="multivendorx-store-banner">';
		parent::render();
		echo '</div>';
	}
}