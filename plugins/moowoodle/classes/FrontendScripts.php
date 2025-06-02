<?php

namespace MooWoodle;

/**
 * MooWoodle FrontendScripts class
 *
 * @class       FrontendScripts class
 * @version     6.0.4
 * @author      Dualcube
 */
class FrontendScripts {

    public static $scripts = array();
    public static $styles  = array();

    public function __construct() {
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_load_scripts' ) );
    }

	public static function get_script_name( $name ) {
        if ( MooWoodle()->is_dev ) {
			return $name;
        }
        return PLUGIN_SLUG . '-' . $name . '.min';
    }

    public static function get_build_path_name() {
        if ( MooWoodle()->is_dev ) {
			return 'release/assets/';
        }
        return 'assets/';
    }

	public static function enqueue_external_scripts() {
        $chunks_dir = plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/externals/';
        $chunks_url = MooWoodle()->plugin_url . self::get_build_path_name() . 'js/externals/';
        $js_files   = glob( $chunks_dir . '*.js' );

        foreach ( $js_files as $chunk_path ) {
            $chunk_file   = basename( $chunk_path );
            $chunk_handle = 'moowoodle-script-' . sanitize_title( $chunk_file );
            $asset_file   = str_replace( '.js', '.asset.php', $chunk_path );
            $deps         = array();
            $version      = filemtime( $chunk_path );

            if ( file_exists( $asset_file ) ) {
                $asset   = include $asset_file;
                $deps    = $asset['dependencies'] ?? array();
                $version = $asset['version'] ?? $version;
            }
file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":chunk_handle:  : " . var_export($chunk_handle, true) . "\n", FILE_APPEND);

            wp_enqueue_script(
                $chunk_handle,
                $chunks_url . $chunk_file,
                $deps,
                $version,
                true
            );
        }
    }

    public static function register_script( $handle, $path, $deps = array(), $version = '', $text_domain = '' ) {
		self::$scripts[] = $handle;
		wp_register_script( $handle, $path, $deps, $version, true );
        wp_set_script_translations( $handle, 'moowoodle' );
	}

    public static function register_style( $handle, $path, $deps = array(), $version = '' ) {
		self::$styles[] = $handle;
		wp_register_style( $handle, $path, $deps, $version );
	}

    public static function register_scripts() {
		$version = MooWoodle()->version;
		// Enqueue all chunk files (External dependencies)
        self::enqueue_external_scripts();
        $index_asset = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';

		$register_scripts = apply_filters(
            'moowoodle_register_scripts',
            array(
				'moowoodle-my-courses-script' => array(
					'src'         => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/block/my-courses/index.js',
					'deps'        => $index_asset['dependencies'],
					'version'     => $version,
					'text_domain' => 'moowoodle',
				),
            )
        );
		foreach ( $register_scripts as $name => $props ) {
			self::register_script( $name, $props['src'], $props['deps'], $props['version'], $props['text_domain'] );
		}
	}

    public static function register_styles() {

		$register_styles = apply_filters(
            'moowoodle_register_styles',
            array()
        );
		foreach ( $register_styles as $name => $props ) {
			self::register_style( $name, $props['src'], $props['deps'], $props['version'] );
		}
	}

	public static function admin_register_scripts() {
		$version = MooWoodle()->version;
		// Enqueue all chunk files (External dependencies)
        self::enqueue_external_scripts();
        $index_asset      = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
		$register_scripts = apply_filters(
            'admin_moowoodle_register_scripts',
            array(
				'moowoodle-admin-script'      => array(
					'src'         => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/index.js',
					'deps'        => $index_asset['dependencies'],
					'version'     => $version,
					'text_domain' => 'moowoodle',
				),
				'moowoodle-components-script' => array(
					'src'         => MooWoodle()->plugin_url . self::get_build_path_name() . 'js/components.js',
					'deps'        => $component_asset['dependencies'],
					'version'     => $version,
					'text_domain' => 'moowoodle',
				),
				'moowoodle-product-tab-js'    => array(
					'src'         => MooWoodle()->plugin_url . 'assets/js/' . self::get_script_name( 'product-tab' ) . '.js',
					'deps'        => array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'react-jsx-runtime' ),
					'version'     => $version,
					'text_domain' => 'moowoodle',
				),
            )
        );
		foreach ( $register_scripts as $name => $props ) {
			self::register_script( $name, $props['src'], $props['deps'], $props['version'], $props['text_domain'] );
		}
	}

    public static function admin_register_styles() {
		$version = MooWoodle()->version;

		$register_styles = apply_filters(
            'admin_moowoodle_register_styles',
            array(
				'moowoodle-admin-style'      => array(
					'src'     => MooWoodle()->plugin_url . self::get_build_path_name() . 'styles/index.css',
					'deps'    => array(),
					'version' => $version,
				),
				'moowoodle-components-style' => array(
					'src'     => MooWoodle()->plugin_url . self::get_build_path_name() . 'styles/components.css',
					'deps'    => array(),
					'version' => $version,
				),

				'moowoodle-product-tab-css'  => array(
					'src'     => MooWoodle()->plugin_url . 'assets/styles/' . self::get_script_name( 'product-tab' ) . '.css',
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

    public static function localize_scripts( $handle ) {
		$settings_databases_value = array();

		$tabs_names = array(
			'general',
			'display',
			'sso',
			'tool',
			'log',
			'notification',
			'synchronize-course',
			'synchronize-user',
			'classroom',
			'synchronize-cohort',
		);

		foreach ( $tabs_names as $tab_name ) {
			$option_name                           = str_replace( '-', '_', 'moowoodle_' . $tab_name . '_settings' );
			$settings_databases_value[ $tab_name ] = (object) MooWoodle()->setting->get_option( $option_name );
		}

		// Get my account menu
		$my_account_menu = wc_get_account_menu_items();
		unset( $my_account_menu['my-courses'] );

		$pro_sticker = apply_filters( 'is_moowoodle_pro_inactive', true ) ?

		'<span class="mw-pro-tag" style="font-size: 0.5rem; background: #e35047; padding: 0.125rem 0.5rem; color: #F9F8FB; font-weight: 700; line-height: 1.1; position: absolute; border-radius: 2rem 0; right: -0.75rem; top: 50%; transform: translateY(-50%)">Pro</span>' : '';

        $localize_scripts = apply_filters(
            'moowoodle_localize_scripts',
            array(
				'moowoodle-my-courses-script' => array(
					'object_name' => 'courseMyAcc',
					'data'        => array(
						'apiUrl'          => untrailingslashit( get_rest_url() ),
						'restUrl'         => 'moowoodle/v1',
						'nonce'           => wp_create_nonce( 'wp_rest' ),
						'moodle_site_url' => MooWoodle()->setting->get_setting( 'moodle_url' ),
					),
				),
				'moowoodle-admin-script'      => array(
					'object_name' => 'appLocalizer',
					'data'        => array(
						'apiUrl'                   => untrailingslashit( get_rest_url() ),
						'restUrl'                  => 'moowoodle/v1',
						'nonce'                    => wp_create_nonce( 'wp_rest' ),
						'settings_databases_value' => $settings_databases_value,
						'khali_dabba'              => Util::is_khali_dabba(),
						'pro_sticker'              => $pro_sticker,
						'shop_url'                 => MOOWOODLE_PRO_SHOP_URL,
						'accountmenu'              => $my_account_menu,
						'tab_name'                 => __( 'MooWoodle', 'moowoodle' ),
						'log_url'                  => get_site_url( null, str_replace( ABSPATH, '', MooWoodle()->log_file ) ),
						'wc_email_url'             => admin_url( '/admin.php?page=wc-settings&tab=email&section=enrollmentemail' ),
						'moodle_site_url'          => MooWoodle()->setting->get_setting( 'moodle_url' ),
						'wordpress_logo'           => MooWoodle()->plugin_url . 'src/assets/images/WordPress.png',
						'moodle_logo'              => MooWoodle()->plugin_url . 'src/assets/images/Moodle.png',
						'wp_user_roles'            => wp_roles()->get_names(),
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
				'moowoodle-product-tab-js'    => array(
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

    public static function localize_script( $handle, $name, $data = array(), ) {
		wp_localize_script( $handle, $name, $data );
	}

    public static function enqueue_script( $handle ) {
		wp_enqueue_script( $handle );
	}

    public static function enqueue_style( $handle ) {
		wp_enqueue_style( $handle );
	}
}
