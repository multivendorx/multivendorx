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

		$this->update_control(
			'section_icon',
			[
				'label' => __( 'Store Info Details', 'multivendorx' ),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'key',
			[
				'label'   => __( 'Info Type', 'multivendorx' ),
				'type'    => Controls_Manager::SELECT,
				'options' => [
					'address' => __( 'Address', 'multivendorx' ),
					'phone'   => __( 'Phone', 'multivendorx' ),
					'email'   => __( 'Email', 'multivendorx' ),
					'rating'  => __( 'Rating', 'multivendorx' ),
				],
				'default' => 'address',
			]
		);

		$repeater->add_control(
			'selected_icon',
			[
				'label'   => __( 'Icon', 'multivendorx' ),
				'type'    => Controls_Manager::ICONS,
				'default' => [
					'value'   => 'fas fa-map-marker-alt',
					'library' => 'fa-solid',
				],
			]
		);

		// Override the default icon_list control to use our logic
		$this->update_control(
			'icon_list',
			[
				'fields'      => $repeater->get_controls(),
				'title_field' => '{{{ key.charAt(0).toUpperCase() + key.slice(1) }}}',
				
				'default'     => [
					[ 'key' => 'address', 'selected_icon' => [ 'value' => 'fas fa-map-marker-alt', 'library' => 'fa-solid' ] ],
					[ 'key' => 'phone',   'selected_icon' => [ 'value' => 'fas fa-phone', 'library' => 'fa-solid' ] ],
					[ 'key' => 'email',   'selected_icon' => [ 'value' => 'fas fa-envelope', 'library' => 'fa-solid' ] ],
				],
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