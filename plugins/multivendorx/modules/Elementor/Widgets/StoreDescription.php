<?php
/**
 * Elementor Widget: Store Description
 *
 * Displays the store description in Elementor templates.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Heading;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

/**
 * Store_Description Widget Class.
 */
class StoreDescription extends Widget_Heading {

	use StoreHelper;

	/**
	 * Widget slug/unique name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'multivendorx_store_description';
	}

	/**
	 * Widget title displayed in Elementor editor.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Store Description', 'multivendorx' );
	}

	/**
	 * Widget icon for Elementor editor.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-editor-paragraph';
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

		// Remove default heading controls.
		$this->remove_control( 'title' );
		$this->remove_control( 'link' );

		// Change header size default to paragraph.
		$this->update_control(
			'header_size',
			array(
				'default' => 'p',
			)
		);
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

		$description = ! empty( $store['storeDescription'] ) ? $store['storeDescription'] : '';

		if ( empty( $description ) ) {
			return;
		}

		echo '<div class="multivendorx-store-description">';
		echo wp_kses_post( wpautop( $description ) );
		echo '</div>';
	}
}
