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
 * @version     PRODUCT_VERSION
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
                esc_url( MooWoodle()->plugin_url ) . 'src/assets/images/moowoodle.png',
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
				'settings'        => array(
					'name'   => __( 'Settings', 'moowoodle' ),
					'subtab' => 'general',
				),
				'synchronization' => array(
					'name'   => __( 'Synchronization', 'moowoodle' ),
					'subtab' => 'synchronize-course',
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
			FrontendScripts::enqueue_style( 'moowoodle-components-style' );
			FrontendScripts::enqueue_script( 'moowoodle-admin-script' );
			FrontendScripts::enqueue_style( 'moowoodle-admin-style' );
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
	public function handle_external_redirects() {
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
                $path = 'build/index.js';
            }
        }

        return $path;
    }
}
