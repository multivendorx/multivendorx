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

    private static $settings_cache = null;

    private static $account_menu_cache = null;

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

    public static function get_asset_path( $type = 'url', $plugin_path = '', $plugin_url = '' ) {
        $build_path = MooWoodle()->is_dev ? 'release/assets/' : 'assets/';
        if ( !empty( $plugin_path ) && !empty( $plugin_url ) ) {
            $plugin_path = MooWoodle()->plugin_path;
            $plugin_url = MooWoodle()->plugin_url;
        }

        return 'file' === $type
            ? $plugin_path . $build_path
            : $plugin_url . $build_path;
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
        if ( wp_script_is( $handle, 'registered' ) ) {
			return;
		}
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
        if ( wp_style_is( $handle, 'registered' ) ) {
			return;
		}
        wp_register_style( $handle, $path, $deps, $version );
    }

    /**
	 * Register frontend scripts using filters and enqueue required external scripts.
	 *
	 * Loads block assets and additional scripts defined through the `moowoodle_register_scripts` filter.
	 */
    public static function register_scripts() {
        $version      = MooWoodle()->version;
        $vendor_asset = include self::get_asset_path('file') . 'js/vendors.asset.php';

        $block_scripts = array(
            'my-courses',
        );

        $register_scripts = apply_filters(
            'moowoodle_register_scripts',
            array(
                'moowoodle-vendor' => array(
                	'src'  => self::get_asset_path() . 'js/vendors.js',
                	'deps' => $vendor_asset['dependencies'],
                ),
            )
        );

        foreach ( $block_scripts as $handle ) {
            $asset_path = self::get_asset_path('file') . "js/block/{$handle}/index.asset.php";
            $asset      = file_exists( $asset_path )
                ? include $asset_path
                : array(
					'dependencies' => array(),
					'version'      => $version,
				);

            $register_scripts[ "moowoodle-{$handle}" ] = array(
                'src'  => self::get_asset_path() . "js/block/{$handle}/index.js",
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
            'moowoodle_register_styles',
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
        $index_asset  = include self::get_asset_path('file') . 'js/index.asset.php';
        $vendor_asset = include self::get_asset_path('file') . 'js/vendors.asset.php';

        $register_scripts = apply_filters(
            'admin_moowoodle_register_scripts',
            array(
                'moowoodle-vendor'      => array(
                	'src'  => self::get_asset_path() . 'js/vendors.js',
                	'deps' => $vendor_asset['dependencies'],
                ),
				'moowoodle-admin'       => array(
					'src'  => self::get_asset_path() . 'js/index.js',
					'deps' => $index_asset['dependencies'],
				),
				'moowoodle-product-tab' => array(
					'src'  => self::get_asset_path() . 'js/' . MOOWOODLE_PLUGIN_SLUG . '-product-tab.min.js',
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
				'moowoodle-index'       => array(
					'src' => self::get_asset_path() . 'styles/index.css',
				),
				'moowoodle-product-tab' => array(
					'src'  => self::get_asset_path() . 'styles/' . MOOWOODLE_PLUGIN_SLUG . '-product-tab.min.css',
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

    public static function get_admin_settings() {
        if ( null !== self::$settings_cache ) {
            return self::$settings_cache;
        }

        $settings = array();

        $tabs_names = apply_filters(
            'moowoodle_additional_tabs_names',
            array_keys( Util::MOOWOODLE_SETTINGS )
        );

        foreach ( $tabs_names as $tab_name ) {
            $option_name                           = str_replace( '-', '_', 'moowoodle_' . $tab_name . '_settings' );
            $settings[ $tab_name ] = MooWoodle()->setting->get_option( $option_name );
        }

        self::$settings_cache = $settings;
        return self::$settings_cache;
    }

    public static function get_account_menu() {
        if ( null !== self::$account_menu_cache ) {
            return self::$account_menu_cache;
        }

        $menu = wc_get_account_menu_items();
        unset( $menu['my-courses'] );

        self::$account_menu_cache = $menu;
        return self::$account_menu_cache;
    }

    /**
	 * Localize all scripts.
	 *
	 * @param string $handle Script handle the data will be attached to.
	 */
    public static function localize_scripts( $handle ) {
        $base_rest = array(
            'apiUrl'  => untrailingslashit( get_rest_url() ),
            'restUrl' => MooWoodle()->rest_namespace,
            'nonce'   => wp_create_nonce( 'wp_rest' ),
        );

        $settings_data = array(
            'admin_settings' => self::get_admin_settings(),
        );

        $localize_scripts =
            array(
                'moowoodle-admin'       => array(
                    'object_name'  => 'appLocalizer',
                    'use_rest'     => true,
                    'use_ajax'     => true,
                    'use_settings' => true,
					'data'         => array(
						'khali_dabba'     => Util::is_khali_dabba(),
						'shop_url'        => MOOWOODLE_PRO_SHOP_URL,
						'video_url'       => MOOWOODLE_YOUTUBE_VIDEO_URL,
						'chat_url'        => MOOWOODLE_CHAT_URL,
						'account_menu'     => self::get_account_menu(),
						'tab_name'        => __( 'MooWoodle', 'moowoodle' ),
						'wc_email_url'    => admin_url( '/admin.php?page=wc-settings&tab=email&section=enrollmentemail' ),
						'moodle_site_url' => MooWoodle()->setting->get_setting( 'moodle_url' ),
						'wp_user_roles'   => wp_roles()->get_names(),
						'free_version'    => MooWoodle()->version,
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
                'moowoodle-my-courses'  => array(
					'object_name' => 'courseMyAcc',
                    'use_rest'    => true,
					'data'        => array(
                        'current_user_id' => MooWoodle()->current_user_id,
					),
				),
				'moowoodle-product-tab' => array(
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
