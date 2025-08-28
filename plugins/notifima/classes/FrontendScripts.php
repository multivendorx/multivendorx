<?php
/**
 * FrontendScripts class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima FrontendScripts class
 *
 * @class       FrontendScripts class
 * @version     3.0.0
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
        if ( Notifima()->is_dev ) {
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
        $base_url = Notifima()->plugin_url . self::get_build_path_name() . 'js/';
        self::enqueue_scripts_from_dir( $base_dir . 'externals/', $base_url . 'externals/' );
        if ( Notifima()->is_dev ) {
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
            $chunk_handle = 'notifima-script-' . sanitize_title( $chunk_file );
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
        wp_set_script_translations( $handle, 'notifima' );
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
	 * Loads block assets and additional scripts defined through the `notifima_register_scripts` filter.
	 */
    public static function register_scripts() {
        $version          = Notifima()->version;
        $register_scripts = apply_filters(
            'notifima_register_scripts',
            array(
				'notifima-frontend-script' => array(
					'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'js/' . NOTIFIMA_PLUGIN_SLUG . '-frontend.min.js',
					'deps'    => array( 'jquery', 'wp-element', 'wp-components' ),
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
	 * Allows style registration through `notifima_register_styles` filter.
	 */
    public static function register_styles() {
        $version         = Notifima()->version;
        $register_styles = apply_filters(
            'notifima_register_styles',
            array(
				'notifima-frontend-style' => array(
					'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'styles/' . NOTIFIMA_PLUGIN_SLUG . '-frontend.min.css',
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
		$version = Notifima()->version;
        // Enqueue all chunk files (External dependencies).
        self::enqueue_external_scripts();
        $index_asset      = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
		$register_scripts = apply_filters(
            'admin_notifima_register_scripts',
            array(
				'notifima-admin-script'      => array(
					'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'js/index.js',
					'deps'    => $index_asset['dependencies'],
					'version' => $version,
				),
				'notifima-components-script' => array(
					'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'js/components.js',
					'deps'    => $component_asset['dependencies'],
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
		$version         = Notifima()->version;
		$register_styles = apply_filters(
            'admin_notifima_register_styles',
            array(
				'notifima-components-style' => array(
					'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'styles/components.css',
					'deps'    => array(),
					'version' => $version,
				),
				'notifima-admin-style'      => array(
					'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'styles/' . NOTIFIMA_PLUGIN_SLUG . '-admin.min.css',
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
			'notifima_additional_tabs_names',
			array( 'appearance', 'form_submission' )
		);

        foreach ( $tabs_names as $tab_name ) {
            $settings_databases_value[ $tab_name ] = Notifima()->setting->get_option( 'notifima_' . $tab_name . '_settings' );
        }

        $settings_array  = Utill::get_form_settings_array();
        $button_settings = $settings_array['customize_btn'];

        $button_css = Notifima()->frontend->subscribe_button_styles();

        $subscribe_button_html = '<button style="' . $button_css . '" class="notifima-subscribe notifima-button subscribe-button-hover">' . $button_settings['button_text'] . '</button>';

        $localize_scripts = apply_filters(
            'notifima_localize_scripts',
            array(
				'notifima-frontend-script'                 => array(
					'object_name' => 'frontendLocalizer',
					'data'        => array(
						'ajax_url'          => admin_url( 'admin-ajax.php', 'relative' ),
						'nonce'             => wp_create_nonce( 'notifima-security-nonce' ),
						'additional_fields' => apply_filters( 'notifima_subscription_form_additional_fields', '' ),
						'button_html'       => $subscribe_button_html,
						'processing'        => __( 'Processing...', 'notifima' ),
					),
				),
                'notifima-admin-script'                    => array(
                    'object_name' => 'appLocalizer',
					'data'        => array(
						'apiUrl'                   => untrailingslashit( get_rest_url() ),
						'restUrl'                  => Notifima()->rest_namespace,
						'nonce'                    => wp_create_nonce( 'wp_rest' ),
						'export_button'            => admin_url( 'admin-ajax.php?action=export_subscribers' ),
						'khali_dabba'              => Utill::is_khali_dabba(),
						'tab_name'                 => __( 'Notifima', 'notifima' ),
						'settings_databases_value' => $settings_databases_value,
						'pro_url'                  => esc_url( NOTIFIMA_PRO_SHOP_URL ),
					),
                ),
				'notifima-stock-notification-block-script' => array(
					'object_name' => 'stockNotificationBlock',
					'data'        => array(
						'apiUrl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => Notifima()->rest_namespace,
						'nonce'   => wp_create_nonce( 'wp_rest' ),
					),
				),
				'notifima-stock-notification-block-editor-script' => array(
					'object_name' => 'stockNotificationBlock',
					'data'        => array(
						'apiUrl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => Notifima()->rest_namespace,
						'nonce'   => wp_create_nonce( 'wp_rest' ),
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
