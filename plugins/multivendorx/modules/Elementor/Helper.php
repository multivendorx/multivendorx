<?php
namespace MultiVendorX\Elementor;
use MultiVendorX\Store\StoreUtil;

trait StoreHelper {

	protected function is_editor() {
		return \Elementor\Plugin::$instance->editor->is_edit_mode();
	}

	protected function get_store_data() {

		if ( $this->is_editor() ) {
			return [
				'storeName'        => __( 'Demo Store', 'multivendorx' ),
				'storeDescription' => __( 'This is a sample store description shown only in Elementor editor preview.', 'multivendorx' ),
			];
		}

		$slug = get_query_var( 'store' );
		if ( ! $slug ) {
			return false;
		}

		return StoreUtil::get_specific_store_info();
	}
}
