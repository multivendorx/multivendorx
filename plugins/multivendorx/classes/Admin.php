<?php
/**
 * Admin class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Admin class
 *
 * @class       Admin class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Admin constructor.
     */
    public function __construct() {
        // admin pages manu and submenu.
        add_action( 'admin_menu', array( $this, 'add_menus' ), 10 );
        // admin script and style.
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );

        // Allow URL.
        add_filter( 'allowed_redirect_hosts', array( $this, 'allow_multivendorx_redirect_host' ) );
        // For loco translation.
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );
    }

    /**
     * Add options page.
     */
    public function add_menus() {
        if ( is_admin() ) {
            add_menu_page(
                'MultiVendorX',
                'MultiVendorX',
                'manage_options',
                'multivendorx',
                array( $this, 'create_setting_page' ),
                'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMTA1OS42IDEwNzguOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTA1OS42IDEwNzguOTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOm5vbmU7fQoJLnN0MXtmaWxsOiNmZmY7fQo8L3N0eWxlPgo8Zz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0tMTY0MS4yLDE1NC45Yy0xMTYuNiwwLTE5My44LDc3LjItMTkzLjgsMjA3LjljMCwxMzAuNiw3Ny4yLDIwNy44LDE5My44LDIwNy44YzExOCwwLDE5NS4yLTc3LjIsMTk1LjItMjA3LjgKCQlDLTE0NDUuOSwyMzIuMS0xNTIzLjIsMTU0LjktMTY0MS4yLDE1NC45eiIvPgoJCgkJPGVsbGlwc2UgdHJhbnNmb3JtPSJtYXRyaXgoMC43MDcxIC0wLjcwNzEgMC43MDcxIDAuNzA3MSAtMjYzLjI0ODMgLTg1Mi40OTg1KSIgY2xhc3M9InN0MCIgY3g9Ii0xMTYwLjciIGN5PSItMTA4LjUiIHJ4PSI5Mi4xIiByeT0iOTIuMSIvPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTS0xNjM5LjgsMC40Yy0yMTcuNywwLTM2My44LDE0Ni0zNjMuOCwzNjMuN3YzOTAuM2M0My45LTMzLjQsODcuNy02Ni45LDEzMS42LTEwMC4zCgkJYzMyLjIsMjEuNSwxMjEuNCw3NC44LDI0NC44LDcxYzQxLjgtMS4zLDE0NC02LDIzMi04Mi4xYzExNy45LTEwMS45LDExNy43LTI1MS44LDExNy43LTI4MS43Qy0xMjc3LjQsMTQ1LjEtMTQyMy41LDAuNC0xNjM5LjgsMC40CgkJeiBNLTE2NDEuMiw1NzAuNmMtMTE2LjYsMC0xOTMuOC03Ny4yLTE5My44LTIwNy44YzAtMTMwLjYsNzcuMi0yMDcuOSwxOTMuOC0yMDcuOWMxMTgsMCwxOTUuMiw3Ny4yLDE5NS4yLDIwNy45CgkJQy0xNDQ1LjksNDkzLjQtMTUyMy4yLDU3MC42LTE2NDEuMiw1NzAuNnoiLz4KCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0tMTE2MC43LTMyMy41Yy0xMTguNywwLTIxNSw5Ni4yLTIxNSwyMTVjMCwxMTguNyw5Ni4yLDIxNSwyMTUsMjE1czIxNS05Ni4yLDIxNS0yMTUKCQlDLTk0NS43LTIyNy4yLTEwNDItMzIzLjUtMTE2MC43LTMyMy41eiBNLTExNjAuNy0xNi40Yy01MC45LDAtOTIuMS00MS4yLTkyLjEtOTIuMXM0MS4yLTkyLjEsOTIuMS05Mi4xczkyLjEsNDEuMiw5Mi4xLDkyLjEKCQlTLTExMDkuOC0xNi40LTExNjAuNy0xNi40eiIvPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTM2NC42LDMyNC40Yy0yMTcuNywwLTM2My44LDE0Ni0zNjMuOCwzNjMuN3YzOTAuM2M0My45LTMzLjQsODcuNy02Ni45LDEzMS42LTEwMC4zCgkJCWMzMi4yLDIxLjUsMTIxLjQsNzQuOCwyNDQuOCw3MWM0MS45LTEuMywxNDQtNiwyMzItODIuMUM3MjcuMiw4NjUuMSw3MjcsNzE1LjMsNzI3LDY4NS4zQzcyNyw0NjkuMSw1ODAuOSwzMjQuNCwzNjQuNiwzMjQuNHoKCQkJIE01NTguNCw2ODYuOGMwLDAuNCwwLDAuOCwwLDEuMWMtMC4yLDU0LjYtMTMuOSw5OS44LTM4LjUsMTMzLjljLTMzLjksNDctODguNSw3Mi44LTE1Ni43LDcyLjhjLTExNi42LDAtMTkzLjgtNzcuMi0xOTMuOC0yMDcuOAoJCQljMCwwLDAsMCwwLDBzMCwwLDAsMGMwLTEzMC42LDc3LjItMjA3LjgsMTkzLjgtMjA3LjhjNTMuNSwwLDk4LjUsMTUuOSwxMzEuOSw0NS40YzQwLDM1LjQsNjMuMSw5MC41LDYzLjMsMTYxLjQKCQkJQzU1OC40LDY4Niw1NTguNCw2ODYuNCw1NTguNCw2ODYuOEM1NTguNCw2ODYuOCw1NTguNCw2ODYuOCw1NTguNCw2ODYuOEM1NTguNCw2ODYuOCw1NTguNCw2ODYuOCw1NTguNCw2ODYuOHoiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik04NDMuNywwLjVjLTExOC43LDAtMjE1LDk2LjItMjE1LDIxNWMwLDExOC43LDk2LjIsMjE1LDIxNSwyMTVjMTE4LjcsMCwyMTUtOTYuMiwyMTUtMjE1CgkJCUMxMDU4LjcsOTYuOCw5NjIuNCwwLjUsODQzLjcsMC41eiBNODQzLjcsMzA3LjZjLTUwLjksMC05Mi4xLTQxLjItOTIuMS05Mi4xYzAtNTAuOSw0MS4yLTkyLjEsOTIuMS05Mi4xCgkJCWM1MC45LDAsOTIuMSw0MS4yLDkyLjEsOTIuMUM5MzUuOCwyNjYuNCw4OTQuNiwzMDcuNiw4NDMuNywzMDcuNnoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
                50
            );

            $pro_sticker = ! Utill::is_khali_dabba() ?
            '<span 
                class="multivendorx-pro-tag"
                style="
                font-size: 0.5rem;
                background: #e35047;
                padding: 0.125rem 0.5rem;
                color: #F9F8FB;
                font-weight: 700;
                line-height: 1;
                position: absolute;
                margin-left: 0.25rem;
                border-radius: 2rem 0;
                top: 50%;
                transform: translateY(-50%);
                "
            > Pro </span>' : '';

            // Array contain multivendorx submenu.
            $submenus = array(
                'stores' => array(
                    'name'   => __( 'Store Controller', 'multivendorx' ),
                    'subtab' => 'store-appearance',
                ),
                'modules' => array(
                    'name'   => __( 'Modules', 'multivendorx' ),
                    'subtab' => '',
                ),
                'marketplace' => array(
                    'name'   => __( 'Marketplace', 'multivendorx' ),
                    'subtab' => 'general',
                ),
            );
            
            foreach ( $submenus as $slug => $submenu ) {
                // prepare subtab if subtab is exist.
                $subtab = '';

                if ( $submenu['subtab'] ) {
                    $subtab = '&subtab=' . $submenu['subtab'];
                }

                add_submenu_page(
                    'multivendorx',
                    $submenu['name'],
                    "<span style='position: relative; display: block; width: 100%;' class='admin-menu'>" . $submenu['name'] . '</span>',
                    'manage_options',
                    'multivendorx#&tab=' . $slug . $subtab,
                    '_-return_null'
                );
            }

            // Register upgrade to pro submenu page.
            if ( ! Utill::is_khali_dabba() ) {
                add_submenu_page(
                    'multivendorx',
                    __( 'Upgrade to Pro', 'multivendorx' ),
                    '<style>
                        a:has(.upgrade-to-pro){
                            background: linear-gradient(-28deg, #c4a9e8, #7848b9, #852aff) !important;
                            color: White !important;
                        }
                        padding: 5px 0;
                    </style>
                    <div style="margin-left: -12px;" class="upgrade-to-pro"><i class="dashicons dashicons-awards"></i>' . esc_html__( 'Upgrade to Pro', 'multivendorx' ) . '</div> ',
                    'manage_options',
                    '',
                    array( self::class, 'handle_external_redirects' )
                );
            }

            remove_submenu_page( 'multivendorx', 'multivendorx' );
        }
    }

    /**
     * Create empty div. React root from here.
     *
     * @return void
     */
    public function create_setting_page() {
        echo '<div id="admin-main-wrapper"></div>';
    }

    /**
     * Enqueue JavaScript for admin fronend page and localize script.
     *
     * @return void
     */
    public function enqueue_admin_script() {
        if ( get_current_screen()->id === 'toplevel_page_multivendorx' ) {
            wp_enqueue_script( 'wp-element' );
            // Support for media
            wp_enqueue_media();
            FrontendScripts::admin_load_scripts();
            FrontendScripts::enqueue_script( 'multivendorx-components-script' );
            FrontendScripts::enqueue_script( 'multivendorx-admin-script' );
			FrontendScripts::enqueue_style( 'multivendorx-components-style' );
			FrontendScripts::enqueue_style( 'multivendorx-style' );
			FrontendScripts::localize_scripts( 'multivendorx-admin-script' );
        }
    }

    /**
     * Filters the relative path for the plugin's textdomain.
     *
     * This method can be used to adjust the location where translation files are loaded from.
     *
     * @param string $path Relative path to the .mo file.
     * @param string $url  URL to the .mo file.
     * @return string Modified path.
     */
    public function textdomain_relative_path( $path, $url ) {

        if ( strpos( $url, 'dc-woocommerce-product-vendor' ) !== false ) {
            foreach ( MultiVendorX()->block_paths as $key => $new_path ) {
                if ( strpos( $url, $key ) !== false ) {
                    $path = $new_path;
                }
            }

            if ( strpos( $url, 'block' ) === false ) {
                $path = 'build/index.js';
            }
        }

        return $path;
    }

    /**
	 * Redirct to pro shop url.
     *
	 * @return never
	 */
	public static function handle_external_redirects() {
		wp_safe_redirect( esc_url_raw( MULTIVENDORX_PRO_SHOP_URL ) );
		exit;
	}

    /**
     * Allow MultiVendorX domain for safe redirection using wp_safe_redirect().
     *
     * @param string[] $hosts List of allowed hosts.
     * @return string[] Modified list with MultiVendorX domain included.
     */
    public function allow_multivendorx_redirect_host( $hosts ) {
        $parsed_url = wp_parse_url( MULTIVENDORX_PRO_SHOP_URL );

        if ( isset( $parsed_url['host'] ) ) {
            $hosts[] = $parsed_url['host'];
        }

        return $hosts;
    }
}
