<?php
namespace MultiVendorX\Elementor;

use MultiVendorX\Store\StoreUtil;

trait StoreHelper {

	protected function get_store_data() {

		if ( $this->is_edit_or_preview_mode() ) {
			return array(
				'storeName'        => __( 'Demo Store', 'multivendorx' ),
				'storeDescription' => __( 'This is a sample store description shown only in Elementor editor preview.', 'multivendorx' ),
				'banner'          => [
						'id'  => 0,
						'url' => \Elementor\Utils::get_placeholder_image_src(),
				],
				'logo'          => [
						'id'  => 0,
						'url' => \Elementor\Utils::get_placeholder_image_src(),
				],
				'storeAddress'         => 'Kolkata, India (IN)',
				'storePhone'           => '888-888-8888',
				'storeEmail'           => 'multivendorx@dualcube.com',
				'storeRating'          => '5 rating from 50 reviews',
			);
		}

		$slug = get_query_var( 'store' );
		if ( ! $slug ) {
			return false;
		}
		return StoreUtil::get_specific_store_info();
	}

	protected function is_edit_or_preview_mode() {

		$elementor = \Elementor\Plugin::instance();

		$is_edit_mode    = $elementor->editor->is_edit_mode();
		$is_preview_mode = $elementor->preview->is_preview_mode();

		// Fallback check (for edge cases)
		if ( empty( $is_edit_mode ) && empty( $is_preview_mode ) ) {

			if ( ! empty( $_REQUEST['action'] ) && ! empty( $_REQUEST['editor_post_id'] ) ) {
				$is_edit_mode = true;

			} elseif (
				! empty( $_REQUEST['preview'] )
				&& ! empty( $_REQUEST['theme_template_id'] )
			) {
				$is_preview_mode = true;
			}
		}

		return ( $is_edit_mode || $is_preview_mode );
	}
}
