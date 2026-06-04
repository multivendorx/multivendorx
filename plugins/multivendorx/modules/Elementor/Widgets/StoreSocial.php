<?php
/**
 * Store Social Elementor Widget
 *
 * @package MultiVendorX\Elementor\Widgets
 */

namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Social_Icons;
use MultiVendorX\Elementor\StoreHelper;

/**
 * Store Social widget class
 */
class StoreSocial extends Widget_Social_Icons {

	use StoreHelper;

	/**
	 * Get widget name
	 */
	public function get_name() {
		return 'multivendorx_store_social';
	}

	/**
	 * Get widget title
	 */
	public function get_title() {
		return __( 'Store Social', 'multivendorx' );
	}

	/**
	 * Get widget icon
	 */
	public function get_icon() {
		return 'eicon-social-icons';
	}

	/**
	 * Get widget categories
	 */
	public function get_categories() {
		return array( 'multivendorx' );
	}

	/**
	 * Register widget controls
	 */
	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
			'social_icon_list',
			array(
				'default' => array(
					array(
						'social_icon' => array(
							'value'   => 'fab fa-facebook',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value'   => 'fab fa-twitter',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value'   => 'fab fa-instagram',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value'   => 'fab fa-youtube',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value'   => 'fab fa-pinterest',
							'library' => 'fa-brands',
						),
					),
				),
			)
		);
	}

	/**
	 * Render widget output
	 */
	protected function render() {
		$store = $this->get_store_data();
		if ( ! $store ) {
			return;
		}

		// Render Dynamic Social Icons.
		$social_platforms = array(
			'facebook'  => 'fab fa-facebook',
			'twitter'   => 'fab fa-twitter',
			'instagram' => 'fab fa-instagram',
			'youtube'   => 'fab fa-youtube',
			'pinterest' => 'fab fa-pinterest',
			'linkedin'  => 'fab fa-linkedin',
		);

		echo '<div class="multivendorx-store-social-icons">';

		foreach ( $social_platforms as $key => $icon_class ) {
			if ( ! empty( $store[ $key ] ) ) {
				printf(
					'<a href="%1$s" target="_blank" rel="noopener noreferrer"><i class="%2$s"></i></a>',
					esc_url( $store[ $key ] ),
					esc_attr( $icon_class )
				);
			}
		}

		echo '</div>';
	}
}
