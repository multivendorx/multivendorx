<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Tab_Contents extends Widget_Base {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_tab_contents';
	}

	public function get_title() {
		return __( 'Store Tab Contents', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-products';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	public function get_keywords() {
		return array( 'store', 'tab', 'content', 'products' );
	}

	protected function register_controls() {
		$this->start_controls_section(
			'section_dummy_style',
			array(
				'label' => __( 'Dummy Content Settings', 'multivendorx' ),
			)
		);

		$this->add_control(
			'dummy_text',
			array(
				'label'   => __( 'Placeholder Text', 'multivendorx' ),
				'type'    => Controls_Manager::TEXT,
				'default' => __( 'Store products will be displayed here.', 'multivendorx' ),
			)
		);

		$this->end_controls_section();
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
