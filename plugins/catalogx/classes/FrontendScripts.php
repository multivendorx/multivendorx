<?php
/**
 * Frontend Scripts class file
 *
 * @package CatalogX
 */

namespace CatalogX;

use Catalogx\Enquiry\Frontend as EnquiryFrontend;

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
     * Holds registered script handles.
     *
     * @var array
     */
    public static $scripts = array();

	/**
     * Holds registered style handles.
     *
     * @var array
     */
    public static $styles = array();

	/**
	 * Constructor for Frontend Scripts class
	 *
	 * @return void
	 */
    public function __construct() {
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_load_scripts' ) );
    }

	/**
	 * Get the build path name based on the environment.
	 *
	 * @return string The path to the build assets.
	 */
    public static function get_build_path_name() {
        if ( CatalogX()->is_dev ) {
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
        $base_url = CatalogX()->plugin_url . self::get_build_path_name() . 'js/';
        self::enqueue_scripts_from_dir( $base_dir . 'externals/', $base_url . 'externals/' );
        if ( CatalogX()->is_dev ) {
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
            $chunk_handle = 'catalogx-script-' . sanitize_title( $chunk_file );
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
	 * @param string $handle       Name of the script.
	 * @param string $path         URL to the script.
	 * @param array  $deps         Optional. An array of dependencies. Default empty array.
	 * @param string $version      Optional. Script version. Default empty string.
	 */
    public static function register_script( $handle, $path, $deps = array(), $version = '' ) {
		self::$scripts[] = $handle;
		wp_register_script( $handle, $path, $deps, $version, true );
        wp_set_script_translations( $handle, 'catalogx' );
	}

	/**
	 * Register and store a style for later use.
	 *
	 * @param string $handle       Name of the script.
	 * @param string $path         URL to the script.
	 * @param array  $deps         Optional. An array of dependencies. Default empty array.
	 * @param string $version      Optional. Script version. Default empty string.
	 */
    public static function register_style( $handle, $path, $deps = array(), $version = '' ) {
		self::$styles[] = $handle;
		wp_register_style( $handle, $path, $deps, $version );
	}

	/**
	 * Register frontend scripts using filters and enqueue required external scripts.
	 *
	 * @return void
	 */
    public static function register_scripts() {
		$version = CatalogX()->version;
        self::enqueue_external_scripts();

		$register_scripts = apply_filters(
            'catalogx_register_scripts',
            array(
				'catalogx-enquiry-frontend-script'  => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'modules/Enquiry/js/' . CATALOGX_PLUGIN_SLUG . '-frontend.min.js',
					'deps'    => array( 'jquery', 'jquery-blockui' ),
					'version' => $version,
				),
				'catalogx-enquiry-form-script'      => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'js/block/enquiryForm/index.js',
					'deps'    => array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'wp-blocks', 'wp-hooks' ),
					'version' => $version,
				),
				'catalogx-quote-cart-script'        => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'js/block/quote-cart/index.js',
					'deps'    => array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'wp-blocks' ),
					'version' => $version,
				),
				'catalogx-add-to-quote-cart-script' => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'modules/Quote/js/' . CATALOGX_PLUGIN_SLUG . '-frontend.min.js',
					'deps'    => array( 'jquery' ),
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
	 * @return void
	 */
    public static function register_styles() {
		$version = CatalogX()->version;

		$register_styles = apply_filters(
            'catalogx_register_styles',
            array(
				'catalogx-frontend-style'     => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'styles/' . CATALOGX_PLUGIN_SLUG . '-frontend.min.css',
					'deps'    => array(),
					'version' => $version,
				),
				'catalogx-enquiry-form-style' => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'styles/block/enquiryForm/index.css',
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
	 * Register admin scripts using filters.
	 *
	 * Loads admin-specific JavaScript assets and chunked dependencies.
	 *
	 * @return void
	 */
    public static function admin_register_scripts() {
		$version = CatalogX()->version;
		// Enqueue all chunk files (External dependencies).
        self::enqueue_external_scripts();
        $index_asset      = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset  = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
		$register_scripts = apply_filters(
            'admin_catalogx_register_scripts',
            array(
				'catalogx-admin-script'      => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'js/index.js',
					'deps'    => $index_asset['dependencies'],
					'version' => $version,
				),
				'catalogx-components-script' => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'js/components.js',
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
	 * @return void
	 */
    public static function admin_register_styles() {
		$version = CatalogX()->version;

		$register_styles = apply_filters(
            'admin_catalogx_register_styles',
            array(
				'catalogx-components-style' => array(
					'src'     => CatalogX()->plugin_url . self::get_build_path_name() . 'styles/components.css',
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
	 * Register/queue frontend scripts and styles
	 */
	public static function load_scripts() {
        self::register_scripts();
		self::register_styles();
    }
	/**
	 * Register/queue admin scripts and styles
	 */
	public static function admin_load_scripts() {
        self::admin_register_scripts();
		self::admin_register_styles();
    }

	/**
	 * Localize all scripts.
	 *
	 * @param string $handle Script handle in which the data will be attached to.
	 */
    public static function localize_scripts( $handle ) {

        // Prepare data of all pages.
        $pages     = get_pages();
        $all_pages = array();

        if ( $pages ) {
            foreach ( $pages as $page ) {
                $all_pages[] = array(
                    'value' => $page->ID,
                    'label' => $page->post_title,
                    'key'   => $page->ID,
                );
            }
        }

        // Prepare data of all user roles.
        $roles     = wp_roles()->roles;
        $all_roles = array();

        if ( $roles ) {
            foreach ( $roles as $key => $role ) {
                $all_roles[] = array(
                    'value' => $key,
                    'label' => $role['name'],
                    'key'   => $key,
                );
            }
        }

        // Get all users id and name and prepare data.
        $users     = get_users( array( 'fields' => array( 'display_name', 'id' ) ) );
        $all_users = array();

        foreach ( $users as $user ) {
            $all_users[] = array(
                'value' => $user->ID,
                'label' => $user->display_name,
                'key'   => $user->ID,
            );
        }

        // Prepare all products.
        $products_ids = wc_get_products(
            array(
				'limit'  => -1,
				'return' => 'ids',
            )
        );
        $all_products = array();

        foreach ( $products_ids as $id ) {
            $product_name = get_the_title( $id );

            $all_products[] = array(
                'value' => $id,
                'label' => $product_name,
                'key'   => $id,
            );
        }

        // Prepare all product terms.
        $terms       = get_terms(
            array(
				'taxonomy' => 'product_cat',
				'orderby'  => 'name',
				'order'    => 'ASC',
            )
        );
        $product_cat = array();

        if ( $terms && empty( $terms->errors ) ) {
            foreach ( $terms as $term ) {
                $product_cat[] = array(
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
		$brands            = get_terms(
            array(
				'taxonomy'   => 'product_brand',
				'hide_empty' => false,
            )
        );
        $all_product_brand = array();
        if ( $brands ) {
            foreach ( $brands as $brand ) {
                $all_product_brand[] = array(
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
        $settings_value = array();
        $tabs_names     = array( 'enquiry-catalog-customization', 'all-settings', 'enquiry-form-customization', 'enquiry-quote-exclusion', 'tools', 'enquiry-email-temp', 'wholesale', 'wholesale-registration', 'pages' );
        foreach ( $tabs_names as $tab_name ) {
			$settings_value[ $tab_name ] = CatalogX()->setting->get_option( str_replace( '-', '_', 'catalogx_' . $tab_name . '_settings' ) );
        }

        if ( 'administrator' === $current_user_role ) {
            $quote_base_url = admin_url( 'admin.php?page=wc-orders&action=edit&id=' );
        } elseif ( 'customer' === $current_user_role ) {
            $quote_base_url = site_url( '/my-account/view-quote/' );
        } else {
            $quote_base_url = '/';
        }

        $localize_scripts = apply_filters(
            'catalogx_localize_scripts',
            array(
				'catalogx-admin-script'                 => array(
					'object_name' => 'appLocalizer',
					'data'        => array(
						'apiUrl'                     => untrailingslashit( get_rest_url() ),
						'nonce'                      => wp_create_nonce( 'wp_rest' ),
						'tab_name'                   => 'CatalogX',
						'restUrl'                    => CatalogX()->rest_namespace,
						'all_pages'                  => $all_pages,
						'role_array'                 => $all_roles,
						'all_users'                  => $all_users,
						'all_products'               => $all_products,
						'all_product_cat'            => $product_cat,
						'all_product_brand'          => $all_product_brand,
						'all_product_tag'            => $product_tags,
						'settings_databases_value'   => $settings_value,
						'active_modules'             => CatalogX()->modules->get_active_modules(),
						'user_role'                  => $current_user_role,
						'banner_img'                 => CatalogX()->plugin_url . 'assets/images/catalog-pro-add-admin-banner.jpg',
						'default_img'                => CatalogX()->plugin_url . 'src/assets/images/default.png',
						'template1'                  => CatalogX()->plugin_url . 'assets/images/email/templates/catalogx-email-template-default.png',
						'template2'                  => CatalogX()->plugin_url . 'assets/images/email/templates/catalogx-email-template-1.png',
						'template3'                  => CatalogX()->plugin_url . 'assets/images/email/templates/catalogx-email-template-2.png',
						'template4'                  => CatalogX()->plugin_url . 'assets/images/email/templates/catalogx-email-template-3.png',
						'template5'                  => CatalogX()->plugin_url . 'assets/images/email/templates/catalogx-email-template-4.png',
						'template6'                  => CatalogX()->plugin_url . 'assets/images/email/templates/catalogx-email-template-5.png',
						'template7'                  => CatalogX()->plugin_url . 'assets/images/email/templates/catalogx-email-template-6.png',
						'khali_dabba'                => Utill::is_khali_dabba(),
						'pro_url'                    => esc_url( CATALOGX_PRO_SHOP_URL ),
						'order_edit'                 => admin_url( 'admin.php?page=wc-orders&action=edit' ),
						'site_url'                   => admin_url( 'admin.php?page=catalogx#&tab=settings&subtab=all-settings' ),
						'module_page_url'            => admin_url( 'admin.php?page=catalogx#&tab=modules' ),
						'settings_page_url'          => admin_url( 'admin.php?page=catalogx#&tab=settings&subtab=all-settings' ),
						'enquiry_form_settings_url'  => admin_url( 'admin.php?page=catalogx#&tab=settings&subtab=enquiry-form-customization' ),
						'customization_settings_url' => admin_url( 'admin.php?page=catalogx#&tab=settings&subtab=enquiry-catalog-customization' ),
						'wholesale_settings_url'     => admin_url( 'admin.php?page=catalogx#&tab=settings&subtab=wholesale' ),
						'rule_url'                   => admin_url( 'admin.php?page=catalogx#&tab=rules' ),
						'currency'                   => get_woocommerce_currency(),
						'notifima_active'            => Utill::is_active_plugin( 'notifima' ),
						'mvx_active'                 => Utill::is_active_plugin( 'multivendorx' ),
						'quote_module_active'        => CatalogX()->modules->is_active( 'quote' ),
						'quote_base_url'             => $quote_base_url,
					),
				),
				'catalogx-enquiry-frontend-script'      => array(
					'object_name' => 'enquiryFrontend',
					'data'        => array(
						'ajaxurl' => admin_url( 'admin-ajax.php' ),
					),
				),
				'catalogx-enquiry-form-script'          => array(
					'object_name' => 'enquiryFormData',
					'data'        => array(
						'apiUrl'              => untrailingslashit( get_rest_url() ),
						'nonce'               => wp_create_nonce( 'wp_rest' ),
						'settings_free'       => CatalogX()->modules->is_active( 'enquiry' ) ? EnquiryFrontend::catalogx_free_form_settings() : array(),
						'settings_pro'        => CatalogX()->modules->is_active( 'enquiry' ) ? EnquiryFrontend::catalogx_pro_form_settings() : array(),
						'khali_dabba'         => \CatalogX\Utill::is_khali_dabba(),
						'product_data'        => ( \CatalogX\Utill::is_khali_dabba() && ! empty( CatalogX_Pro()->cart->get_cart_data() ) ) ? CatalogX_Pro()->cart->get_cart_data() : '',
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
					),
				),
				'catalogx-add-to-quote-cart-script'     => array(
					'object_name' => 'addToQuoteCart',
					'data'        => array(
						'ajaxurl'         => admin_url( 'admin-ajax.php' ),
						'loader'          => admin_url( 'images/wpspin_light.gif' ),
						'no_more_product' => __( 'No more product in Quote list!', 'catalogx' ),
					),
				),
				'catalogx-enquiry-button-editor-script' => array(
					'object_name' => 'enquiryButton',
					'data'        => array(
						'apiUrl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => CatalogX()->rest_namespace,
						'nonce'   => wp_create_nonce( 'wp_rest' ),
					),
				),
				'catalogx-quote-button-editor-script'   => array(
					'object_name' => 'quoteButton',
					'data'        => array(
						'apiUrl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => CatalogX()->rest_namespace,
						'nonce'   => wp_create_nonce( 'wp_rest' ),
					),
				),
				'catalogx-quote-cart-editor-script'     => array(
					'object_name' => 'quoteCart',
					'data'        => array(
						'apiUrl'               => untrailingslashit( get_rest_url() ),
						'restUrl'              => CatalogX()->rest_namespace,
						'nonce'                => wp_create_nonce( 'wp_rest' ),
						'name'                 => $current_user->display_name,
						'email'                => $current_user->user_email,
						'quote_my_account_url' => site_url( '/my-account/all-quotes/' ),
						'khali_dabba'          => Utill::is_khali_dabba(),
					),
				),
				'catalogx-quote-button-script'          => array(
					'object_name' => 'quoteButton',
					'data'        => array(
						'apiUrl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => CatalogX()->rest_namespace,
						'nonce'   => wp_create_nonce( 'wp_rest' ),
					),
				),
				'catalogx-quote-cart-script'            => array(
					'object_name' => 'quoteCart',
					'data'        => array(
						'apiUrl'               => untrailingslashit( get_rest_url() ),
						'restUrl'              => CatalogX()->rest_namespace,
						'nonce'                => wp_create_nonce( 'wp_rest' ),
						'name'                 => $current_user->display_name,
						'email'                => $current_user->user_email,
						'quote_my_account_url' => site_url( '/my-account/all-quotes/' ),
						'khali_dabba'          => Utill::is_khali_dabba(),
					),
				),
				'catalogx-enquiry-button-script'        => array(
					'object_name' => 'enquiryButton',
					'data'        => array(
						'apiUrl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => CatalogX()->rest_namespace,
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
