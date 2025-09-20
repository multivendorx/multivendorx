<?php
/**
 * FrontendScripts class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

/**
 * MooWoodle FrontendScripts class
 *
 * @class       FrontendScripts class
 * @version     3.3.0
 * @author      DualCube
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
	 * Enqueue external JavaScript files.
	 *
	 * @return void
	 */
	public static function enqueue_external_scripts() {
        $base_dir = plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/';
        $base_url = MooWoodle()->plugin_url . self::get_build_path_name() . 'js/';
        self::enqueue_scripts_from_dir( $base_dir . 'externals/', $base_url . 'externals/' );
        if ( MooWoodle()->is_dev ) {
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
            $chunk_handle = 'moowoodle-script-' . sanitize_title( $chunk_file );
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
		$version = MooWoodle()->version;
		// Enqueue all chunk files (External dependencies).
		self::enqueue_external_scripts();
        $index_asset = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/block/my-courses/index.asset.php';

		$register_scripts = apply_filters(
            'moowoodle_register_scripts',
            array(
				'moowoodle-my-courses-script' => array(
					'src'     => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/block/my-courses/index.js',
					'deps'    => $index_asset['dependencies'],
					'version' => $version,
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
	 * Allows style registration through `moowoodle_register_styles` filter.
	 */
    public static function register_styles() {

		$register_styles = apply_filters(
            'moowoodle_register_styles',
            array()
        );
		foreach ( $register_styles as $name => $props ) {
			self::register_style( $name, $props['src'], $props['deps'], $props['version'] );
		}
	}

	/**
	 * Register admin scripts using filters.
	 *
	 * Loads admin-specific JavaScript assets and chunked dependencies.
	 */
	public static function admin_register_scripts() {
		$version = MooWoodle()->version;
		// Enqueue all chunk files (External dependencies).
        self::enqueue_external_scripts();
        $index_asset      = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
		$register_scripts = apply_filters(
            'admin_moowoodle_register_scripts',
            array(
				'moowoodle-admin-script'       => array(
					'src'     => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/index.js',
					'deps'    => $index_asset['dependencies'],
					'version' => $version,
				),
				'moowoodle-components-script'  => array(
					'src'     => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/components.js',
					'deps'    => $component_asset['dependencies'],
					'version' => $version,
				),
				'moowoodle-product-tab-script' => array(
					'src'     => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/' . MOOWOODLE_PLUGIN_SLUG . '-product-tab.min.js',
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
		$version = MooWoodle()->version;

		$register_styles = apply_filters(
            'admin_moowoodle_register_styles',
            array(
				'moowoodle-components-style'  => array(
					'src'     => MooWoodle()->plugin_url . self::get_build_path_name() . 'styles/components.css',
					'deps'    => array(),
					'version' => $version,
				),

				'moowoodle-product-tab-style' => array(
					'src'     => MooWoodle()->plugin_url . self::get_build_path_name() . 'styles/' . MOOWOODLE_PLUGIN_SLUG . '-product-tab.min.css',
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
	 * Register and enqueue all frontend scripts and styles.
	 */
	public static function load_scripts() {
        self::register_scripts();
		self::register_styles();
    }

	/**
	 * Register and enqueue all admin scripts and styles.
	 */
	public static function admin_load_scripts() {
        self::admin_register_scripts();
		self::admin_register_styles();
    }

	/**
	 * Localize all scripts.
	 *
	 * @param string $handle Script handle the data will be attached to.
	 */
    public static function localize_scripts( $handle ) {
		$settings_databases_value = array();

		$tabs_names = apply_filters(
			'moowoodle_additional_tabs_names',
			array(
				'general',
				'display',
				'tool',
				'log',
				'notification',
				'synchronize-course',
				'synchronize-user',
			)
		);

		foreach ( $tabs_names as $tab_name ) {
			$option_name                           = str_replace( '-', '_', 'moowoodle_' . $tab_name . '_settings' );
			$settings_databases_value[ $tab_name ] = (object) MooWoodle()->setting->get_option( $option_name );
		}

		// Get my account menu.
		$my_account_menu = wc_get_account_menu_items();
		unset( $my_account_menu['my-courses'] );
        $localize_scripts = apply_filters(
            'moowoodle_localize_scripts',
            array(
				'moowoodle-my-courses-script'  => array(
					'object_name' => 'courseMyAcc',
					'data'        => array(
						'apiUrl'          => untrailingslashit( get_rest_url() ),
						'restUrl'         => 'moowoodle/v1',
						'nonce'           => wp_create_nonce( 'wp_rest' ),
						'moodle_site_url' => MooWoodle()->setting->get_setting( 'moodle_url' ),
					),
				),
				'moowoodle-admin-script'       => array(
					'object_name' => 'appLocalizer',
					'data'        => array(
						'apiUrl'                   => untrailingslashit( get_rest_url() ),
						'restUrl'                  => 'moowoodle/v1',
						'nonce'                    => wp_create_nonce( 'wp_rest' ),
						'settings_databases_value' => $settings_databases_value,
						'khali_dabba'              => Util::is_khali_dabba(),
						'shop_url'                 => MOOWOODLE_PRO_SHOP_URL,
						'video_url'                => MOOWOODLE_YOUTUBE_VIDEO_URL,
						'chat_url'                 => MOOWOODLE_CHAT_URL,
						'accountmenu'              => $my_account_menu,
						'tab_name'                 => __( 'MooWoodle', 'moowoodle' ),
						'log_url'                  => get_site_url( null, str_replace( ABSPATH, '', MooWoodle()->log_file ) ),
						'wc_email_url'             => admin_url( '/admin.php?page=wc-settings&tab=email&section=enrollmentemail' ),
						'moodle_site_url'          => MooWoodle()->setting->get_setting( 'moodle_url' ),
						'wp_user_roles'            => wp_roles()->get_names(),
						'free_version'             => MooWoodle()->version,
						'products_link'            => MOOWOODLE_PRODUCTS_LINKS,
						'pro_data'                 => apply_filters(
                            'moowoodle_update_pro_data',
                            array(
								'version'         => false,
								'manage_plan_url' => MOOWOODLE_PRO_SHOP_URL,
                            )
                        ),
						'md_user_roles'            => array(
							1 => __( 'Manager', 'moowoodle' ),
							2 => __( 'Course creator', 'moowoodle' ),
							3 => __( 'Teacher', 'moowoodle' ),
							4 => __( 'Non-editing teacher', 'moowoodle' ),
							5 => __( 'Student', 'moowoodle' ),
							7 => __( 'Authenticated user', 'moowoodle' ),
						),
					),
				),
				'moowoodle-product-tab-script' => array(
					'object_name' => 'moowoodle',
					'data'        => array(
						'ajaxurl'     => admin_url( 'admin-ajax.php' ),
						'select_text' => __( 'Select an item...', 'moowoodle' ),
						'khali_dabba' => MooWoodle()->util->is_khali_dabba(),
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
