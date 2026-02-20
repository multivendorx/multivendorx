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
			'section_tabs_content',
			array(
				'label' => __( 'Tabs Setup', 'multivendorx' ),
			)
		);

		$this->add_control(
			'tabs_view',
			array(
				'label'   => __( 'Layout', 'multivendorx' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'inline',
				'options' => array(
					'block'  => __( 'Vertical', 'multivendorx' ),
					'inline' => __( 'Horizontal', 'multivendorx' ),
				),
			)
		);

		$this->add_control(
			'dummy_info',
			array(
				'type'            => Controls_Manager::RAW_HTML,
				'raw'             => __( 'Note: Tabs are currently showing dummy links for design preview.', 'multivendorx' ),
				'content_classes' => 'elementor-descriptor',
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
