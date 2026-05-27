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
     * Cached admin settings.
     *
     * @var array|null
     */
    private static $settings_cache = null;

    /**
     * Cached WooCommerce account menu.
     *
     * @var array|null
     */
    private static $account_menu_cache = null;

    /**
     * FrontendScripts constructor.
     */
    public function __construct() {
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
    }

    /**
	 * Get the build path for assets based on environment.
	 *
	 * @return string Relative path to the build directory.
	 */
    public static function get_asset_path( $path_type = 'url', $plugin_path = '', $plugin_url = '' ) {
        $build_path = 'assets/';
        if ( $plugin_path === '' ) {
            $plugin_path = MooWoodle()->plugin_path;
        }
        if ( $plugin_url === '' ) {
            $plugin_url = MooWoodle()->plugin_url;
        }

        return 'file' === $path_type
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
	 * Loads block assets and additional scripts defined through the `moowoodle_frontend_scripts` filter.
	 */
    public static function register_frontend_scripts() {
        $version      = MooWoodle()->version;
        $vendor_asset = include self::get_asset_path( 'file' ) . 'js/vendors.asset.php';

        $block_scripts = array(
            'my-courses',
            'moodle-enrollment-mapping',
        );

        $registered_scripts = apply_filters(
            'moowoodle_frontend_scripts',
            array(
                'moowoodle-vendor' => array(
                	'src'  => self::get_asset_path() . 'js/vendors.js',
                	'deps' => $vendor_asset['dependencies'],
                ),
            )
        );

        foreach ( $block_scripts as $handle ) {
            $asset_path = self::get_asset_path( 'file' ) . "js/block/{$handle}/index.asset.php";
            $asset      = file_exists( $asset_path )
                ? include $asset_path
                : array(
					'dependencies' => array(),
					'version'      => $version,
				);

            $registered_scripts[ "moowoodle-{$handle}" ] = array(
                'src'  => self::get_asset_path() . "js/block/{$handle}/index.js",
                'deps' => $asset['dependencies'],
            );
        }

        foreach ( $registered_scripts as $name => $script_config ) {
            self::register_script( $name, $script_config['src'], $script_config['deps'], $script_config['version'] ?? $version );
        }
    }

    /**
	 * Register frontend styles using filters.
	 *
	 * Allows style registration through `moowoodle_frontend_styles` filter.
	 */
    public static function register_frontend_styles() {
        $version           = MooWoodle()->version;
        $registered_styles = apply_filters(
            'moowoodle_frontend_styles',
            array()
        );
        foreach ( $registered_styles as $name => $style_config ) {
            self::register_style( $name, $style_config['src'], array(), $style_config['version'] ?? $version );
        }
    }

    /**
     * Register/queue frontend scripts.
     */
    public static function enqueue_frontend_assets() {
        self::register_frontend_scripts();
        self::register_frontend_styles();
    }

    /**
	 * Register/queue admin scripts.
	 */
	public static function enqueue_admin_assets() {
        self::register_admin_scripts();
		self::register_admin_styles();
    }

    /**
	 * Register admin scripts using filters.
	 *
	 * Loads admin-specific JavaScript assets and chunked dependencies.
	 */
    public static function register_admin_scripts() {
		$version = MooWoodle()->version;
        // Enqueue all chunk files (External dependencies).
        $index_asset_path = self::get_asset_path( 'file' ) . 'js/index.asset.php';
        $index_asset      = file_exists( $index_asset_path )
            ? include $index_asset_path
            : array(
                'dependencies' => array(),
                'version'      => $version,
            );

        $vendor_asset_path = self::get_asset_path( 'file' ) . 'js/vendors.asset.php';
        $vendor_asset      = file_exists( $vendor_asset_path )
            ? include $vendor_asset_path
            : array(
                'dependencies' => array(),
                'version'      => $version,
            );

        $registered_scripts = apply_filters(
            'moowoodle_admin_scripts',
            array(
                'moowoodle-vendor' => array(
                	'src'  => self::get_asset_path() . 'js/vendors.js',
                	'deps' => $vendor_asset['dependencies'],
                ),
				'moowoodle-admin'  => array(
					'src'  => self::get_asset_path() . 'js/index.js',
					'deps' => $index_asset['dependencies'],
				),
            )
        );
		foreach ( $registered_scripts as $name => $script_config ) {
			self::register_script( $name, $script_config['src'], $script_config['deps'], $script_config['version'] ?? $version );
		}
	}

    /**
	 * Register admin styles using filters.
	 *
	 * Allows style registration through `moowoodle_admin_styles` filter.
	 */
    public static function register_admin_styles() {
		$version           = MooWoodle()->version;
		$registered_styles = apply_filters(
            'moowoodle_admin_styles',
            array(
				'moowoodle-index'                     => array(
					'src' => self::get_asset_path() . 'styles/index.css',
				),
                'moowoodle-moodle-enrollment-mapping' => array(
					'src' => self::get_asset_path() . 'styles/block/moodle-enrollment-mapping/index.css',
				),
			),
        );

        foreach ( $registered_styles as $name => $style_config ) {
			self::register_style( $name, $style_config['src'], array(), $style_config['version'] ?? $version );
		}
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
            $option_name           = str_replace( '-', '_', 'moowoodle_' . $tab_name . '_settings' );
            $settings[ $tab_name ] = MooWoodle()->setting->get_option( $option_name );
        }

        self::$settings_cache = $settings;
        return self::$settings_cache;
    }

    public static function get_account_menu() {
        if ( null !== self::$account_menu_cache ) {
            return self::$account_menu_cache;
        }

        $account_menu_items = wc_get_account_menu_items();
        unset( $account_menu_items['my-courses'] );

        self::$account_menu_cache = $account_menu_items;
        return self::$account_menu_cache;
    }

    /**
	 * Localize all scripts.
	 *
	 * @param string $handle Script handle the data will be attached to.
	 */
    public static function localize_scripts( $handle ) {
        global $post;
        if ( $post ) {
            $wordpress_course_id = get_post_meta( $post->ID, Util::MOOWOODLE_PRODUCT_META['wordpress_course_id'], true );
            $wordpress_cohort_id = apply_filters( 'moowoodle_get_wordpress_cohort_id', null, $post->ID );
            $default_type        = $wordpress_course_id ? 'course' : ( $wordpress_cohort_id ? 'cohort' : '' );
            $selected_id         = $wordpress_course_id ? $wordpress_course_id : $wordpress_cohort_id;
        }

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
                'moowoodle-admin'                     => array(
                    'object_name'  => 'appLocalizer',
                    'use_rest'     => true,
                    'use_settings' => true,
					'data'         => array(
						'khali_dabba'     => Util::is_khali_dabba(),
						'shop_url'        => MOOWOODLE_PRO_SHOP_URL,
						'video_url'       => MOOWOODLE_YOUTUBE_VIDEO_URL,
						'chat_url'        => MOOWOODLE_CHAT_URL,
						'account_menu'    => self::get_account_menu(),
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
                'moowoodle-my-courses'                => array(
					'object_name' => 'courseMyAcc',
                    'use_rest'    => true,
				),
				'moowoodle-moodle-enrollment-mapping' => array(
					'object_name' => 'moowoodleProduct',
                    'use_rest'    => true,
					'data'        => array(
						'khali_dabba'      => MooWoodle()->util->is_khali_dabba(),
                        'postId'           => $post ? $post->ID : '',
                        'linkType'         => $default_type ?? '',
                        'linkedItemId'     => $selected_id ?? '',
                        'productMetaNonce' => wp_create_nonce( 'product_meta_nonce' ),
                        'syncUrl'          => esc_url( admin_url( 'admin.php?page=moowoodle#&tab=synchronization&subtab=synchronize-course' ) ),
					),
				),
			);

        $localize_scripts = apply_filters( 'moowoodle_localize_scripts', $localize_scripts );
        $config           = $localize_scripts[ $handle ] ?? array();

        $localized_data = array();
        $localized_data = array_merge(
            ! empty( $config['use_rest'] ) ? $base_rest : array(),
            ! empty( $config['use_settings'] ) ? $settings_data : array(),
            $config['data'] ?? array()
        );

        if ( ! empty( $config['object_name'] ) ) {
            self::localize_script( $handle, $config['object_name'], $localized_data );
        }
    }

    /**
	 * Localizes a registered script with data for use in JavaScript.
	 *
	 * @param string $handle Script handle the data will be attached to.
	 * @param string $name   JavaScript object name.
	 * @param array  $localized_data   Data to be made available in JavaScript.
	 */
    public static function localize_script( $handle, $name, $localized_data = array() ) {
		wp_localize_script( $handle, $name, $localized_data );
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
