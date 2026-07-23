<?php
/**
 * Admin class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot Admin class.
 *
 * Registers the top-level admin menu and its submenu pages, and enqueues
 * the React dashboard bundle on VuloPilot's own admin screen. Mirrors
 * MultiVendorX\Admin's add_menu_page()/add_submenu_page() + hash-tab
 * pattern (`vulopilot#&tab=dashboard`) rather than WordPress's normal
 * per-page URLs, so the whole admin UI is one React app reading `tab`
 * from location.hash (see src/app.tsx) — same mechanism the free
 * multivendorx plugin's admin screen already uses.
 *
 * @class       Admin class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Admin constructor.
     */
    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_menus' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );
    }

    /**
     * Registers the VuloPilot top-level menu and its submenu tabs.
     *
     * @return void
     */
    public function add_menus() {
        if ( ! is_admin() ) {
            return;
        }

        add_menu_page(
            'VuloPilot',
            'VuloPilot',
            'manage_options',
            'vulopilot',
            array( $this, 'create_admin_page' ),
            'dashicons-shield',
            56
        );

        $submenus = apply_filters(
            'vulopilot_submenus',
            array(
                'dashboard'    => array(
                    'name'     => __( 'Dashboard', 'vulopilot' ),
                    'priority' => 10,
                ),
                'health'       => array(
                    'name'     => __( 'Health', 'vulopilot' ),
                    'priority' => 20,
                ),
                'seo'          => array(
                    'name'     => __( 'SEO', 'vulopilot' ),
                    'priority' => 30,
                ),
                'geo'          => array(
                    'name'     => __( 'GEO', 'vulopilot' ),
                    'priority' => 40,
                ),
                'woocommerce'  => array(
                    'name'     => __( 'WooCommerce', 'vulopilot' ),
                    'priority' => 50,
                ),
                'automation'   => array(
                    'name'     => __( 'Automation', 'vulopilot' ),
                    'priority' => 60,
                ),
                'reports'      => array(
                    'name'     => __( 'Reports', 'vulopilot' ),
                    'priority' => 70,
                ),
                'ai-assistant' => array(
                    'name'     => __( 'AI Assistant', 'vulopilot' ),
                    'priority' => 80,
                ),
                'activity'     => array(
                    'name'     => __( 'Activity', 'vulopilot' ),
                    'priority' => 90,
                ),
                'modules'      => array(
                    'name'     => __( 'Modules', 'vulopilot' ),
                    'priority' => 95,
                ),
                'settings'     => array(
                    'name'     => __( 'Settings', 'vulopilot' ),
                    'priority' => 100,
                ),
            )
        );

        uasort(
            $submenus,
            function ( $a, $b ) {
                return ( $a['priority'] ?? 0 ) <=> ( $b['priority'] ?? 0 );
            }
        );

        foreach ( $submenus as $slug => $submenu ) {
            add_submenu_page(
                'vulopilot',
                $submenu['name'],
                $submenu['name'],
                'manage_options',
                'vulopilot#&tab=' . $slug,
                '__return_null'
            );
        }

        // The top-level menu click target duplicates the "Dashboard" submenu
        // it was auto-registered as by add_menu_page() — remove it so the
        // submenu list doesn't show "VuloPilot" twice.
        remove_submenu_page( 'vulopilot', 'vulopilot' );
    }

    /**
     * Renders the empty mount point the React app renders into.
     *
     * @return void
     */
    public function create_admin_page() {
        echo '<div id="admin-main-wrapper" class="admin-main-wrapper"></div>';
    }

    /**
     * Enqueues and localizes the admin script bundle on VuloPilot's own
     * admin screen only.
     *
     * @return void
     */
    public function enqueue_admin_script() {
        $screen = get_current_screen();

        if ( ! $screen || 'toplevel_page_vulopilot' !== $screen->id ) {
            return;
        }

        wp_enqueue_script( 'wp-element' );

        FrontendScripts::admin_load_scripts();
        FrontendScripts::enqueue_script( 'vulopilot-vendor-script' );
        FrontendScripts::enqueue_script( 'vulopilot-admin-script' );
        FrontendScripts::enqueue_style( 'vulopilot-admin-style' );
        FrontendScripts::localize_scripts( 'vulopilot-admin-script' );
    }
}
