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
		return [ 'multivendorx', 'store', 'logo', 'avatar', 'profile' ];
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
        
        // Update width control with 6rem default
        $this->update_control(
            'width',
            [
                'default' => [
                    'unit' => 'rem',
                    'size' => 6,
                ],
            ]
        );
        
        // Update max width control with 6rem default
        $this->update_control(
            'image_max_width',
            [
                'default' => [
                    'unit' => 'rem',
                    'size' => 6,
                ],
            ]
        );
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

		// Get settings for width
		$settings = $this->get_settings_for_display();
		$width = isset( $settings['width']['size'] ) ? $settings['width']['size'] . $settings['width']['unit'] : '6rem';
		$max_width = isset( $settings['image_max_width']['size'] ) ? $settings['image_max_width']['size'] . $settings['image_max_width']['unit'] : '6rem';
		$alignment = isset( $settings['align'] ) ? $settings['align'] : 'center';

		printf(
			'<div class="multivendorx-store-logo" style="text-align: %4$s;">
				<img class="multivendorx-store-logo-img" src="%1$s" alt="%2$s" style="width: %5$s; max-width: %6$s;" />
			</div>',
			esc_url( $logo ),
			esc_attr( $store['storeName'] ?? '' ),
			esc_attr( $store['storeName'] ?? '' ),
			esc_attr( $alignment ),
			esc_attr( $width ),
			esc_attr( $max_width )
		);
	}
}