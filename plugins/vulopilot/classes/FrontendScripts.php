<?php
/**
 * FrontendScripts class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot FrontendScripts class.
 *
 * Registers and localizes the admin React bundle. Deliberately much
 * smaller than MultiVendorX\FrontendScripts — that class's size comes from
 * WooCommerce-specific localized data (store owners, payment gateways, WC
 * countries) VuloPilot has no equivalent of; this only carries what the
 * React app actually needs to boot and call the REST API (see
 * src/global.d.ts's AppLocalizer interface).
 *
 * @class       FrontendScripts class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class FrontendScripts {

    /**
     * FrontendScripts constructor.
     */
    public function __construct() {
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_load_scripts' ) );
    }

    /**
     * Returns the URL to the built assets directory.
     *
     * @return string
     */
    public static function get_asset_url() {
        return VuloPilot()->plugin_url . 'assets/';
    }

    /**
     * Registers the admin script and style bundles (built by wp-scripts;
     * see webpack.config.js / package.json).
     *
     * @return void
     */
    public static function admin_load_scripts() {
        self::register_admin_scripts();
        self::register_admin_styles();
    }

    /**
     * Registers every admin script handle — both the app entry
     * ('vulopilot-admin-script', from index.js) and the shared-dependency
     * chunk webpack's splitChunks config emits alongside it
     * ('vulopilot-vendor-script', from vendors.js — see
     * tools/webpack/create-config.js's `optimization.splitChunks.cacheGroups.vendors`).
     * index.js's own webpack runtime expects vendors.js's module registry
     * to already be on the page; registering only the admin script and
     * never the vendor one (a bug this method used to have) means
     * index.js loads with nothing to resolve its own chunk references
     * against and the React app silently never mounts — a blank content
     * area with working WP-admin chrome around it, not a fatal error.
     *
     * @return void
     */
    private static function register_admin_scripts() {
        $index_asset_path  = VuloPilot()->plugin_path . 'assets/js/index.asset.php';
        $vendor_asset_path = VuloPilot()->plugin_path . 'assets/js/vendors.asset.php';

        $index_asset = file_exists( $index_asset_path )
            ? include $index_asset_path
            : array(
                'dependencies' => array( 'wp-element', 'wp-i18n', 'wp-hooks' ),
                'version'      => VULOPILOT_PLUGIN_VERSION,
            );

        $vendor_asset = file_exists( $vendor_asset_path )
            ? include $vendor_asset_path
            : array(
                'dependencies' => array(),
                'version'      => VULOPILOT_PLUGIN_VERSION,
            );

        wp_register_script(
            'vulopilot-vendor-script',
            self::get_asset_url() . 'js/vendors.js',
            $vendor_asset['dependencies'],
            $vendor_asset['version'],
            true
        );

        wp_register_script(
            'vulopilot-admin-script',
            self::get_asset_url() . 'js/index.js',
            $index_asset['dependencies'],
            $index_asset['version'],
            true
        );
        wp_set_script_translations( 'vulopilot-admin-script', 'vulopilot' );
    }

    /**
     * Registers every admin style handle.
     *
     * @return void
     */
    private static function register_admin_styles() {
        wp_register_style(
            'vulopilot-admin-style',
            self::get_asset_url() . 'styles/index.css',
            array(),
            VULOPILOT_PLUGIN_VERSION
        );
    }

    /**
     * Enqueues a previously registered script handle.
     *
     * @param string $handle Script handle.
     * @return void
     */
    public static function enqueue_script( $handle ) {
        wp_enqueue_script( $handle );
    }

    /**
     * Enqueues a previously registered style handle.
     *
     * @param string $handle Style handle.
     * @return void
     */
    public static function enqueue_style( $handle ) {
        wp_enqueue_style( $handle );
    }

    /**
     * Localizes the admin script with everything the React app needs to
     * boot and call the REST API.
     *
     * @param string $handle Script handle to attach the localized data to.
     * @return void
     */
    public static function localize_scripts( $handle ) {
        wp_localize_script(
            $handle,
            'appLocalizer',
            array(
                'apiUrl'      => untrailingslashit( get_rest_url() ),
                'restUrl'     => VuloPilot()->rest_namespace,
                'nonce'       => wp_create_nonce( 'wp_rest' ),
                'plugin_url'  => VuloPilot()->plugin_url,
                'admin_url'   => admin_url( 'admin.php?page=vulopilot' ),
                'site_url'    => site_url(),
                'version'     => VuloPilot()->version,
                'plugin_slug' => VuloPilot()->plugin_slug,
                'text_domain' => VULOPILOT_PLUGIN_TEXTDOMAIN,
                'date_format' => get_option( 'date_format' ) . ' ' . get_option( 'time_format' ),
            )
        );
    }
}
