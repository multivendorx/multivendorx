<?php
/**
 * Admin class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultivendorX
 */
class Admin {

    /**
     * Constructor for Admin class
     */
    public function __construct() {
        // Register admin menu.
        add_action( 'admin_menu', array( $this, 'add_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );
		// Allow URL.
        add_filter( 'allowed_redirect_hosts', array( $this, 'allow_catalogx_redirect_host' ) );
        // For load translation.
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );
    }

    /**
     * Add menu in admin panal
     *
     * @return void
     */
    public function add_menu() {

        add_menu_page(
            'CatalogX',
            'CatalogX',
            'manage_woocommerce',
            'catalogx',
            array( $this, 'menu_page_callback' ),
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGcgZmlsbD0iIzlFQTNBOCIgZmlsbC1ydWxlPSJub256ZXJvIj48cGF0aCBkPSJNNy44LDUuNGMwLDAuNS0wLjQsMC45LTAuOSwwLjlDNi42LDYuMyw2LjMsNiw2LjEsNS43YzAtMC4xLTAuMS0wLjItMC4xLTAuMyAgICBjMC0wLjUsMC40LTAuOSwwLjktMC45YzAuMSwwLDAuMiwwLDAuMywwLjFDNy42LDQuNyw3LjgsNSw3LjgsNS40eiBNNSw3LjRjLTAuMSwwLTAuMiwwLTAuMiwwYy0wLjYsMC0xLjEsMC41LTEuMSwxLjEgICAgQzMuNiw5LDQsOS40LDQuNCw5LjZjMC4xLDAsMC4yLDAuMSwwLjMsMC4xYzAuNiwwLDEuMS0wLjUsMS4xLTEuMUM1LjksNy45LDUuNSw3LjUsNSw3LjR6IE01LjgsMS43Yy0wLjYsMC0xLDAuNS0xLDFzMC41LDEsMSwxICAgIHMxLTAuNSwxLTFTNi4zLDEuNyw1LjgsMS43eiBNMi45LDIuMWMtMC4zLDAtMC41LDAuMi0wLjUsMC41czAuMiwwLjUsMC41LDAuNXMwLjUtMC4yLDAuNS0wLjVTMy4yLDIuMSwyLjksMi4xeiBNMC44LDUuNyAgICBDMC4zLDUuNywwLDYuMSwwLDYuNXMwLjMsMC44LDAuOCwwLjhzMC44LTAuMywwLjgtMC44UzEuMiw1LjcsMC44LDUuN3ogTTIwLDEwLjZjLTAuMSw0LjMtMy42LDcuNy03LjksNy43Yy0xLjIsMC0yLjMtMC4zLTMuNC0wLjcgICAgbC0zLjUsMC42bDEuNC0yYy0xLjUtMS40LTIuNS0zLjUtMi41LTUuN2MwLTAuMiwwLTAuNCwwLTAuNWMwLjMsMC4xLDAuNiwwLjEsMC45LDBDNS45LDkuNyw2LjQsOSw2LjMsOC4zYzAtMC4yLTAuMS0wLjQtMC4yLTAuNSAgICBDNS43LDcsNC45LDYuOCw0LjIsNi45QzQsNywzLjgsNywzLjcsN0MzLDYuOSwyLjUsNi40LDIuNCw1LjhjLTAuMi0xLDAuNi0xLjksMS42LTEuOUM0LjYsNCw1LjEsNC40LDUuMyw1YzAsMC4xLDAsMC4yLDAsMC4yICAgIGMwLjEsMC41LDAuNCwxLDAuOSwxLjJjMC4yLDAuMSwwLjUsMC4yLDAuNywwLjJjMC43LDAsMS4zLTAuNiwxLjMtMS4zYzAtMC41LTAuMy0xLTAuOC0xLjJjMS40LTEuMSwzLjItMS43LDUuMS0xLjYgICAgQzE2LjcsMi44LDIwLjEsNi4zLDIwLDEwLjZ6IE0xNC45LDguMmMwLTAuMy0wLjItMC41LTAuNS0wLjVIOS45Yy0wLjMsMC0wLjUsMC4yLTAuNSwwLjV2NC42YzAsMC4zLDAuMiwwLjUsMC41LDAuNWgyLjZsMC41LDEuMSAgICBoMS4ybC0wLjUtMS4xaDAuOWMwLjMsMCwwLjUtMC4yLDAuNS0wLjVWOC4yeiBNMTAuNCwxMi4yaDEuNmwtMC4zLTAuNmwwLjktMC40bDAuNSwxaDAuOFY4LjdoLTMuNVYxMi4yeiIvPjwvZz48L3N2Zz4=',
            50
        );

        $submenus = array(
            'enquiry-messages' => array(
                'name'   => __( 'Enquiry Messages', 'catalogx' ),
                'subtab' => '',
            ),
            'quote-requests'   => array(
                'name'   => __( 'Quotation Requests', 'catalogx' ),
                'subtab' => '',
            ),
            'wholesale-users'  => array(
                'name'   => __( 'Wholesale Users', 'catalogx' ),
                'subtab' => '',
            ),
            'rules'            => array(
                'name'   => __( 'Dynamic Pricing Rules', 'catalogx' ),
                'subtab' => '',
            ),
            'settings'         => array(
                'name'   => __( 'Settings', 'catalogx' ),
                'subtab' => 'all-settings',
            ),
            'modules'          => array(
                'name'   => __( 'Modules', 'catalogx' ),
                'subtab' => '',
            ),
        );

        foreach ( $submenus as $slug => $submenu ) {
            // prepare subtab if subtab is exist.
            $subtab = '';

            if ( $submenu['subtab'] ) {
                $subtab = '&subtab=' . $submenu['subtab'];
            }

            add_submenu_page(
                'catalogx',
                $submenu['name'],
                $submenu['name'],
                'manage_woocommerce',
                'catalogx#&tab=' . $slug . $subtab,
                '__return_null'
            );
        }

        if ( ! Utill::is_khali_dabba() ) {
            add_submenu_page(
                'catalogx',
                __( 'Upgrade to Pro', 'catalogx' ),
                '<style>
                    a:has(.upgrade-to-pro){
                        background: linear-gradient(-28deg, #f6a091, #bb939c, #5f6eb3) !important;
                        color: White !important;
                    };
                </style>
                <div class="upgrade-to-pro"><i style="margin-right: 0.25rem" class="dashicons dashicons-awards"></i>' . __( 'Upgrade to pro', 'catalogx' ) . '</div>',
                'manage_woocommerce',
                '',
                array( $this, 'handle_external_redirects' )
            );
        }

        remove_submenu_page( 'catalogx', 'catalogx' );
    }

    /**
     * Callback function for menu page
     *
     * @return void
     */
    public function menu_page_callback() {
        echo '<div id="admin-main-wrapper"></div>';
    }

    /**
     * Enqueue javascript and css
     *
     * @return void
     */
    public function enqueue_admin_script() {

        if ( get_current_screen()->id !== 'toplevel_page_catalogx' ) {
			return;
        }

        // Support for media.
        wp_enqueue_media();

        // Enque script and style.
        FrontendScripts::admin_load_scripts();
        FrontendScripts::enqueue_script( 'catalogx-admin-script' );
        FrontendScripts::enqueue_style( 'catalogx-admin-style' );
        FrontendScripts::enqueue_script( 'catalogx-components-script' );
        FrontendScripts::enqueue_style( 'catalogx-components-style' );
        FrontendScripts::localize_scripts( 'catalogx-admin-script' );
        wp_set_script_translations( 'catalogx-script', 'catalogx' );
    }

    /**
	 * Redirct to pro shop url.
     *
	 * @return never
	 */
	public function handle_external_redirects() {
		wp_safe_redirect( esc_url_raw( CATALOGX_PRO_SHOP_URL ) );
		exit;
	}

	/**
     * Allow CatalogX domain for safe redirection using wp_safe_redirect().
     *
     * @param string[] $hosts List of allowed hosts.
     * @return string[] Modified list with CatalogX domain included.
     */
    public function allow_catalogx_redirect_host( $hosts ) {
        $parsed_url = wp_parse_url( CATALOGX_PRO_SHOP_URL );

        if ( isset( $parsed_url['host'] ) ) {
            $hosts[] = $parsed_url['host'];
        }

        return $hosts;
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
        if ( strpos( $url, 'woocommerce-catalog-enquiry' ) !== false ) {
            foreach ( CatalogX()->block_paths as $key => $new_path ) {
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
}
