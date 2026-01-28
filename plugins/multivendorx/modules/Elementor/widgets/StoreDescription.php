<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Base;
use MultiVendorX\Elementor\StoreHelper;

class Store_Description extends \Widget_Base {

	use StoreHelper;

	public function get_name() {
		return 'mvx_store_description';
	}

	public function get_title() {
		return __( 'Store Description', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-editor-paragraph';
	}

	public function get_categories() {
		return [ 'multivendorx' ];
	}

	protected function register_controls() {

	}

	protected function render() {

		$store = $this->get_store_data();
		if ( ! $store ) return;

		$description = $store['storeDescription'] ?: $this->get_settings_for_display()['empty_text'];

		echo '<div class="mvx-store-description">';
		echo wp_kses_post( wpautop( $description ) );
		echo '</div>';
	}
}
