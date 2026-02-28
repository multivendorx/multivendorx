<?php
/**
 * FrontendScripts class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

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
        $version = MultiVendorX()->version;
        self::enqueue_external_scripts();
        $index_asset      = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
        
        $base_url    = MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/';
        $common_deps = [ 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'wp-blocks' ];

        $block_scripts = [
            'contact-info',
            'marketplace-products',
            'marketplace-coupons',
            'store-coupons',
            'store-name',
            'store-description',
            'store-tabs',
            'store-email',
            'store-address',
            'store-banner',
            'store-engagement-tools',
            'store-social-icons',
            'store-logo',
            'store-phone',
            'store-provider',
            'store-review',
            'store-policy',
            'product-category',
            'store-quick-info',
            'highlighted-store-products',
        ];

        $register_scripts = apply_filters(
            'multivendorx_register_scripts',
            [
                'multivendorx-dashboard-script' => [
                    'src'  => $base_url . 'index.js',
                    'deps' => $index_asset['dependencies'],
                ],
                'multivendorx-dashboard-components-script' => [
                    'src'  => $base_url . 'components.js',
                    'deps' => $component_asset['dependencies'],
                ],
                'multivendorx-registration-form-script'    => [
					'src'     => $base_url . 'block/registration-form/index.js',
					'deps'    => $component_asset['dependencies'],
                ]
            ]
        );

        // Add block scripts
        foreach ( $block_scripts as $handle ) {
            $register_scripts[ "multivendorx-{$handle}-script" ] = [
                'src'  => $base_url . "block/{$handle}/index.js",
                'deps' => $common_deps,
            ];
        }
        
        foreach ( $register_scripts as $name => $props ) {
            self::register_script( $name, $props['src'], $props['deps'], $props['version'] ?? $version );
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
				'multivendorx-dashboard-style'    => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'styles/index.css',
				),
                'multivendorx-store-tabs-style'   => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'styles/' . MULTIVENDORX_PLUGIN_SLUG . '-store-products.min.css',
				),
                'multivendorx-common-block-style' => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'styles/' . MULTIVENDORX_PLUGIN_SLUG . '-common-block.min.css',
				),
			)
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
		$version = MultiVendorX()->version;
        // Enqueue all chunk files (External dependencies).
        self::enqueue_external_scripts();
        $index_asset      = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
		$register_scripts = apply_filters(
            'admin_multivendorx_register_scripts',
            array(
				'multivendorx-admin-script'       => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/index.js',
					'deps'    => $index_asset['dependencies'],
				),
				'multivendorx-components-script'  => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/components.js',
					'deps'    => $component_asset['dependencies'],
				),
                'multivendorx-product-tab-script' => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'js/' . MULTIVENDORX_PLUGIN_SLUG . '-product-tab.min.js',
					'deps'    => array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'react-jsx-runtime' ),
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
		$version         = MultiVendorX()->version;
		$register_styles = apply_filters(
            'admin_multivendorx_register_styles',
            array(
				'multivendorx-components-style' => array(
					'src'     => MultiVendorX()->plugin_url . self::get_build_path_name() . 'styles/components.css',
				),
			)
        );

		foreach ( $register_styles as $name => $props ) {
			self::register_style( $name, $props['src'], array(), $props['version'] ?? $version );
		}
	}

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

        if ( ! wp_script_is( $handle, 'enqueued' ) ) {
            return;
        }
        // Get all tab setting's database value.
        $settings_databases_value = array();

        $tabs_names = apply_filters(
            'multivendorx_additional_tabs_names',
            array_keys( Utill::MULTIVENDORX_SETTINGS )
        );

        foreach ( $tabs_names as $tab_name ) {
            $option_name                           = str_replace( '-', '_', 'multivendorx_' . $tab_name . '_settings' );
            $settings_databases_value[ $tab_name ] = MultiVendorX()->setting->get_option( $option_name );
        }

        $pages             = get_pages();
        $woocommerce_pages = array( wc_get_page_id( 'shop' ), wc_get_page_id( 'cart' ), wc_get_page_id( 'checkout' ), wc_get_page_id( 'myaccount' ) );
        if ( $pages ) {
            foreach ( $pages as $page ) {
                if ( ! in_array( $page->ID, $woocommerce_pages, true ) ) {
                    $pages_array[] = array(
                        'value' => $page->ID,
                        'label' => $page->post_title,
                        'key'   => $page->ID,
                    );
                }
            }
        }

        $woo_countries = new \WC_Countries();
        $countries     = $woo_countries->get_allowed_countries();
        $country_list  = array();
        foreach ( $countries as $countries_key => $countries_value ) {
            $country_list[] = array(
                'label' => $countries_value,
                'value' => $countries_key,
            );
        }

        $owners_list = array();
        if ( is_admin() ) {
            $store_owners = get_users(
                array(
                    'role'    => 'store_owner',
                    'orderby' => 'ID',
                    'order'   => 'ASC',
                )
            );

            foreach ( $store_owners as $owner ) {
                $owners_list[] = array(
                    'label' => $owner->display_name,
                    'value' => $owner->ID,
                );
            }
        }

        $gateways     = WC()->payment_gateways->payment_gateways();
        $gateway_list = array();
        foreach ( $gateways as $gateway_id => $gateway ) {
            if ( 'cheque' === $gateway_id ) {
                continue;
            }
            $gateway_list[] = array(
                'label' => $gateway->get_title(),
                'value' => $gateway_id,
            );
        }

        $capability_pro = array(
            'export_shop_report' => array(
                'prosetting' => true,
                'module'     => 'store-analytics',
            ),
            'edit_stock_alerts'  => array(
                'prosetting' => true,
                'module'     => 'store-inventory',
            ),
        );

        $store_ids = array();
        if ( ! is_admin() ) {
            $store_ids    = Store::get_store( get_current_user_id(), 'user' );
            $active_store = MultiVendorX()->active_store;

            $store    = new Store( $active_store );
            $all_meta = $store->get_all_meta();

            if ( empty( $active_store ) && ! empty( $store_ids ) ) {
                $first_store = reset( $store_ids );

                if ( ! empty( $first_store['id'] ) ) {
                    update_user_meta( get_current_user_id(), Utill::USER_SETTINGS_KEYS['active_store'], $first_store['id'] );
                }
            }
        }

        $base_rest = array(
            'apiUrl'  => untrailingslashit( get_rest_url() ),
            'restUrl' => MultiVendorX()->rest_namespace,
            'nonce'   => wp_create_nonce( 'wp_rest' ),
        );

        $settings_data = array(
            'settings_databases_value' => $settings_databases_value
        );

        $currency_data = array(
            'currency'          => get_woocommerce_currency(),
            'currency_symbol'   => get_woocommerce_currency_symbol(),
            'price_format'      => get_woocommerce_price_format(),
            'decimal_separator'   => wc_get_price_decimal_separator(),
            'thousand_separator'      => wc_get_price_thousand_separator(),
            'price_decimals'    => wc_get_price_decimals(),
            'currency_position' => get_option( 'woocommerce_currency_pos' ),
        );

        $localize_scripts = 
            array(
                'multivendorx-admin-script'                => array(
                    'object_name' => 'appLocalizer',
                    'use_rest'    => true,
                    'use_ajax'    => true,
                    'use_settings'    => true,
                    'use_currency'    => true,
					'data'        => apply_filters(
                        'multivendorx_admin_localize_scripts',
                        array(
							'khali_dabba'              => Utill::is_khali_dabba(),
                            'active_plugins'           => get_option( 'active_plugins', [] ),
							'tab_name'                 => __( 'MultiVendorX', 'multivendorx' ),
							'pages_list'               => $pages_array,
							'color'                    => MultiVendorX()->setting->get_setting( 'store_color_settings' ),
							'taxes_enabled'            => get_option( Utill::WOO_SETTINGS['taxes'] ),
							'country_list'             => $country_list,
							'state_list'               => WC()->countries->get_states(),
							'store_owners'             => $owners_list,
							'gateway_list'             => $gateway_list,
							'tinymceApiKey'            => MultiVendorX()->setting->get_setting( 'tinymce_api_section' ),
							'capabilities'             => StoreUtil::get_store_capability(),
							'capability_pro'           => $capability_pro,
							'custom_roles'             => Roles::multivendorx_get_roles(),
							'payments_settings'        => MultiVendorX()->payments->get_all_payment_settings(),
							'zones_list'               => apply_filters( 'multivendorx_get_all_store_zones', array() ),
							'store_payment_settings'   => MultiVendorX()->payments->get_all_store_payment_settings(),
							'freeVersion'              => MultiVendorX()->version,
							'marketplace_site'         => get_bloginfo(),
							'site_url'                 => site_url(),
							'admin_url'                => admin_url(),
							'shop_url'                 => MULTIVENDORX_PRO_SHOP_URL,
							'admin_dashboard_url'      => admin_url( 'admin.php?page=multivendorx' ),
							'store_page_url'           => get_option( Utill::WORDPRESS_SETTINGS['permalink'] ) ? trailingslashit( site_url() ) . untrailingslashit( MultiVendorX()->setting->get_setting( 'store_url', 'store' ) ) . '/' : site_url( '/?' . MultiVendorX()->setting->get_setting( 'store_url', 'store' ) . '=' ),
							'shipping_methods'         => apply_filters( 'multivendorx_store_shipping_options', array() ),
							'order_meta'               => Utill::ORDER_META_SETTINGS,
                            'date_format'              => Utill::wp_to_react_date_format( get_option( 'date_format' ) ),
                            'pro_data'                 => apply_filters(
								'multivendorx_update_pro_data',
								array(
									'version'         => false,
									'manage_plan_url' => MULTIVENDORX_PRO_SHOP_URL,
								)
							),
                            
                        )
                    ),
                ),
                'multivendorx-product-tab-script'          => array(
					'object_name' => 'multivendorx',
                    'use_ajax'    => true,
					'data'        => array(
						'select_text' => __( 'Select an item...', 'multivendorx' ),
					),
				),
                'multivendorx-dashboard-script'            => array(
                    'object_name' => 'appLocalizer',
                    'use_rest'    => true,
                    'use_ajax'    => true,
                    'use_settings'    => true,
                    'use_currency'    => true,
                    'data' => apply_filters(
                        'multivendorx_dashboard_localize_scripts',
                        array(
                            'site_url'               => site_url(),
                            'state_list'             => WC()->countries->get_states(),
                            'country_list'           => $country_list,
                            'color'                  => MultiVendorX()->setting->get_setting( 'store_color_settings' ),
                            'tinymceApiKey'          => MultiVendorX()->setting->get_setting( 'tinymce_api_section' ),
                            'store_payment_settings' => MultiVendorX()->payments->get_all_store_payment_settings(),
                            'store_id'               => MultiVendorX()->active_store,
                            'store_page_url'         => get_option( Utill::WORDPRESS_SETTINGS['permalink'] ) ?
                                trailingslashit( site_url() ) .
                                untrailingslashit( MultiVendorX()->setting->get_setting( 'store_url', 'store' ) ) . '/' :
                                site_url( '/?' . MultiVendorX()->setting->get_setting( 'store_url', 'store' ) . '=' ),
                            'admin_url'              => admin_url(),
                            'edit_order_capability'  => current_user_can( 'edit_shop_orders' ),
                            'permalink_structure'    => get_option( Utill::WORDPRESS_SETTINGS['permalink'] ) ? true : false,
                            'all_verification_methods' => MultiVendorX()->setting->get_setting( 'all_verification_methods' ),
                            'shipping_methods'       => apply_filters( 'multivendorx_store_shipping_options', array() ),
                            'all_store_meta'         => $all_meta,
                            'site_name'              => get_bloginfo( 'name' ),
                            'current_user'           => wp_get_current_user(),
                            'current_user_image'     => get_avatar_url( get_current_user_id(), array( 'size' => 48 ) ),
                            'user_logout_url'        => esc_url(
                                wp_logout_url(
                                    get_permalink( (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) )
                                )
                            ),
                            'store_ids'              => $store_ids,
                            'dashboard_page_id'      => (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' ),
                            'dashboard_slug'         => (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' )
                                ? get_post_field( 'post_name', (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) )
                                : 'dashboard',
                            'registration_page'      => esc_url(
                                get_permalink(
                                    (int) MultiVendorX()->setting->get_setting( 'store_registration_page' )
                                )
                            ),
                            'dimension_unit'         => get_option( Utill::WOO_SETTINGS['dimension_unit'] ),
                            'order_meta'             => Utill::ORDER_META_SETTINGS,
                            'date_format'            => Utill::wp_to_react_date_format( get_option( 'date_format' ) ),
                        )
                    ),
                ),
                'multivendorx-registration-form-editor-script' => array(
                    'object_name' => 'registrationForm',
                    'use_rest'    => true,
                    'data'        => array(
                        'settings'            => MultiVendorX()->setting->get_setting( 'store_registration_from', array() ),
                        'content_before_form' => apply_filters( 'multivendorx_add_content_before_form', '' ),
                        'content_after_form'  => apply_filters( 'multivendorx_add_content_after_form', '' ),
                        'error_strings'       => array(
                            'required' => __( 'This field is required', 'multivendorx' ),
                            'invalid'  => __( 'Invalid email format', 'multivendorx' ),
                        ),
                        'country_list'        => $country_list,
						'state_list'          => WC()->countries->get_states(),
                    ),
                ),
                'multivendorx-registration-form-script'    => array(
                    'object_name' => 'registrationForm',
                    'use_rest'    => true,
                    'data'        => array(
                        'settings'            => MultiVendorX()->setting->get_setting( 'store_registration_from', array() ),
                        'content_before_form' => apply_filters( 'multivendorx_add_content_before_form', '' ),
                        'content_after_form'  => apply_filters( 'multivendorx_add_content_after_form', '' ),
                        'error_strings'       => array(
                            'required' => __( 'This field is required', 'multivendorx' ),
                            'invalid'  => __( 'Invalid email format', 'multivendorx' ),
                        ),
                        'country_list'        => $country_list,
						'state_list'          => WC()->countries->get_states(),
                    ),
                ),
                'multivendorx-marketplace-stores-editor-script' => array(
                    'use_rest'    => true,
                    'use_settings'    => true,
                    'object_name' => 'storesList',
                ),
                'multivendorx-marketplace-stores-script'   => array(
                    'object_name' => 'storesList',
                    'use_settings'    => true,
                    'use_rest'    => true,
                ),
                'multivendorx-marketplace-products-editor-script' => array(
                    'object_name' => 'productList',
                    'use_rest'    => true,
                    'use_settings' => true,
                ),
                'multivendorx-marketplace-products-script' => array(
                    'object_name' => 'productList',
                    'use_rest'    => true,
                    'use_settings'    => true,
                ),
                'multivendorx-marketplace-coupons-script'  => array(
                    'object_name' => 'couponList',
                    'use_rest'    => true,
                    'use_settings'    => true,
                ),
                'multivendorx-store-provider-script'       => array(
                    'object_name' => 'StoreInfo',
                    'use_settings'    => true,
                    'use_rest'    => true,
                    'data'        => array(
                        'storeDetails'             => StoreUtil::get_specific_store_info(),
                        'activeModules'            => MultiVendorX()->modules->get_active_modules(),
                        'currentUserId'            => get_current_user_id(),
                    ),
                ),
			);

        $localize_scripts = apply_filters( 'multivendorx_localize_scripts', $localize_scripts );
        $config = $localize_scripts[ $handle ] ?? [];

        $data = array();

        if ( ! empty( $config['use_ajax'] ) && ! empty( $config['use_rest'] ) ) {
            $base_ajax = self::get_base_ajax_data($handle);
            unset($base_ajax['nonce']);
            $data = array_merge( $data, $base_ajax );
        } else {
            $data = array_merge( $data, self::get_base_ajax_data($handle) );
        }

        if ( ! empty( $config['use_rest'] ) ) {
            $data = array_merge( $data, $base_rest );
        }

        if ( ! empty( $config['use_currency'] ) ) {
            $data = array_merge( $data, $currency_data );
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
