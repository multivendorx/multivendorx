<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Button;
use MultiVendorX\Elementor\StoreHelper;

class Store_Follow_Button extends Widget_Button {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_follow';
	}

	public function get_title() {
		return __( 'Store Follow Button', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-person';
	}

	public function get_categories() {
		return [ 'multivendorx' ];
	}

	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
			'text',
			[
				'default' => __( 'Follow', 'multivendorx' ),
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->update_control(
			'button_background_color',
			[
				'default' => '#17a2b8',
			]
		);

		$this->update_control(
			'link',
			[
				'dynamic' => ['active' => false],
				'placeholder' => __( 'Handled by Follow logic', 'multivendorx' ),
			]
		);
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