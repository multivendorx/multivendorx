<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Description extends Widget_Base {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_description';
	}

	public function get_title() {
		return __( 'Store Description', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-editor-paragraph';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	protected function register_controls() {
		$this->start_controls_section(
			'content',
			array(
				'label' => __( 'Content', 'multivendorx' ),
			)
		);

		$this->add_control(
			'empty_text',
			array(
				'label'   => __( 'Empty Description Text', 'multivendorx' ),
				'type'    => Controls_Manager::TEXT,
				'default' => __( 'No store description available.', 'multivendorx' ),
			)
		);

		$this->end_controls_section();
	}

	protected function render() {

		$store = $this->get_store_data();
		if ( ! $store ) {
			return;
        }

		$description = $store['storeDescription'] ?: $this->get_settings_for_display()['empty_text'];

		echo '<div class="mvx-store-description">';
		echo wp_kses_post( wpautop( $description ) );
		echo '</div>';
	}
}
