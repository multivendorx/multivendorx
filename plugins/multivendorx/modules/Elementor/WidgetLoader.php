<?php
namespace MultiVendorX\Elementor;

defined( 'ABSPATH' ) || exit;

class WidgetLoader {

	public function __construct() {
		add_action( 'elementor/widgets/register', [ $this, 'register_widgets' ] );
		add_action( 'elementor/elements/categories_registered', [ $this, 'register_category' ] );
	}

	public function register_category( $elements_manager ) {
		$elements_manager->add_category(
			'multivendorx',
			[
				'title' => __( 'MultiVendorX Store Widgets', 'multivendorx' ),
				'icon'  => 'fa fa-store',
			]
		);
	}

	public function register_widgets( $widgets_manager ) {

		$widgets = [
			'store-name'        => 'MultiVendorX\Elementor\Widgets\Store_Name',
			'store-description' => 'MultiVendorX\Elementor\Widgets\Store_Description',
		];

		foreach ( $widgets as $file => $class ) {

			$path = MultiVendorX()->plugin_path . 'widgets/' . $file . '.php';

			if ( file_exists( $path ) ) {
				require_once $path;

				if ( class_exists( $class ) ) {
					$widgets_manager->register( new $class() );
				}
			}
		}
	}
}

