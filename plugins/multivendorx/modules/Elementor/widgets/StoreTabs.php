<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Tabs extends Widget_Base {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_tabs';
	}

	public function get_title() {
		return __( 'Store Tabs', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-editor-list-ul';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	public function get_keywords() {
		return array( 'store', 'tab', 'menu' );
	}

	protected function register_controls() {

		$this->start_controls_section(
			'section_store_tabs',
			[
				'label' => __( 'Store Tabs', 'multivendorx' ),
			]
		);

		// Layout Control
		$this->add_control(
			'layout',
			[
				'label' => __( 'Layout', 'multivendorx' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'horizontal' => [
						'title' => __( 'Horizontal', 'multivendorx' ),
						'icon'  => 'eicon-h-align-left',
					],
					'vertical' => [
						'title' => __( 'Vertical', 'multivendorx' ),
						'icon'  => 'eicon-v-align-top',
					],
				],
				'default' => 'horizontal',
				'toggle'  => false,
			]
		);

		// Default Dynamic Tag Auto-Selected
		$this->add_control(
			'store_tabs_dynamic',
			[
				'label' => __( 'Store Tabs', 'multivendorx' ),
				'type'  => Controls_Manager::TEXT,
				'dynamic' => [
					'active'  => true,
					'default' => \Elementor\Plugin::instance()
						->dynamic_tags
						->tag_data_to_tag_text( null, 'multivendorx-store-tabs' ),
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {

		$settings = $this->get_settings_for_display();

		$layout = ! empty( $settings['layout'] )
			? $settings['layout']
			: 'horizontal';

		$tabs = ! empty( $settings['store_tabs_dynamic'] )
			? json_decode( $settings['store_tabs_dynamic'], true )
			: [];

		if ( empty( $tabs ) ) {
			return;
		}

		$layout_class = $layout === 'vertical'
			? 'multivendorx-tabs-vertical'
			: 'multivendorx-tabs-horizontal';

		echo '<div class="multivendorx-store-tabs ' . esc_attr( $layout_class ) . '">';
		echo '<ul class="multivendorx-store-tabs-list">';

		foreach ( $tabs as $tab ) {

			$title = ! empty( $tab['text'] ) ? $tab['text'] : '';
			$url   = ! empty( $tab['link']['url'] ) ? $tab['link']['url'] : '#';

			echo '<li class="multivendorx-store-tab-item">';
			echo '<a href="' . esc_url( $url ) . '" class="multivendorx-store-tab-link">';
			echo esc_html( $title );
			echo '</a>';
			echo '</li>';
		}

		echo '</ul>';
		echo '</div>';
	}
}
