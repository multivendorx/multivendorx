<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use MultiVendorX\Elementor\StoreHelper;

class Store_Rating extends Widget_Base {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_rating';
	}

	public function get_title() {
		return __( 'Store Rating', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-rating';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	public function get_keywords() {
		return array( 'multivendorx', 'store', 'store', 'rating', 'stars', 'reviews' );
	}

	protected function register_controls() {
		$this->start_controls_section(
			'section_rating_style',
			array(
				'label' => __( 'Rating Style', 'multivendorx' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'star_color',
			array(
				'label'     => __( 'Star Color', 'multivendorx' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#ffcc00',
				'selectors' => array(
					'{{WRAPPER}} .star-rating' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'     => 'text_typography',
				'label'    => __( 'Count Typography', 'multivendorx' ),
				'selector' => '{{WRAPPER}} .multivendorx-rating-count',
			)
		);

		$this->add_control(
			'text_color',
			array(
				'label'     => __( 'Count Color', 'multivendorx' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .multivendorx-rating-count' => 'color: {{VALUE}};',
				),
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
