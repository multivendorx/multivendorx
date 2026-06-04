<?php
/**
 * Elementor Widget Loader.
 *
 * Handles the registration of Elementor widgets and dynamic tags for MultiVendorX.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor;

defined( 'ABSPATH' ) || exit;

/**
 * Class WidgetLoader
 *
 * Registers Elementor widgets, categories, and dynamic tags for MultiVendorX.
 */
class WidgetLoader {

	/**
	 * Constructor. Hooks registration methods into Elementor actions.
	 */
	public function __construct() {
		add_action( 'elementor/widgets/register', array( $this, 'register_widgets' ) );
		add_action( 'elementor/elements/categories_registered', array( $this, 'register_category' ) );
		add_action( 'elementor/dynamic_tags/register_tags', array( $this, 'register_dynamic_tags' ) );
	}

	/**
	 * Register custom Elementor category for MultiVendorX widgets.
	 *
	 * @param \Elementor\Elements_Manager $elements_manager Elements manager instance.
	 * @return void
	 */
	public function register_category( $elements_manager ) {
		$elements_manager->add_category(
			'multivendorx',
			array(
				'title' => __( 'MultiVendorX Store Widgets', 'multivendorx' ),
				'icon'  => 'fa fa-store',
			)
		);
	}

	/**
	 * Register Elementor widgets.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Widgets manager instance.
	 * @return void
	 */
	public function register_widgets( $widgets_manager ) {

		// Default widgets mapping: [ filename => full class name ].
		$widgets = array(
			'StoreName'        => 'MultiVendorX\Elementor\Widgets\StoreName',
			'StoreDescription' => 'MultiVendorX\Elementor\Widgets\StoreDescription',
			'StoreBanner'      => 'MultiVendorX\Elementor\Widgets\StoreBanner',
			'StoreInfo'        => 'MultiVendorX\Elementor\Widgets\StoreInfo',
			'StoreLogo'        => 'MultiVendorX\Elementor\Widgets\StoreLogo',
			'StoreSocial'      => 'MultiVendorX\Elementor\Widgets\StoreSocial',
			'StoreTab'         => 'MultiVendorX\Elementor\Widgets\StoreTab',
		);

		/**
		 * Filter: Allow modules to add or modify widgets.
		 * $widgets = [ 'WidgetFileName' => 'Full\Class\Name', ... ].
		 */
		$widgets = apply_filters( 'multivendorx_elementor_widgets', $widgets );

		// Loop through widgets and include each file if it exists.
		foreach ( $widgets as $file => $class ) {

			// Default widget file path.
			$path = MultiVendorX()->plugin_path . 'modules/Elementor/Widgets/' . $file . '.php';

			/**
			 * Filter: Allow modules to override widget file path.
			 * $path = full path to widget PHP file.
			 */
			$path = apply_filters( 'multivendorx_elementor_widget_path', $path, $file );

			if ( file_exists( $path ) ) {
				require_once $path;

				// Register the widget class if it exists.
				if ( class_exists( $class ) ) {
					$widgets_manager->register( new $class() );
				}
			}
		}
	}

	/**
	 * Register Elementor dynamic tags.
	 *
	 * @param \Elementor\Core\DynamicTags\Manager $dynamic_tags Dynamic tags manager instance.
	 * @return void
	 */
	public function register_dynamic_tags( $dynamic_tags ) {

		// Register a new group for MultiVendorX tags.
		$dynamic_tags->register_group(
			'multivendorx',
			array(
				'title' => __( 'MultiVendorX', 'multivendorx' ),
			)
		);

		// Get default tag files from the plugin.
		$default_tags = glob( MultiVendorX()->plugin_path . 'modules/Elementor/Tags/*.php' );

		// Allow modules to filter tag files.
		$all_tag_files = apply_filters( 'multivendorx_elementor_tag_files', $default_tags );

		foreach ( $all_tag_files as $file ) {
			if ( ! file_exists( $file ) ) {
				continue;
			}

			require_once $file;

			// Extract class name from file name.
			$class_name = basename( $file, '.php' );

			// Default namespace for Elementor tags.
			$full_class = '\\MultiVendorX\\Elementor\\Tags\\' . $class_name;

			// Apply filter: allow module to override class namespace if needed.
			$full_class = apply_filters( 'multivendorx_elementor_tag_class', $full_class, $class_name, $file );

			// Register the dynamic tag if class exists.
			if ( class_exists( $full_class ) ) {
				$dynamic_tags->register( new $full_class() );
			}
		}
	}
}
