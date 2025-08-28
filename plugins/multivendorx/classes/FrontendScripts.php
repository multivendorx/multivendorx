<?php
/**
 * FrontendScripts class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Store\StoreUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX FrontendScripts class
 *
 * @class       FrontendScripts class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class FrontendScripts {

    /**
     * Holds the scripts.
     *
     * @var array
     */
    public static $scripts = array();
	/**
     * Holds the styles.
     *
     * @var array
     */
    public static $styles = array();

    /**
     * FrontendScripts constructor.
     */
    public function __construct() {
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_load_scripts' ) );
    }

    /**
	 * Get the build path for assets based on environment.
	 *
	 * @return string Relative path to the build directory.
	 */
    public static function get_build_path_name() {
        if ( MultiVendorX()->is_dev ) {
			return 'release/assets/';
        }
        return 'assets/';
    }

    /**
	 * Enqueue external JavaScript files.
	 *
	 * @return void
	 */
	public static function enqueue_external_scripts() {
        $base_dir = plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/';
        $base_url = MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/';
        self::enqueue_scripts_from_dir( $base_dir . 'externals/', $base_url . 'externals/' );
        if ( MultiVendorX()->is_dev ) {
            self::enqueue_scripts_from_dir(
                $base_dir,
                $base_url,
                array( 'index.js', 'components.js' ),
                '/min\.js$/i'
            );
        }
    }

	/**
	 * Enqueue JavaScript files from a directory, optionally excluding some by name or pattern.
	 *
	 * @param string   $dir            Full filesystem path to the JS directory.
	 * @param string   $url            Corresponding URL for the directory.
	 * @param string[] $exclude_files Array of filenames to exclude.
	 * @param string   $exclude_pattern Optional regex pattern to exclude.
	 * @return void
	 */
    private static function enqueue_scripts_from_dir( $dir, $url, $exclude_files = array(), $exclude_pattern = '' ) {
        if ( ! is_dir( $dir ) ) {
            return;
        }
        $js_files = glob( $dir . '*.js' );
        foreach ( $js_files as $chunk_path ) {
            $chunk_file = basename( $chunk_path );
            // Exclude based on filename or regex.
            if ( in_array( $chunk_file, $exclude_files, true ) ||
                ( $exclude_pattern && preg_match( $exclude_pattern, $chunk_file ) )
            ) {
                continue;
            }
            $chunk_handle = 'multivendorx-script-' . sanitize_title( $chunk_file );
            $asset_file   = str_replace( '.js', '.asset.php', $chunk_path );
            $deps         = array();
            $version      = filemtime( $chunk_path );
            if ( file_exists( $asset_file ) ) {
                $asset   = include $asset_file;
                $deps    = $asset['dependencies'] ?? array();
                $version = $asset['version'] ?? $version;
            }
            wp_enqueue_script(
                $chunk_handle,
                $url . $chunk_file,
                $deps,
                $version,
                true
            );
        }
    }

    /**
	 * Register and store a script for later use.
	 *
	 * @param string $handle       Unique script handle.
	 * @param string $path         URL to the script file.
	 * @param array  $deps         Optional. Script dependencies. Default empty array.
	 * @param string $version      Optional. Script version. Default empty string.
	 */
    public static function register_script( $handle, $path, $deps = array(), $version = '' ) {
        self::$scripts[] = $handle;
        wp_register_script( $handle, $path, $deps, $version, true );
        wp_set_script_translations( $handle, 'multivendorx' );
    }

    /**
	 * Register and store a style for later use.
	 *
	 * @param string $handle   Unique style handle.
	 * @param string $path     URL to the style file.
	 * @param array  $deps     Optional. Style dependencies. Default empty array.
	 * @param string $version  Optional. Style version. Default empty string.
	 */
    public static function register_style( $handle, $path, $deps = array(), $version = '' ) {
        self::$styles[] = $handle;
        wp_register_style( $handle, $path, $deps, $version );
    }

    /**
	 * Register frontend scripts using filters and enqueue required external scripts.
	 *
	 * Loads block assets and additional scripts defined through the `multivendorx_register_scripts` filter.
	 */
    public static function register_scripts() {
        $version          = MultiVendorX()->version;
        self::enqueue_external_scripts();
        $index_asset      = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
        $register_scripts = apply_filters(
            'multivendorx_register_scripts',
            array(
				// 'multivendorx-frontend-script' => array(
				// 	'src'         => MultiVendorX()->plugin_url . 'assets/js/' . self::get_script_name( 'frontend' ) . '.js',
				// 	'deps'        => array( 'jquery', 'wp-element', 'wp-components' ),
				// 	'version'     => $version, 
				// ),
                'multivendorx-dashboard-script'      => array(
					'src'         => MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/index.js',
					'deps'        => $index_asset['dependencies'],
					'version'     => $version,
				),
				'multivendorx-dashboard-components-script' => array(
					'src'         => MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/components.js',
					'deps'        => $component_asset['dependencies'],
					'version'     => $version,
				),
			)
        );
        foreach ( $register_scripts as $name => $props ) {
            self::register_script( $name, $props['src'], $props['deps'], $props['version'] );
        }
    }

    /**
	 * Register frontend styles using filters.
	 *
	 * Allows style registration through `multivendorx_register_styles` filter.
	 */
    public static function register_styles() {
        $version         = MultiVendorX()->version;
        $register_styles = apply_filters(
            'multivendorx_register_styles',
            array(
				'multivendorx-dashboard-style' => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'styles/index.css',
					'deps'    => array(),
					'version' => $version,
				),
			)
        );
        foreach ( $register_styles as $name => $props ) {
            self::register_style( $name, $props['src'], $props['deps'], $props['version'] );
        }
    }

    /**
     * Register/queue frontend scripts.
     */
    public static function load_scripts() {
        self::register_scripts();
        self::register_styles();
    }

    /**
	 * Register/queue admin scripts.
	 */
	public static function admin_load_scripts() {
        self::admin_register_scripts();
		self::admin_register_styles();
    }

    /**
	 * Register admin scripts using filters.
	 *
	 * Loads admin-specific JavaScript assets and chunked dependencies.
	 */
    public static function admin_register_scripts() {
		$version = MultiVendorX()->version;
        // Enqueue all chunk files (External dependencies).
        self::enqueue_external_scripts();
        $index_asset      = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
		$register_scripts = apply_filters(
            'admin_multivendorx_register_scripts',
            array(
				'multivendorx-admin-script'      => array(
					'src'         => MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/index.js',
					'deps'        => $index_asset['dependencies'],
					'version'     => $version,
				),
				'multivendorx-components-script' => array(
					'src'         => MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/components.js',
					'deps'        => $component_asset['dependencies'],
					'version'     => $version,
				),
                'multivendorx-product-tab-script' => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/' . MULTIVENDORX_PLUGIN_SLUG . '-product-tab.min.js',
					'deps'    => array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'react-jsx-runtime' ),
					'version' => $version,
				),
            )
        );
		foreach ( $register_scripts as $name => $props ) {
			self::register_script( $name, $props['src'], $props['deps'], $props['version'] );
		}
	}

    /**
	 * Register admin styles using filters.
	 *
	 * Allows style registration through `admin_moowoodle_register_styles` filter.
	 */
    public static function admin_register_styles() {
		$version         = MultiVendorX()->version;
		$register_styles = apply_filters(
            'admin_multivendorx_register_styles',
            array(
				'multivendorx-components-style' => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'styles/components.css',
					'deps'    => array(),
					'version' => $version,
				),
			)
        );

		foreach ( $register_styles as $name => $props ) {
			self::register_style( $name, $props['src'], $props['deps'], $props['version'] );
		}
	}

    /**
	 * Localize all scripts.
	 *
	 * @param string $handle Script handle the data will be attached to.
	 */
    public static function localize_scripts( $handle ) {
        // Get all tab setting's database value.
        $settings_databases_value = array();

		$tabs_names = apply_filters(
			'multivendorx_additional_tabs_names',
            array(
                'general',
                'vendor-registration-form',
                'seller-dashboard',
                'store',
                'products',
                'products-capability',
                'commissions',
                'marketplace-settings',
                'user-capability',
                'store-capability',
                'identity-verification',
                'commission-rule',
                'payment-integration',
                'store-appearance'
            )
		);

        foreach ( $tabs_names as $tab_name ) {
            $option_name                           = str_replace( '-', '_', 'multivendorx_' . $tab_name . '_settings' );
            $settings_databases_value[ $tab_name ] = MultiVendorX()->setting->get_option( $option_name );
        }

        $pages = get_pages();
        $woocommerce_pages = array(wc_get_page_id('shop'), wc_get_page_id('cart'), wc_get_page_id('checkout'), wc_get_page_id('myaccount'));
        if($pages){
            foreach ($pages as $page) {
                if (!in_array($page->ID, $woocommerce_pages)) {
                    $pages_array[] = array(
                        'value'=> $page->ID,
                        'label'=> $page->post_title,
                        'key'=> $page->ID,
                    );
                }
            }

            $shortcode = '[multivendorx_store_dashboard]';
            $matched_pages = array_filter( $pages, function ( $page ) use ( $shortcode ) {
                return strpos( $page->post_content, $shortcode ) !== false;
            });
            $vendor_dashboard_pages = [];
            foreach ( $matched_pages as $page ) {
                $vendor_dashboard_pages[] = array(
                    'value'=> $page->post_name,
                    'label'=> $page->post_title,
                    'key'=> $page->ID,
                );
            }
        }

        $woo_countries = new \WC_Countries();
        $countries = $woo_countries->get_allowed_countries();
        $country_list = [];
        foreach ($countries as $countries_key => $countries_value) {
            $country_list[] = array(
                'label' => $countries_value,
                'value' => $countries_key
            );
        }

        $store_owners = get_users([
            'role'    => 'store_owner',
            'orderby' => 'ID',
            'order'   => 'ASC',
        ]);

        $owners_list = [];
        foreach ( $store_owners as $owner ) {
            $owners_list[] = array(
                'label' => $owner->display_name,
                'value' => $owner->ID
            );
        }

        $localize_scripts = apply_filters(
            'multivendorx_localize_scripts',
            array(
                'multivendorx-admin-script'  => array(
                    'object_name' => 'appLocalizer',
					'data'        => array(
						'apiUrl'                   => untrailingslashit( get_rest_url() ),
						'restUrl'                  => MultiVendorX()->rest_namespace,
						'nonce'                    => wp_create_nonce( 'wp_rest' ),
						'khali_dabba'              => Utill::is_khali_dabba(),
						'tab_name'                 => __( 'MultiVendorX', 'multivendorx' ),
						'settings_databases_value' => $settings_databases_value,
						'pages_list'               => $pages_array,
						'vendor_dashboard_pages'   => $vendor_dashboard_pages,
						'pro_url'                  => esc_url( MULTIVENDORX_PRO_SHOP_URL ),
                        'open_uploader'            => 'Upload Image',
                        'country_list'             => $country_list,
                        'store_owners'             => $owners_list,
                        'default_logo'             => MultiVendorX()->plugin_url.'assets/images/WP-stdavatar.png',
                        'capabilities'             => StoreUtil::get_store_capability(),
                        'custom_roles'             => Roles::multivendorx_get_roles(),
                        'all_payments'             => MultiVendorX()->payments->all_payment_providers(),
					),
                ),
                'multivendorx-product-tab-script' => array(
					'object_name' => 'multivendorx',
					'data'        => array(
						'ajaxurl'     => admin_url( 'admin-ajax.php' ),
						'select_text' => __( 'Select an item...', 'multivendorx' ),
					),
				),
                'multivendorx-dashboard-components-script' => array(
                    'object_name' => 'color',
                    'data'        => array(
                        'color'            => MultiVendorX()->setting->get_setting( 'store_color_settings' ),
                    ),
                ),
			)
        );

        if ( isset( $localize_scripts[ $handle ] ) ) {
            $props = $localize_scripts[ $handle ];
            self::localize_script( $handle, $props['object_name'], $props['data'] );
        }
    }

    /**
	 * Localizes a registered script with data for use in JavaScript.
	 *
	 * @param string $handle Script handle the data will be attached to.
	 * @param string $name   JavaScript object name.
	 * @param array  $data   Data to be made available in JavaScript.
	 */
    public static function localize_script( $handle, $name, $data = array(), ) {
		wp_localize_script( $handle, $name, $data );
	}

	/**
	 * Enqueues a registered script.
	 *
	 * @param string $handle Handle of the registered script to enqueue.
	 */
    public static function enqueue_script( $handle ) {
		wp_enqueue_script( $handle );
	}

	/**
	 * Enqueues a registered style.
	 *
	 * @param string $handle Handle of the registered style to enqueue.
	 */
    public static function enqueue_style( $handle ) {
		wp_enqueue_style( $handle );
	}
}
