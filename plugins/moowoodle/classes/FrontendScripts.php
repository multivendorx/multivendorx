<?php
/**
 * FrontendScripts class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle FrontendScripts class
 *
 * @class       FrontendScripts class
 * @version     3.3.0
 * @author      MooWoodle
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
        if ( MooWoodle()->is_dev ) {
			return 'release/assets/';
        }
        return 'assets/';
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
        wp_set_script_translations( $handle, 'moowoodle' );
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
	 * Loads block assets and additional scripts defined through the `moowoodle_register_scripts` filter.
	 */
    public static function register_scripts() {
        $version      = MooWoodle()->version;
        $index_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $vendor_asset = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/vendors.asset.php';

        $base_url    = MooWoodle()->plugin_url . self::get_build_path_name() . 'js/';
        $common_deps = array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'wp-blocks' );

        $block_scripts = array(
            'my-courses',
        );

        $register_scripts = apply_filters(
            'moowoodle_register_scripts',
            array(
                'moowoodle-vendor-script' => array(
                	'src'  => $base_url . 'vendors.js',
                	'deps' => $vendor_asset['dependencies'],
                ),
            )
        );

        foreach ( $block_scripts as $handle ) {
            $asset_path = plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . "js/block/{$handle}/index.asset.php";
            $asset      = file_exists( $asset_path )
                ? include $asset_path
                : array(
					'dependencies' => array(),
					'version'      => $version,
				);

            $register_scripts[ "moowoodle-{$handle}-script" ] = array(
                'src'  => $base_url . "block/{$handle}/index.js",
                'deps' => $asset['dependencies'],
            );
        }

        foreach ( $register_scripts as $name => $props ) {
            self::register_script( $name, $props['src'], $props['deps'], $props['version'] ?? $version );
        }
    }

    /**
	 * Register frontend styles using filters.
	 *
	 * Allows style registration through `moowoodle_register_styles` filter.
	 */
    public static function register_styles() {
        $version         = MooWoodle()->version;
        $register_styles = apply_filters(
            'moowoolde_register_styles',
            array()
        );
        foreach ( $register_styles as $name => $props ) {
            self::register_style( $name, $props['src'], array(), $props['version'] ?? $version );
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
		$version = MooWoodle()->version;
        // Enqueue all chunk files (External dependencies).
        $index_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $vendor_asset = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/vendors.asset.php';

        $register_scripts = apply_filters(
            'admin_moowoodle_register_scripts',
            array(
                'moowoodle-vendor-script'      => array(
                	'src'  => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/vendors.js',
                	'deps' => $vendor_asset['dependencies'],
                ),
				'moowoodle-admin-script'       => array(
					'src'  => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/index.js',
					'deps' => $index_asset['dependencies'],
				),
				'moowoodle-product-tab-script' => array(
					'src'  => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/' . MOOWOODLE_PLUGIN_SLUG . '-product-tab.min.js',
					'deps' => array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'react-jsx-runtime' ),
				),
            )
        );
		foreach ( $register_scripts as $name => $props ) {
			self::register_script( $name, $props['src'], $props['deps'], $props['version'] ?? $version );
		}
	}

    /**
	 * Register admin styles using filters.
	 *
	 * Allows style registration through `admin_moowoodle_register_styles` filter.
	 */
    public static function admin_register_styles() {
		$version         = MooWoodle()->version;
		$register_styles = apply_filters(
            'admin_moowoodle_register_styles',
            array(
				'moowoodle-index-style'       => array(
					'src' => MooWoodle()->plugin_url . self::get_build_path_name() . 'styles/index.css',
				),
				'moowoodle-product-tab-style' => array(
					'src'  => MooWoodle()->plugin_url . self::get_build_path_name() . 'styles/' . MOOWOODLE_PLUGIN_SLUG . '-product-tab.min.css',
					'deps' => array(),
				),
			)
        );

		foreach ( $register_styles as $name => $props ) {
			self::register_style( $name, $props['src'], array(), $props['version'] ?? $version );
		}
	}
	/**
	 * Get base AJAX data for frontend scripts
	 *
	 * @param string $handle Script handle used for nonce creation.
	 * @return array Base AJAX data including admin-ajax URL and nonce.
	 */
    public static function get_base_ajax_data( $handle ) {
        return array(
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( $handle ),
        );
    }

    /**
	 * Localize all scripts.
	 *
	 * @param string $handle Script handle the data will be attached to.
	 */
    public static function localize_scripts( $handle ) {
        if ( isset( $localized[ $handle ] ) ) {
            return;
        }

        // Get all tab setting's database value.
        $settings_databases_value = array();

        $tabs_names = apply_filters(
            'moowoodle_additional_tabs_names',
            array_keys( Util::MOOWOODLE_SETTINGS )
        );

        foreach ( $tabs_names as $tab_name ) {
            $option_name                           = str_replace( '-', '_', 'moowoodle_' . $tab_name . '_settings' );
            $settings_databases_value[ $tab_name ] = MooWoodle()->setting->get_option( $option_name );
        }

        $base_rest = array(
            'apiUrl'  => untrailingslashit( get_rest_url() ),
            'restUrl' => MooWoodle()->rest_namespace,
            'nonce'   => wp_create_nonce( 'wp_rest' ),
        );

        $settings_data = array(
            'settings_databases_value' => $settings_databases_value,
        );

		$my_account_menu = wc_get_account_menu_items();
		unset( $my_account_menu['my-courses'] );

        $localize_scripts =
            array(
                'moowoodle-admin-script'       => array(
                    'object_name'  => 'appLocalizer',
                    'use_rest'     => true,
                    'use_ajax'     => true,
                    'use_settings' => true,
					'data'         => array(
                        'test'            => 'test',
						'khali_dabba'     => Util::is_khali_dabba(),
						'shop_url'        => MOOWOODLE_PRO_SHOP_URL,
						'video_url'       => MOOWOODLE_YOUTUBE_VIDEO_URL,
						'chat_url'        => MOOWOODLE_CHAT_URL,
						'accountmenu'     => $my_account_menu,
						'tab_name'        => __( 'MooWoodle', 'moowoodle' ),
						'log_url'         => get_site_url( null, str_replace( ABSPATH, '', MooWoodle()->log_file ) ),
						'wc_email_url'    => admin_url( '/admin.php?page=wc-settings&tab=email&section=enrollmentemail' ),
						'moodle_site_url' => MooWoodle()->setting->get_setting( 'moodle_url' ),
						'wp_user_roles'   => wp_roles()->get_names(),
						'free_version'    => MooWoodle()->version,
						'products_link'   => MOOWOODLE_PRODUCTS_LINKS,
						'pro_data'        => apply_filters(
                            'moowoodle_update_pro_data',
                            array(
								'version'         => false,
								'manage_plan_url' => MOOWOODLE_PRO_SHOP_URL,
                            )
                        ),
						'md_user_roles'   => array(
							1 => __( 'Manager', 'moowoodle' ),
							2 => __( 'Course creator', 'moowoodle' ),
							3 => __( 'Teacher', 'moowoodle' ),
							4 => __( 'Non-editing teacher', 'moowoodle' ),
							5 => __( 'Student', 'moowoodle' ),
							7 => __( 'Authenticated user', 'moowoodle' ),
						),
                        'date_format'     => Util::wp_to_react_date_format( get_option( 'date_format' ) ),
					),
                ),
                'moowoodle-my-courses-script'  => array(
					'object_name' => 'courseMyAcc',
                    'use_rest'    => true,
					'data'        => array(
						'moodle_site_url' => MooWoodle()->setting->get_setting( 'moodle_url' ),
                        'current_user_id' => get_current_user_id(),
					),
				),
				'moowoodle-product-tab-script' => array(
					'object_name' => 'moowoodle',
                    'use_ajax'    => true,
					'data'        => array(
						'select_text' => __( 'Select an item...', 'moowoodle' ),
						'khali_dabba' => MooWoodle()->util->is_khali_dabba(),
					),
				),
			);

        $localize_scripts = apply_filters( 'moowoodle_localize_scripts', $localize_scripts );
        $config           = $localize_scripts[ $handle ] ?? array();

        $data = array();

        if ( ! empty( $config['use_ajax'] ) && ! empty( $config['use_rest'] ) ) {
            $base_ajax = self::get_base_ajax_data( $handle );
            unset( $base_ajax['nonce'] );
            $data = array_merge( $data, $base_ajax );
        } else {
            $data = array_merge( $data, self::get_base_ajax_data( $handle ) );
        }

        if ( ! empty( $config['use_rest'] ) ) {
            $data = array_merge( $data, $base_rest );
        }

        if ( ! empty( $config['use_settings'] ) ) {
            $data = array_merge( $data, $settings_data );
        }

        if ( ! empty( $config['data'] ) ) {
            $data = array_merge( $data, $config['data'] );
        }

        if ( isset( $localize_scripts[ $handle ] ) ) {
            $props = $localize_scripts[ $handle ];
            self::localize_script( $handle, $props['object_name'], $data );
        }
    }

    /**
	 * Localizes a registered script with data for use in JavaScript.
	 *
	 * @param string $handle Script handle the data will be attached to.
	 * @param string $name   JavaScript object name.
	 * @param array  $data   Data to be made available in JavaScript.
	 */
    public static function localize_script( $handle, $name, $data = array() ) {
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
