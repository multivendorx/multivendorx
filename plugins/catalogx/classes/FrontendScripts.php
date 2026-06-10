<?php
/**
 * FrontendScripts class file.
 *
 * @package CatalogX
 */

namespace CatalogX;

use CatalogX\Enquiry\Frontend as EnquiryFrontend;
use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX FrontendScripts class
 *
 * @class       FrontendScripts class
 * @version     6.0.4
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
            $plugin_path = CatalogX()->plugin_path;
        }
        if ( $plugin_url === '' ) {
            $plugin_url = CatalogX()->plugin_url;
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
        wp_set_script_translations( $handle, 'catalogx' );
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
     * Loads block assets and additional scripts defined through the `catalogx_frontend_scripts` filter.
     */
    public static function register_frontend_scripts() {
        $version      = CatalogX()->version;
        $vendor_asset = include self::get_asset_path( 'file' ) . 'js/vendors.asset.php';

        $base_url           = self::get_asset_path() . 'js/';
        $registered_scripts = apply_filters(
            'catalogx_frontend_scripts',
            array(
                'catalogx-vendor-script'            => array(
                	'src'  => $base_url . 'vendors.js',
                	'deps' => $vendor_asset['dependencies'],
                ),
                'catalogx-enquiry-frontend-script'  => array(
                    'src'     => self::get_asset_path() . 'js/modules/Enquiry/' . CATALOGX_PLUGIN_SLUG . '-frontend.min.js',
                    'deps'    => array( 'jquery', 'jquery-blockui' ),
                    'version' => $version,
                ),
                'catalogx-enquiry-form-script'      => array(
                    'src'     => self::get_asset_path() . 'js/block/enquiry-form/index.js',
                    'deps'    => array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'wp-blocks', 'wp-hooks' ),
                    'version' => $version,
                ),
                'catalogx-quote-cart-script'        => array(
                    'src'     => self::get_asset_path() . 'js/block/quote-cart/index.js',
                    'deps'    => array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'wp-blocks' ),
                    'version' => $version,
                ),
                'catalogx-add-to-quote-cart-script' => array(
                    'src'     => self::get_asset_path() . 'js/modules/Quote/' . CATALOGX_PLUGIN_SLUG . '-frontend.min.js',
                    'deps'    => array( 'jquery' ),
                    'version' => $version,
                ),
			)
        );

        foreach ( $registered_scripts as $name => $script_config ) {
            self::register_script( $name, $script_config['src'], $script_config['deps'], $script_config['version'] ?? $version );
        }
    }


    /**
     * Register frontend styles using filters.
     *
     * Allows style registration through `catalogx_frontend_styles` filter.
     */
    public static function register_frontend_styles() {
        $version = CatalogX()->version;

        $register_styles = apply_filters(
            'catalogx_frontend_styles',
            array(
                'catalogx-frontend-style'     => array(
                    'src'     => self::get_asset_path() . 'styles/public/' . CATALOGX_PLUGIN_SLUG . '-frontend.min.css',
                    'deps'    => array(),
                    'version' => $version,
                ),
                'catalogx-index-style' => array(
					'src' => self::get_asset_path() . 'styles/index.css',
                    'deps'    => array(),
                    'version' => $version,
                ),
                'catalogx-enquiry-form-style' => array(
                    'src'     => self::get_asset_path() . 'styles/block/enquiry-form/index.css',
                    'deps'    => array(),
                    'version' => $version,
                ),
            )
        );

        foreach ( $register_styles as $name => $props ) {
            self::register_style( $name, $props['src'], $props['deps'], $props['version'] ?? $version );
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
        $version = CatalogX()->version;

        // Enqueue all chunk files (External dependencies).

	    $index_asset        = include self::get_asset_path( 'file' ) . 'js/index.asset.php';
        $vendor_asset       = include self::get_asset_path( 'file' ) . 'js/vendors.asset.php';
		$registered_scripts = apply_filters(
            'catalogx_admin_scripts',
            array(
                'catalogx-vendor-script' => array(
                    'src'  => self::get_asset_path() . 'js/vendors.js',
                	'deps' => $vendor_asset['dependencies'],
                ),
                'catalogx-admin-script'  => array(
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
     * Allows style registration through `admin_catalogx_frontend_styles` filter.
     */
    public static function register_admin_styles() {
        $version         = CatalogX()->version;
        $register_styles = apply_filters(
            'catalogx_admin_styles',
            array(
                'catalogx-index-style' => array(
					'src' => self::get_asset_path() . 'styles/index.css',
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
        // Prepare data of all pages.
        $pages      = get_pages();
        $pages_data = array();

        if ( $pages ) {
            foreach ( $pages as $page ) {
                $pages_data[] = array(
                    'value' => $page->ID,
                    'label' => $page->post_title,
                    'key'   => $page->ID,
                );
            }
        }

        // Prepare data of all user roles.
        $roles      = wp_roles()->roles;
        $roles_data = array();

        if ( $roles ) {
            foreach ( $roles as $key => $role ) {
                $roles_data[] = array(
                    'value' => $key,
                    'label' => $role['name'],
                    'key'   => $key,
                );
            }
        }

        // Get all users id and name and prepare data.
        $users      = get_users( array( 'fields' => array( 'display_name', 'id' ) ) );
        $users_data = array();

        foreach ( $users as $user ) {
            $users_data[] = array(
                'value' => $user->ID,
                'label' => $user->display_name,
                'key'   => $user->ID,
            );
        }

        // Prepare all products.
        $products_ids  = wc_get_products(
            array(
                'limit'  => -1,
                'return' => 'ids',
            )
        );
        $products_data = array();

        foreach ( $products_ids as $id ) {
			if ( 'publish' !== get_post_status( $id ) ) {
				continue;
			}
            $product_name = get_the_title( $id );

            $products_data[] = array(
                'value' => $id,
                'label' => $product_name,
                'key'   => $id,
            );
        }

        // Prepare all product terms.
        $terms              = get_terms(
            array(
                'taxonomy' => 'product_cat',
                'orderby'  => 'name',
                'order'    => 'ASC',
            )
        );
        $product_categories = array();

        if ( $terms && empty( $terms->errors ) ) {
            foreach ( $terms as $term ) {
                $product_categories[] = array(
                    'value' => $term->term_id,
                    'label' => $term->name,
                    'key'   => $term->term_id,
                );
            }
        }

        // Prepare all product tags.
        $tags         = get_terms(
            array(
                'taxonomy'   => 'product_tag',
                'hide_empty' => false,
            )
        );
        $product_tags = array();

        if ( $tags ) {
            foreach ( $tags as $tag ) {
                $product_tags[] = array(
                    'value' => $tag->term_id,
                    'label' => $tag->name,
                    'key'   => $tag->term_id,
                );
            }
        }

        // Prepare all product brands.
        $brands         = get_terms(
            array(
                'taxonomy'   => 'product_brand',
                'hide_empty' => false,
            )
        );
        $product_brands = array();

        if ( $brands ) {
            foreach ( $brands as $brand ) {
                $product_brands[] = array(
                    'value' => $brand->term_id,
                    'label' => $brand->name,
                    'key'   => $brand->term_id,
                );
            }
        }

        // Get current user role.
        $current_user      = wp_get_current_user();
        $current_user_role = '';

        if ( ! empty( $current_user->roles ) && is_array( $current_user->roles ) ) {
            $current_user_role = reset( $current_user->roles );
        }

        // Get all tab setting's database value.
        $settings_databases_value = array();
        $tabs_names               = apply_filters(
            'multivendorx_additional_tabs_names',
            array_keys( Utill::CATALOGX_SETTINGS )
        );

        foreach ( $tabs_names as $tab_name ) {
            $settings_databases_value[ $tab_name ] = CatalogX()->setting->get_option( str_replace( '-', '_', 'catalogx_' . $tab_name . '_settings' ) );
        }

        if ( 'administrator' === $current_user_role ) {
            $quote_base_url = admin_url( 'admin.php?page=wc-orders&action=edit&id=' );
        } elseif ( 'customer' === $current_user_role ) {
            $quote_base_url = site_url( '/my-account/view-quote/' );
        } else {
            $quote_base_url = '/';
        }

        $base_rest        = array(
            'apiUrl'  => untrailingslashit( get_rest_url() ),
            'restUrl' => CatalogX()->rest_namespace,
            'nonce'   => wp_create_nonce( 'wp_rest' ),
        );
        $currency_data = array(
            'currency'           => get_woocommerce_currency(),
            'currency_symbol'    => get_woocommerce_currency_symbol(),
            'price_format'       => get_woocommerce_price_format(),
            'decimal_separator'  => wc_get_price_decimal_separator(),
            'thousand_separator' => wc_get_price_thousand_separator(),
            'price_decimals'     => wc_get_price_decimals(),
            'currency_position'  => get_option( 'woocommerce_currency_pos' ),
        );
        $localize_scripts = apply_filters(
            'catalogx_localize_scripts',
            array(
                'catalogx-admin-script'                 => array(
                    'object_name' => 'appLocalizer',
                    'data'        => array_merge(
                        $base_rest,
                        $currency_data,
                        array(
                            'tab_name'                   => 'CatalogX',
                            'pages_data'                 => $pages_data,
                            'role_array'                 => $roles_data,
                            'users_data'                 => $users_data,
                            'products_data'              => $products_data,
                            'all_product_categories'     => $product_categories,
                            'product_brands'             => $product_brands,
                            'all_product_tag'            => $product_tags,
                            'settings_databases_value'   => $settings_databases_value,
                            'active_modules'             => CatalogX()->modules->get_active_modules(),
                            'user_role'                  => $current_user_role,
                            'khali_dabba'                => Utill::is_khali_dabba(),
                            'pro_url'                    => esc_url( CATALOGX_PRO_SHOP_URL ),
                            'order_edit'                 => admin_url( 'admin.php?page=wc-orders&action=edit' ),
                            'admin_url'                  => admin_url( 'admin.php?page=catalogx' ),
                            'currency'                   => get_woocommerce_currency(),
                            'notifima_active'            => Utill::is_active_plugin( 'notifima' ),
                            'mvx_active'                 => Utill::is_active_plugin( 'multivendorx' ),
                            'quote_module_active'        => CatalogX()->modules->is_active( 'quote' ),
                            'quote_base_url'             => $quote_base_url,
                            'free_version'               => CatalogX()->version,
                            'date_format'                => Utill::wp_to_react_date_format( get_option( 'date_format' ) ),
                            'pro_data'                   => apply_filters(
								'catalogx_update_pro_data',
								array(
									'version'         => false,
									'manage_plan_url' => CATALOGX_PRO_SHOP_URL,
								)
							),
                        )
                    ),
                ),
                'catalogx-enquiry-frontend-script'      => array(
                    'object_name' => 'enquiryFrontend',
                    'data'        => self::get_base_ajax_data( 'catalogx-enquiry-frontend-script' ),
                ),
                'catalogx-enquiry-form-script'          => array(
                    'object_name' => 'enquiryFormData',
                    'data'        => array_merge(
                        $base_rest,
                        array(
                            'settings_free'       => CatalogX()->modules->is_active( 'enquiry' ) ? EnquiryFrontend::catalogx_free_form_settings() : array(),
                            'settings_pro'        => CatalogX()->modules->is_active( 'enquiry' ) ? EnquiryFrontend::catalogx_pro_form_settings() : array(),
                            'khali_dabba'         => Utill::is_khali_dabba(),
                            'product_data'        => apply_filters( 'catalogx_product_data', array() ),
                            'default_placeholder' => array(
                                'name'  => $current_user->display_name,
                                'email' => $current_user->user_email,
                            ),
                            'content_before_form' => apply_filters( 'catalogx_add_content_before_form', '' ),
                            'content_after_form'  => apply_filters( 'catalogx_add_content_after_form', '' ),
                            'error_strings'       => array(
                                'required' => __( 'This field is required', 'catalogx' ),
                                'invalid'  => __( 'Invalid email format', 'catalogx' ),
                            ),
                        )
                    ),
                ),
                'catalogx-add-to-quote-cart-script'     => array(
                    'object_name' => 'addToQuoteCart',
                    'data'        => array_merge(
                        $base_rest,
                        array(
                            'loader'          => admin_url( 'images/wpspin_light.gif' ),
                            'no_more_product' => __( 'No more product in Quote list!', 'catalogx' ),
                        )
                    ),
                ),
                'catalogx-enquiry-button-editor-script'   => array(
                    'object_name' => 'enquiryButton',
                    'data'        => $base_rest,
                ),
                'catalogx-quote-button-editor-script'          => array(
                    'object_name' => 'quoteButton',
                    'data'        => $base_rest,
                ),
                'catalogx-enquiry-button-view-script'   => array(
                    'object_name' => 'enquiryButton',
                    'data'        => $base_rest,
                ),
                'catalogx-quote-button-view-script'          => array(
                    'object_name' => 'quoteButton',
                    'data'        => $base_rest,
                ),
                'catalogx-quote-cart-editor-script'     => array(
                    'object_name' => 'quoteCart',
                    'data'        => array_merge(
                        $base_rest,
                        array(
                            'name'                 => $current_user->display_name,
                            'email'                => $current_user->user_email,
                            'quote_my_account_url' => site_url( '/my-account/all-quotes/' ),
                            'khali_dabba'          => Utill::is_khali_dabba(),
                        )
                    ),
                ),
                'catalogx-quote-cart-view-script'            => array(
                    'object_name' => 'quoteCart',
                    'data'        => array_merge(
                        $base_rest,
                        array(
                            'name'                 => $current_user->display_name,
                            'email'                => $current_user->user_email,
                            'quote_my_account_url' => site_url( '/my-account/all-quotes/' ),
                            'khali_dabba'          => Utill::is_khali_dabba(),
                        )
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
