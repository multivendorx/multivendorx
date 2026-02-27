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
		return [ 'multivendorx' ];
	}

	public function get_keywords() {
		return [ 'multivendorx', 'store', 'store', 'logo', 'avatar', 'profile' ];
	}

	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
            'section_image',
            [
                'label' => __( 'Store Logo', 'multivendorx' ),
            ]
        );

        $this->update_control(
            'image',
            [
                'dynamic' => [
                    'default' => \Elementor\Plugin::instance()
											->dynamic_tags
											->tag_data_to_tag_text( null, 'multivendorx-store-logo' ),
                ],
            ],
            [
                'recursive' => true,
            ]
        );
        
        $this->remove_control( 'caption_source' );
        $this->remove_control( 'caption' );
	}

	protected function render() {

		$store = $this->get_store_data();
		if ( empty( $store ) || ! is_array( $store ) ) {
			return;
		}

		// Get logo from existing structure
		$logo = $store['storeLogo'] ?? '';

		if ( empty( $logo ) ) {
			return;
		}

		// If logo stored as attachment ID, convert to URL
		if ( is_numeric( $logo ) ) {
			$logo = wp_get_attachment_url( $logo );
		}

		printf(
			'<div class="multivendorx-store-logo">
				<img class="multivendorx-store-logo-img" src="%1$s" alt="%2$s" />
			</div>',
			esc_url( $logo ),
			esc_attr( $store['storeName'] ?? '' )
		);
	}
}