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
		if ( empty( $store ) || ! is_array( $store ) ) {
			return;
		}

		// Render Store Rating (if it exists)
		if ( isset( $store['store_rating'] ) && $store['store_rating'] !== '' ) {
			printf(
				'<div class="multivendorx-store-rating">Rating: <span>%s</span></div>',
				esc_html( $store['store_rating'] )
			);
		}
	}
}