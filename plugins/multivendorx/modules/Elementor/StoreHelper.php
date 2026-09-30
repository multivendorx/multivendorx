<?php
/**
 * Elementor Store Helper trait for MultiVendorX.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor;

use MultiVendorX\Store\StoreUtil;

defined( 'ABSPATH' ) || exit;

trait StoreHelper {
    /**
     * Get store data for frontend or Elementor preview.
     *
     * @return array|false Store data array or false if store slug not found.
     */
	protected function get_store_data() {

		if ( $this->is_edit_or_preview_mode() ) {
			return array(
				'storeName'        => __( 'Demo Store', 'multivendorx' ),
				'storeDescription' => __( 'This is a sample store description shown only in Elementor editor preview.', 'multivendorx' ),
				'banner'           => array(
					'id'  => 0,
					'url' => \Elementor\Utils::get_placeholder_image_src(),
				),
				'logo'             => array(
					'id'  => 0,
					'url' => \Elementor\Utils::get_placeholder_image_src(),
				),
				'storeAddress'     => 'Kolkata, India (IN)',
				'storePhone'       => '888-888-8888',
				'storeEmail'       => 'multivendorx@dualcube.com',
				'storeRating'      => '5 rating from 50 reviews',
			);
		}

		$slug = get_query_var( MultiVendorX()->setting->get_setting( 'store_url', 'store' ) );
		if ( ! $slug ) {
			return false;
		}
		return StoreUtil::get_specific_store_info();
	}

    /**
     * Check if current request is in Elementor edit or preview mode.
     *
     * @return bool True if in edit or preview mode, false otherwise.
     */
	protected function is_edit_or_preview_mode() {

		$elementor = \Elementor\Plugin::instance();

		$is_edit_mode    = $elementor->editor->is_edit_mode();
		$is_preview_mode = $elementor->preview->is_preview_mode();

		// Fallback for edge cases, gated on capability + a valid Elementor nonce.
		if ( empty( $is_edit_mode ) && empty( $is_preview_mode )
			&& current_user_can( 'edit_posts' )
			&& wp_verify_nonce( sanitize_key( $this->get_request_param( '_nonce' ) ), 'elementor_ajax' )
		) {
			if ( '' !== $this->get_request_param( 'action' ) && '' !== $this->get_request_param( 'editor_post_id' ) ) {
				$is_edit_mode = true;
			} elseif ( '' !== $this->get_request_param( 'preview' ) && '' !== $this->get_request_param( 'theme_template_id' ) ) {
				$is_preview_mode = true;
			}
		}

		return ( $is_edit_mode || $is_preview_mode );
	}

	/**
	 * Read a sanitized string from the POST body, falling back to the query string.
	 *
	 * Replaces direct $_REQUEST access; Elementor sends these params via POST (ajax) or GET (preview).
	 *
	 * @param string $key Request parameter name.
	 * @return string Empty string when the parameter is absent.
	 */
	private function get_request_param( $key ) {
		$value = filter_input( INPUT_POST, $key, FILTER_UNSAFE_RAW );
		if ( null === $value || false === $value ) {
			$value = filter_input( INPUT_GET, $key, FILTER_UNSAFE_RAW );
		}

		return is_string( $value ) ? sanitize_text_field( $value ) : '';
	}
}
