<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Icon_List;
use Elementor\Controls_Manager;
use Elementor\Repeater;
use MultiVendorX\Elementor\StoreHelper;

class Store_Info extends Widget_Icon_List {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_info';
	}

	public function get_title() {
		return __( 'Store Info', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-bullet-list';
	}

	public function get_categories() {
		return [ 'multivendorx' ];
	}

	public function get_keywords() {
		return [ 'multivendorx', 'store', 'store', 'info', 'address', 'location' ];
	}

	protected function register_controls() {

		parent::register_controls();

		// Rename section label
		$this->update_control(
			'section_icon',
			[
				'label' => __( 'Store Info Details', 'multivendorx' ),
			]
		);

		// Create repeater
		$repeater = new Repeater();

		$repeater->add_control(
			'title',
			[
				'label'   => __( 'Title', 'multivendorx' ),
				'type'    => Controls_Manager::HIDDEN,
				'default' => __( 'Title', 'multivendorx' ),
			]
		);

		$repeater->add_control(
			'text',
			[
				'label'       => __( 'Content', 'multivendorx' ),
				'type'        => Controls_Manager::HIDDEN,
				'label_block' => true,
			]
		);

		$repeater->add_control(
			'icon',
			[
				'label'       => __( 'Icon', 'multivendorx' ),
				'type'        => Controls_Manager::ICONS, // modern (ICON is deprecated)
				'label_block' => true,
				'default'     => [
					'value'   => 'fas fa-check',
					'library' => 'fa-solid',
				],
			]
		);

		// Dynamic default for repeater
		$dynamic_content = \Elementor\Plugin::instance()
			->dynamic_tags
			->get_tag_data_content( null, 'multivendorx-store-info' );

		$this->update_control(
			'icon_list',
			[
				'type'    => Controls_Manager::REPEATER,
				'fields'  => $repeater->get_controls(),
				'default' => ! empty( $dynamic_content )
					? json_decode( $dynamic_content, true )
					: [],
			]
		);

		$this->add_control(
			'store_info',
			[
				'type'    => Controls_Manager::HIDDEN,
				'dynamic' => [
					'active'  => true,
					'default' => \Elementor\Plugin::instance()
						->dynamic_tags
						->tag_data_to_tag_text( null, 'multivendorx-store-info' ),
				],
			],
			[
				'position' => [ 'of' => 'icon_list' ],
			]
		);

	}

	protected function render() {

		$store = $this->get_store_data();
		if ( ! $store ) {
			return;
		}

		// Phone Number
		if ( ! empty( $store['storePhone'] ) ) {
			printf(
				'<div class="multivendorx-store-phone">
					<a href="tel:%1$s">%2$s</a>
				</div>',
				esc_attr( preg_replace( "/\s+/", "", $store['storePhone'] ) ),
				esc_html( $store['storePhone'] )
			);
		}

		// Email Address
		if ( ! empty( $store['storeEmail'] ) ) {
			printf(
				'<div class="multivendorx-store-email">
					<a href="mailto:%1$s">%1$s</a>
				</div>',
				esc_attr( $store['storeEmail'] )
			);
		}
	}
}