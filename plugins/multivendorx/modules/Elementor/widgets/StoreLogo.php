<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Image;
use MultiVendorX\Elementor\StoreHelper;

class Store_Logo extends Widget_Image {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_logo';
	}

	public function get_title() {
		return __( 'Store Logo', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-image';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	public function get_keywords() {
		return array( 'multivendorx', 'store', 'store', 'logo', 'avatar', 'profile' );
	}

	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
			'section_image',
			array(
				'label' => __( 'Store Logo Settings', 'multivendorx' ),
			)
		);

		// Automatically link the image control to the store logo dynamic tag
		$this->update_control(
			'image',
			array(
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		// Clean up unnecessary controls for a Store Logo
		$this->remove_control( 'caption_source' );
		$this->remove_control( 'caption' );
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
