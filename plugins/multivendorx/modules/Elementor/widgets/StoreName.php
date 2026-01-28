<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Name extends \Widget_Base {
	use StoreHelper;

	public function get_name() {
		return 'mvx_store_name';
	}

	public function get_title() {
		return __( 'Store Name', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-store';
	}

	public function get_categories() {
		return [ 'multivendorx' ];
	}

	protected function register_controls() {

		$this->start_controls_section(
			'content',
			[
				'label' => __( 'Content', 'multivendorx' ),
			]
		);

		$this->add_control(
			'html_tag',
			[
				'label' => __( 'HTML Tag', 'multivendorx' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'h2',
				'options' => [
					'h1' => 'H1',
					'h2' => 'H2',
					'h3' => 'H3',
					'div'=> 'DIV',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {

		$store = $this->get_store_data();
		if ( ! $store ) return;

		$tag = esc_attr( $this->get_settings_for_display()['html_tag'] );

		printf(
			'<%1$s class="mvx-store-name">%2$s</%1$s>',
			$tag,
			esc_html( $store['storeName'] )
		);
	}
}
