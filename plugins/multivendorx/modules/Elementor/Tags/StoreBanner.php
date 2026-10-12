<?php
/**
 * Elementor Dynamic Tag: Store Banner
 *
 * Provides the store banner for use in Elementor dynamic tags.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Tags;

use Elementor\Controls_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

defined( 'ABSPATH' ) || exit;

/**
 * StoreBanner Dynamic Tag.
 */
class StoreBanner extends Tag {
	use StoreHelper;

	/**
	 * Constructor.
	 *
	 * @param array $data Optional tag data.
	 *
	 * @phpcs:disable Generic.CodeAnalysis.UselessOverridingMethod.Found
	 */
	public function __construct( $data = array() ) {
		parent::__construct( $data );
	}

	/**
	 * Tag name (unique identifier).
     *
	 * @return string
	 */
	public function get_name() {
		return 'multivendorx-store-banner';
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
	 * Tag title (display name).
     *
	 * @return string
	 */
	public function get_title() {
		return __( 'Store Banner', 'multivendorx' );
	}

	/**
	 * Tag categories.
     *
	 * @return array
	 */
	public function get_categories() {
		return array( Module::IMAGE_CATEGORY );
	}

	/**
	 * Retrieve store banner value.
	 *
	 * Returns banner ID and URL if available, otherwise fallback.
     *
	 * @return array Banner data with 'id' and 'url' keys, or empty array.
	 */
	protected function get_value() {
		$store  = $this->get_store_data();
		$banner = ! empty( $store['storeBanner'] ) ? $store['storeBanner'] : '';

		if ( is_numeric( $banner ) ) {
			return array(
				'id'  => (int) $banner,
				'url' => wp_get_attachment_url( $banner ),
			);
		}

		if ( ! empty( $banner ) ) {
			return array(
				'id'  => 0,
				'url' => esc_url( $banner ),
			);
		}

		// Elementor fallback image.
		$settings = $this->get_settings();

		if ( ! empty( $settings['fallback'] ) ) {
			return $settings['fallback'];
		}

		return array();
	}

	/**
	 * Register tag controls.
     *
	 * @return void
	 */
	protected function register_controls() {
		$this->add_control(
			'fallback',
			array(
				'label'   => __( 'Fallback', 'multivendorx' ),
				'type'    => Controls_Manager::MEDIA,
				'default' => array(
					'url' => '',
				),
			)
		);
	}
}
