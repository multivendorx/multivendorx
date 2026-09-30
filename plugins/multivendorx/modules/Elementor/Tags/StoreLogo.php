<?php
/**
 * Elementor Dynamic Tag: Store Logo
 *
 * Provides the store logo for use in Elementor dynamic tags.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

defined( 'ABSPATH' ) || exit;

/**
 * StoreLogo Dynamic Tag.
 */
class StoreLogo extends Tag {
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
		return 'multivendorx-store-logo';
	}

	/**
	 * Tag title (display name).
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Store Logo', 'multivendorx' );
	}

	/**
	 * Tag group ID.
	 *
	 * @return string
	 */
	public function get_group() {
		return 'multivendorx';
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
	 * Retrieve store logo.
	 *
	 * Returns the logo URL or fallback if not set.
	 *
	 * @return string|array Logo URL or fallback.
	 */
	protected function get_value() {
		$store   = $this->get_store_data();
		$picture = ! empty( $store['storeLogo'] ) ? $store['storeLogo'] : '';

		if ( is_numeric( $picture ) ) {
			$picture = wp_get_attachment_url( $picture );
		}

		if ( empty( $picture ) ) {
			$settings = $this->get_settings();

			if ( ! empty( $settings['fallback']['id'] ) ) {
				$picture = $settings['fallback'];
			}
		}

		return $picture;
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
					'id'  => 0,
					'url' => \Elementor\Utils::get_placeholder_image_src(),
				),
			)
		);
	}
}
