<?php
/**
 * Elementor Widget: Store Banner
 *
 * Provides the store banner widget for Elementor.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Image;
use MultiVendorX\Elementor\StoreHelper;

/**
 * Store_Banner Widget Class.
 */
class StoreBanner extends Widget_Image {

	use StoreHelper;

	/**
	 * Widget slug/unique name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'multivendorx_store_banner';
	}

	/**
	 * Widget title displayed in Elementor editor.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Store Banner', 'multivendorx' );
	}

	/**
	 * Widget icon for Elementor editor.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-image-box';
	}

	/**
	 * Widget categories in Elementor.
	 *
	 * @return array
	 */
	public function get_categories() {
		return array( 'multivendorx' );
	}

	/**
	 * Register widget controls.
	 *
	 * @return void
	 */
	protected function register_controls() {
		parent::register_controls();

		// Rename the default image control label to "Banner".
		$this->update_control(
			'section_image',
			array(
				'label' => __( 'Banner', 'multivendorx' ),
			)
		);

		// Remove unnecessary caption controls.
		$this->remove_control( 'caption_source' );
		$this->remove_control( 'caption' );
	}

	/**
	 * Render widget output on frontend.
	 *
	 * @return void
	 */
	protected function render() {
		$store = $this->get_store_data();
		if ( empty( $store ) || ! is_array( $store ) ) {
			return;
		}

		$banner = $store['storeBanner'] ?? '';

		// If banner stored as attachment ID, convert to URL.
		if ( is_numeric( $banner ) ) {
			$banner = wp_get_attachment_url( $banner );
		}

		if ( empty( $banner ) ) {
			return;
		}

		printf(
			'<div class="multivendorx-store-banner" style="background-image: url(%1$s);"></div>',
			esc_url( $banner )
		);
	}
}
