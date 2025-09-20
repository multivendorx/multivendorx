<?php
/**
 * Admin class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

/**
 * MooWoodle Admin class
 *
 * @class       Admin class
 * @version     3.3.0
 * @author      DualCube
 */
class Admin {
	/**
     * Admin constructor.
     */
	public function __construct() {
		// Register admin menu.
        add_action( 'admin_menu', array( $this, 'add_menus' ) );
		// enqueue scripts in admin panel.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );

		// Allow URL.
        add_filter( 'allowed_redirect_hosts', array( $this, 'allow_moowoodle_redirect_host' ) );
		// For loco translation.
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );
	}

	/**
	 * Add moowoodle menu in admin dashboard.
     *
	 * @return void
	 */
    public static function add_menus() {
        if ( is_admin() ) {
            add_menu_page(
                'MooWoodle',
                'MooWoodle',
                'manage_options',
                'moowoodle',
                array( self::class, 'create_settings_page' ),
                'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI1LjQuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMDgwIDEwODAiIHN0eWxlPSJmaWxsOiNmZmY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMTI4Ljc1LDEyMi44NXY2OTAuMjhjMCwxLjEsMC41NSwxLjY3LDEuNjcsMS42N2MxLjEsMCwxLjY3LTAuNTcsMS42Ny0xLjY3bDMxNC4zLTU3Ni43NwoJCQljMjAuMDYtMzYuNzgsNTAuNy01NS4xNyw5MS45NS01NS4xN2M0MS4yMiwwLDcxLjg5LDE4LjM5LDkxLjk1LDU1LjE3bDMxMi42Miw1NzYuNzdjMCwxLjEsMC41NSwxLjY3LDEuNjcsMS42NwoJCQljMS4xLDAsMS42Ny0wLjU3LDEuNjctMS42N3YtNjg4LjZjMC0xNy44NCw2LjQtMzMuNDQsMTkuMjMtNDYuODFjMTIuOC0xMy4zNywyOC42OC0yMC4wNiw0Ny42NS0yMC4wNgoJCQljMTguOTQsMCwzNC44Miw2LjY5LDQ3LjY0LDIwLjA2YzEyLjgsMTMuMzcsMTkuMjMsMjguOTcsMTkuMjMsNDYuODF2ODQwLjk0YzAsMTguOTQtNi45OCwzNS4zNy0yMC45LDQ5LjMyCgkJCWMtMTMuOTUsMTMuOTItMjkuOSwyMS45Ny00OC44NCwyMS45N2MtNDcuOTQsMC04Mi40OC0yMS43MS0xMDMuNjQtNjIuOTNMNTQwLjAxLDMwNC45MWMwLTEuMTItMC41OC0xLjY3LTEuNjctMS42NwoJCQljLTIuMjUsMC0zLjM0LDAuNTUtMy4zNCwxLjY3TDE2OC44Nyw5NzguNjRjLTIyLjMxLDQwLjEzLTU2LjI5LDYwLjE5LTEwMS45OCw2MC4xOWMtMTguOTcsMC0zNC44NS02LjY5LTQ3LjY1LTIwLjA2CgkJCWMtMTIuODMtMTMuMzgtMTkuMjMtMjkuNTQtMTkuMjMtNDguNDhWMTIyLjg1YzAtMTcuODQsNi4xMS0zMy4xOCwxOC4zOS00NS45N2MxMi4yNS0xMi44MiwyNy4zLTE5LjIzLDQ1LjE0LTE5LjIzCgkJCWMxNy44MiwwLDMzLjE1LDYuNCw0NS45NywxOS4yM0MxMjIuMzIsODkuNjgsMTI4Ljc1LDEwNS4wMSwxMjguNzUsMTIyLjg1eiIvPgoJPC9nPgoJPGc+CgkJPHBhdGggZD0iTTEwOS41LDEwMTcuNTNjLTEyLjgzLDEyLjgyLTI4LjE0LDE4Ljk3LTQ1Ljk1LDE4Ljk3Yy0xNy44NCwwLTMyLjkxLTYuMTQtNDUuMTYtMTguOTdDNi4xMSwxMDA0LjczLDAsOTg5LjM5LDAsOTcxLjU1CgkJCWwwLjAyLTg2MS44M2MwLTE4Ljk0LDYuNC0zNS4xMSwxOS4yMy00OC40OGMxMi44LTEzLjM3LDI4LjY4LTIwLjA2LDQ3LjY1LTIwLjA2YzQ1LjY5LDAsNzkuNjcsMjAuMDYsMTAxLjk4LDYwLjE5TDUzNSw3NzUuMDkKCQkJYzAsMS4xMiwxLjEsMS42NywzLjM0LDEuNjdjMS4xLDAsMS42Ny0wLjU1LDEuNjctMS42N2wzNjYuMTItNjcyLjA2YzIxLjE2LTQxLjIyLDU1LjcyLTYxLjg2LDEwMy42NS02MS44NgoJCQljMTguOTQsMCwzNS4zNyw2Ljk4LDQ5LjMyLDIwLjljMTMuOTIsMTMuOTUsMjAuOSwzMC4zOCwyMC45LDQ5LjMydjg1OC40OWMwLDE3Ljg0LTYuNDIsMzMuNDQtMTkuMjMsNDYuODEKCQkJYy0xMi44MiwxMy4zNy0yOC43MSwyMC4wNi00Ny42NCwyMC4wNmMtMTguOTcsMC0zNC44NS02LjY5LTQ3LjY1LTIwLjA2Yy0xMi44Mi0xMy4zNy0xOS4yMy0yOC45Ny0xOS4yMy00Ni44MVYyNjYuODcKCQkJYzAtMS4xLTAuNTctMS42Ny0xLjY3LTEuNjdjLTEuMTIsMC0xLjY3LDAuNTctMS42NywxLjY3TDYzMC4yOSw4NDMuNjRjLTIwLjA2LDM2Ljc4LTUwLjczLDU1LjE3LTkxLjk1LDU1LjE3CgkJCWMtNDEuMjUsMC03MS44OS0xOC4zOS05MS45NS01NS4xN2wtMzE0LjMtNTc2Ljc3YzAtMS4xLTAuNTgtMS42Ny0xLjY3LTEuNjdjLTEuMTIsMC0xLjY3LDAuNTctMS42NywxLjY3bC0wLjAyLDcwNC42OAoJCQlDMTI4LjczLDk4OS4zOSwxMjIuMywxMDA0LjczLDEwOS41LDEwMTcuNTN6Ii8+Cgk8L2c+CjwvZz4KPC9zdmc+Cg==',
                50
		    );

			$pro_sticker = ! Util::is_khali_dabba() ?

			'<span class="mw-pro-tag" style="font-size: 0.5rem; background: #e35047; padding: 0.125rem 0.5rem; color: #F9F8FB; font-weight: 700; line-height: 1.1; position: absolute; border-radius: 2rem 0; right: -0.75rem; top: 50%; transform: translateY(-50%)">Pro</span>' : '';

			// Array contain moowoodle submenu.
			$submenus = array(
				'courses'         => array(
					'name'   => __( 'Courses', 'moowoodle' ),
					'subtab' => '',
				),
				'cohorts'         => array(
					'name'   => __( 'Cohorts', 'moowoodle' ) . $pro_sticker,
					'subtab' => '',
				),
				'enrolments'      => array(
					'name'   => __( 'Enrolments', 'moowoodle' ) . $pro_sticker,
					'subtab' => '',
				),
				'synchronization' => array(
					'name'   => __( 'Synchronization', 'moowoodle' ),
					'subtab' => 'synchronize-course',
				),
				'settings'        => array(
					'name'   => __( 'Settings', 'moowoodle' ),
					'subtab' => 'general',
				),
			);

			// Register all submenu.
			foreach ( $submenus as $slug => $submenu ) {
				// prepare subtab if subtab is exist.
				$subtab = '';

				if ( $submenu['subtab'] ) {
					$subtab = '&subtab=' . $submenu['subtab'];
				}

				add_submenu_page(
					'moowoodle',
					$submenu['name'],
					"<span style='position: relative; display: block; width: 100%;' class='admin-menu'>" . $submenu['name'] . '</span>',
					'manage_options',
					'moowoodle#&tab=' . $slug . $subtab,
					'_-return_null'
				);
			}

			// Register upgrade to pro submenu page.
			if ( ! Util::is_khali_dabba() ) {
				add_submenu_page(
					'moowoodle',
					__( 'Upgrade to Pro', 'moowoodle' ),
					'<style>
						a:has(.upgrade-to-pro){
                            background: linear-gradient(-28deg, #C4A9E8, #7848B9, #852AFF) !important;
                            color: White !important;
                        }
                        padding: 5px 0;
					</style>
					<div class="upgrade-to-pro"><i class="dashicons dashicons-awards"></i>' . esc_html__( 'Upgrade to Pro', 'moowoodle' ) . '</div> ',
					'manage_options',
					'',
					array( self::class, 'handle_external_redirects' )
				);
			}

			remove_submenu_page( 'moowoodle', 'moowoodle' );
		}
    }

	/**
     * Enqueue JavaScript for admin fronend page and localize script.
     *
     * @return void
     */
	public function enqueue_admin_script() {

		if ( get_current_screen()->id === 'toplevel_page_moowoodle' ) {
			FrontendScripts::admin_load_scripts();
			FrontendScripts::enqueue_script( 'moowoodle-components-script' );
			FrontendScripts::enqueue_script( 'moowoodle-admin-script' );
			FrontendScripts::enqueue_style( 'moowoodle-components-style' );
			FrontendScripts::localize_scripts( 'moowoodle-admin-script' );
		}
	}

	/**
     * Admin frontend react page.
	 * If plugin is not active it render activation page.
     *
     * @return void
     */
	public static function create_settings_page() {
        echo '<div id="admin-main-wrapper"></div>';
    }

	/**
	 * Redirct to pro shop url.
     *
	 * @return never
	 */
	public static function handle_external_redirects() {
		wp_safe_redirect( esc_url_raw( MOOWOODLE_PRO_SHOP_URL ) );
		exit;
	}

	/**
     * Allow Moowoodle domain for safe redirection using wp_safe_redirect().
     *
     * @param string[] $hosts List of allowed hosts.
     * @return string[] Modified list with Moowoodle domain included.
     */
    public function allow_moowoodle_redirect_host( $hosts ) {
        $parsed_url = wp_parse_url( MOOWOODLE_PRO_SHOP_URL );

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

        if ( strpos( $url, 'moowoodle' ) !== false ) {
            foreach ( MooWoodle()->block_paths as $key => $new_path ) {
                if ( strpos( $url, $key ) !== false ) {
                    $path = $new_path;
                }
            }

            if ( strpos( $url, 'block' ) === false ) {
                $path = 'assets/js/components.js';
            }
        }

        return $path;
    }
}
