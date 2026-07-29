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
 * Also grafts a grouped/collapsible look onto that same native
 * `#toplevel_page_vulopilot` menu itself (admin-menu/) rather than
 * a custom in-content React sidebar — see enqueue_menu_grouping_assets()'s
 * own docblock for why, and for the constraints that choice comes with.
 *
 * @class       Admin class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Dashicon class per collapsible group id (matches each submenu
     * entry's own 'group' value below). Just id → icon, not id → label —
     * class constants can't run __() at declaration time, so the
     * translated label per group is built separately, from literal
     * __() calls, in enqueue_menu_grouping_assets().
     *
     * @var array<string, string>
     */
    const GROUPS = array(
        'ai-visibility' => 'dashicons-lightbulb',
        'seo-content'   => 'dashicons-search',
        'site-health'   => 'dashicons-shield',
        'tools'         => 'dashicons-admin-tools',
    );

    /**
     * Admin constructor.
     */
    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_menus' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_menu_grouping_assets' ) );
    }

    /**
     * Registers the VuloPilot top-level menu and its submenu tabs.
     *
     * Each entry's optional 'group' key must match a GROUPS key —
     * admin-menu/admin-menu-groups.js reads it (via the
     * tabToGroup map enqueue_menu_grouping_assets() localizes) to decide
     * which already-rendered `<li>` belongs under which collapsible
     * group header. Priorities are deliberately assigned so every group's
     * members sort contiguously — the grouping script only inserts a
     * header before a run's first member and shows/hides the run in
     * place, it never re-parents `<li>` elements (see that file's own
     * docblock for why), so non-contiguous members of the same group
     * would render as two separate broken-up sections instead of one.
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
                'dashboard'        => array(
                    'name'     => __( 'Dashboard', 'vulopilot' ),
                    'priority' => 10,
                    'icon'     => 'dashicons-dashboard',
                ),
                'geo'              => array(
                    'name'     => __( 'GEO', 'vulopilot' ),
                    'priority' => 20,
                    'group'    => 'ai-visibility',
                    'icon'     => 'dashicons-star-filled',
                ),
                'ai-content'       => array(
                    'name'     => __( 'AI Content', 'vulopilot' ),
                    'priority' => 21,
                    'group'    => 'ai-visibility',
                    'icon'     => 'dashicons-edit',
                ),
                'crawler-traffic'  => array(
                    'name'     => __( 'Crawler Traffic', 'vulopilot' ),
                    'priority' => 22,
                    'group'    => 'ai-visibility',
                    'icon'     => 'dashicons-networking',
                ),
                'brand-visibility' => array(
                    'name'     => __( 'Brand Visibility', 'vulopilot' ),
                    'priority' => 30,
                    'icon'     => 'dashicons-megaphone',
                ),
                'seo'              => array(
                    'name'     => __( 'SEO', 'vulopilot' ),
                    'priority' => 40,
                    'group'    => 'seo-content',
                    'icon'     => 'dashicons-search',
                ),
                'content'          => array(
                    'name'     => __( 'Content', 'vulopilot' ),
                    'priority' => 41,
                    'group'    => 'seo-content',
                    'icon'     => 'dashicons-media-text',
                ),
                'schema'           => array(
                    'name'     => __( 'Schema', 'vulopilot' ),
                    'priority' => 42,
                    'group'    => 'seo-content',
                    'icon'     => 'dashicons-editor-code',
                ),
                'redirects'        => array(
                    'name'     => __( 'Redirects & 404s', 'vulopilot' ),
                    'priority' => 43,
                    'group'    => 'seo-content',
                    'icon'     => 'dashicons-randomize',
                ),
                'performance'      => array(
                    'name'     => __( 'Performance', 'vulopilot' ),
                    'priority' => 50,
                    'group'    => 'site-health',
                    'icon'     => 'dashicons-performance',
                ),
                'accessibility'    => array(
                    'name'     => __( 'Accessibility', 'vulopilot' ),
                    'priority' => 51,
                    'group'    => 'site-health',
                    'icon'     => 'dashicons-universal-access',
                ),
                'security'         => array(
                    'name'     => __( 'Security', 'vulopilot' ),
                    'priority' => 52,
                    'group'    => 'site-health',
                    'icon'     => 'dashicons-shield',
                ),
                'woocommerce'      => array(
                    'name'     => __( 'WooCommerce', 'vulopilot' ),
                    'priority' => 60,
                    'icon'     => 'dashicons-cart',
                ),
                'automation'       => array(
                    'name'     => __( 'Automation', 'vulopilot' ),
                    'priority' => 70,
                    'icon'     => 'dashicons-update',
                ),
                // 'health' has no row in the grouped menu's own IA, but
                // it's a real, working page (score-by-category summary +
                // the unfiltered findings list) — not part of any group,
                // not something to delete from the product. Kept
                // reachable, ungrouped, between Automation and Tools.
                'health'           => array(
                    'name'     => __( 'Health', 'vulopilot' ),
                    'priority' => 75,
                    'icon'     => 'dashicons-heart',
                ),
                'modules'          => array(
                    'name'     => __( 'Modules', 'vulopilot' ),
                    'priority' => 80,
                    'group'    => 'tools',
                    'icon'     => 'dashicons-admin-plugins',
                ),
                'ai-assistant'     => array(
                    'name'     => __( 'AI Assistant', 'vulopilot' ),
                    'priority' => 81,
                    'group'    => 'tools',
                    'icon'     => 'dashicons-format-chat',
                ),
                'reports'          => array(
                    'name'     => __( 'Reports', 'vulopilot' ),
                    'priority' => 82,
                    'group'    => 'tools',
                    'icon'     => 'dashicons-chart-bar',
                ),
                'activity'         => array(
                    'name'     => __( 'Activity', 'vulopilot' ),
                    'priority' => 83,
                    'group'    => 'tools',
                    'icon'     => 'dashicons-clock',
                ),
                'settings'         => array(
                    'name'     => __( 'Settings', 'vulopilot' ),
                    'priority' => 100,
                    'icon'     => 'dashicons-admin-generic',
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

        // Stash the same $submenus this method just built so
        // enqueue_menu_grouping_assets() (a separate admin_enqueue_scripts
        // callback, running later in the same request) can derive the
        // tab→group map from it without re-declaring the list a second
        // time — add_menus() itself runs on 'admin_menu', always earlier
        // than 'admin_enqueue_scripts' in WordPress's own load order.
        $this->registered_submenus = $submenus;
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

    /**
     * Grafts a grouped/collapsible look onto the native
     * `#toplevel_page_vulopilot` admin menu — a deliberately different
     * approach from a custom in-content React sidebar: this menu is
     * WordPress core's own markup, rendered on *every* wp-admin screen
     * (not just VuloPilot's own page), so it has to be enqueued
     * unconditionally here rather than gated to one screen the way
     * enqueue_admin_script() is.
     *
     * The admin-menu/admin-menu-groups.js file is hand-written vanilla JS
     * (no build step) rather than a webpack entry — it only ever touches
     * plain DOM (no JSX/TS, no React, no dependency on the admin bundle
     * even being loaded on the current screen), so routing it through
     * wp-scripts/webpack would add a bundling step for zero benefit.
     *
     * The script only ever *shows/hides* and *inserts a header before*
     * the `<li>` elements WordPress itself already rendered from
     * add_menus()'s $submenus list — it never re-parents them out of the
     * submenu `<ul>`, specifically so this file's
     * `#toplevel_page_vulopilot > ul > li > a` selector in src/app.tsx
     * (used to toggle the 'current' class as the hash tab changes) keeps
     * matching every item regardless of which group it's in.
     *
     * @return void
     */
    public function enqueue_menu_grouping_assets() {
        if ( ! is_admin() || empty( $this->registered_submenus ) ) {
            return;
        }

        $tab_to_group = array();
        $tab_to_icon  = array();

        foreach ( $this->registered_submenus as $slug => $submenu ) {
            if ( ! empty( $submenu['group'] ) ) {
                $tab_to_group[ $slug ] = $submenu['group'];
            }

            if ( ! empty( $submenu['icon'] ) ) {
                $tab_to_icon[ $slug ] = $submenu['icon'];
            }
        }

        // Built from literal __() calls (never GROUPS's own label strings
        // fed through __() dynamically) so the i18n string-extraction
        // tooling can actually find these — see i18n.md.
        $translated_labels = array(
            'ai-visibility' => __( 'AI Visibility', 'vulopilot' ),
            'seo-content'   => __( 'SEO & Content', 'vulopilot' ),
            'site-health'   => __( 'Site Health', 'vulopilot' ),
            'tools'         => __( 'Tools', 'vulopilot' ),
        );

        $groups = array();

        foreach ( self::GROUPS as $group_id => $icon ) {
            $groups[] = array(
                'id'    => $group_id,
                'label' => $translated_labels[ $group_id ] ?? $group_id,
                'icon'  => $icon,
            );
        }

        wp_enqueue_script(
            'vulopilot-admin-menu-groups',
            VuloPilot()->plugin_url . 'admin-menu/admin-menu-groups.js',
            array(),
            VuloPilot()->version,
            true
        );

        wp_enqueue_style(
            'vulopilot-admin-menu-groups',
            VuloPilot()->plugin_url . 'admin-menu/admin-menu-groups.css',
            array(),
            VuloPilot()->version
        );

        wp_localize_script(
            'vulopilot-admin-menu-groups',
            'vulopilotMenuGroups',
            array(
                'groups'     => $groups,
                'tabToGroup' => $tab_to_group,
                'tabToIcon'  => $tab_to_icon,
            )
        );
    }

    /**
     * The $submenus list add_menus() built, stashed for
     * enqueue_menu_grouping_assets() to read — see add_menus()'s own
     * docblock for why this isn't just rebuilt a second time there.
     *
     * @var array
     */
    private $registered_submenus = array();
}
