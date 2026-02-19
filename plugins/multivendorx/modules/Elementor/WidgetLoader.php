<?php
namespace MultiVendorX\Elementor;

defined( 'ABSPATH' ) || exit;

class WidgetLoader {

	public function __construct() {
		// add_action( 'elementor/widgets/register', array( $this, 'register_widgets' ) );
		add_action( 'elementor/elements/categories_registered', array( $this, 'register_category' ) );
		// add_action( 'elementor/dynamic_tags/register_tags', [ $this, 'register_dynamic_tags' ] );
	}

	public function register_category( $elements_manager ) {
		$elements_manager->add_category(
			'multivendorx',
			array(
				'title' => __( 'MultiVendorX Store Widgets', 'multivendorx' ),
				'icon'  => 'fa fa-store',
			)
		);
	}

	public function register_widgets( $widgets_manager ) {

		$widgets = array(
			'StoreName'        => 'MultiVendorX\Elementor\Widgets\Store_Name',
			'StoreDescription' => 'MultiVendorX\Elementor\Widgets\Store_Description',
			// 'StoreBanner' => 'MultiVendorX\Elementor\Widgets\Store_Banner',
			// 'StoreChat' => 'MultiVendorX\Elementor\Widgets\Store_Chat_Button',
			// 'StoreFollow' => 'MultiVendorX\Elementor\Widgets\Store_Follow_Button',
		);

		foreach ( $widgets as $file => $class ) {
			$path = MultiVendorX()->plugin_path . 'modules/Elementor/widgets/' . $file . '.php';

			if ( file_exists( $path ) ) {
				require_once $path;

				if ( class_exists( $class ) ) {
					$widgets_manager->register( new $class() );
				}
			}
		}
	}

	public function register_dynamic_tags( $dynamic_tags ) {

		// Register Group
		$dynamic_tags->register_group(
			'multivendorx',
			[
				'title' => __( 'MultiVendorX', 'multivendorx' ),
			]
		);

		// Include Tag File
		$path = MultiVendorX()->plugin_path . 'modules/Elementor/Tags/StoreName.php';

		if ( file_exists( $path ) ) {
			require_once $path;

			if ( class_exists( '\MultiVendorX\Elementor\Tags\StoreName' ) ) {
				$dynamic_tags->register(
					new \MultiVendorX\Elementor\Tags\StoreName()
				);
			}
		}
	}

}
