<?php
/**
 * Elementor Dynamic Tag: Store Name
 *
 * Provides the store name for use in Elementor dynamic tags.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

defined( 'ABSPATH' ) || exit;

/**
 * StoreName Dynamic Tag.
 */
class StoreName extends Tag {
	use StoreHelper;

	/**
	 * Tag name (unique identifier).
	 *
	 * @return string
	 */
	public function get_name() {
		return 'multivendorx-store-name';
	}

	/**
	 * Tag title (display name).
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Store Name', 'multivendorx' );
	}

	/**
	 * Tag group ID.
	 *
	 * @return string
	 */
	public function get_group() {
		return 'multivendorx'; // Must match group ID.
	}

	/**
	 * Tag categories.
	 *
	 * @return array
	 */
	public function get_categories() {
		return array( Module::TEXT_CATEGORY );
	}

	/**
	 * Render the store name.
	 *
	 * @return void
	 */
	public function render() {
		$store = $this->get_store_data();

		if ( ! $store ) {
			return;
		}

		$settings = $this->get_settings_for_display();
		$name     = ! empty( $store['storeName'] ) ? $store['storeName'] : ( $settings['title'] ?? '' );

		echo esc_html( $name );
	}
}
