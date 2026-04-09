<?php
/**
 * Store Tab Widget.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Base;
use MultiVendorX\Utill;
use MultiVendorX\Elementor\StoreHelper;

/**
 * Class Store_Tab
 */
class Store_Tab extends Widget_Base {

	use StoreHelper;

	/**
	 * Get widget name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'multivendorx_Store_Tab';
	}

	/**
	 * Get widget title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Store Tabs', 'multivendorx' );
	}

	/**
	 * Get widget icon.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-products';
	}

	/**
	 * Get widget categories.
	 *
	 * @return array
	 */
	public function get_categories() {
		return array( 'multivendorx' );
	}

	/**
	 * Get widget keywords.
	 *
	 * @return array
	 */
	public function get_keywords() {
		return array( 'store', 'tab', 'content', 'products' );
	}

	/**
	 * Register controls.
	 *
	 * @return void
	 */
	protected function register_controls() {
		$dynamic_default = \Elementor\Plugin::instance()
			->dynamic_tags
			->tag_data_to_tag_text( null, 'multivendorx-store-dummy-products' );

		$this->add_control(
			'products',
			array(
				'type'    => \Elementor\Controls_Manager::HIDDEN,
				'dynamic' => array(
					'active'  => true,
					'default' => $dynamic_default,
				),
			),
			array(
				'position' => array( 'of' => '_title' ),
			)
		);
	}

	/**
	 * Render widget output.
	 *
	 * @return void
	 */
	protected function render() {
		$store = $this->get_store_data();

		if ( ! $store ) {
			return;
		}

		if ( Utill::is_store_page() ) {
			MultiVendorX()->util->get_template(
				'store/store-tabs.php',
				array( 'store_id' => $store['storeId'] )
			);
		} else {
			$settings = $this->get_settings_for_display();
			?>
			<div class="woocommerce">
				<div class="product">
					<div class="woocommerce-tabs wc-tabs-wrapper site-main">
						<ul class="tabs wc-tabs">
							<li class="active"><?php esc_html_e( 'Products', 'multivendorx' ); ?></li>
							<li><?php esc_html_e( 'Policy', 'multivendorx' ); ?></li>
							<li><?php esc_html_e( 'Reviews', 'multivendorx' ); ?></li>
						</ul>
						<div class="panel entry-content wc-tab">
							<?php
							echo wp_kses_post( $settings['products'] );
							?>
						</div>
					</div>
				</div>
			</div>
			<?php
		}
	}
}