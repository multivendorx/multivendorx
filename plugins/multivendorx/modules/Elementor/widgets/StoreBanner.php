<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Image;
use MultiVendorX\Elementor\StoreHelper;

class Store_Banner extends Widget_Image {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_banner';
	}

	public function get_title() {
		return __( 'Store Banner', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-image-box';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
			'image',
			array(
				'label'   => __( 'Choose Banner', 'multivendorx' ),
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		// Hide controls that might break a banner layout
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
