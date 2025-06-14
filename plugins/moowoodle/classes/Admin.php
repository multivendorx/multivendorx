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
 * @version     6.0.0
 * @author      Dualcube
 */
class Admin {
	/**
     * Admin constructor.
     */
	public function __construct() {
		// Register submenu for admin menu.
		add_action( 'admin_menu', array( &$this, 'add_submenu' ) );
		// enqueue scripts in admin panel.
		add_action( 'admin_enqueue_scripts', array( &$this, 'enqueue_admin_script' ) );
	}

	/**
	 * Add moowoodle menu in admin dashboard.
     *
	 * @return void
	 */
    public static function add_menu() {
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
        }
    }

	/**
	 * Add Option page.
	 */
	public function add_submenu() {
		$pro_sticker = apply_filters( 'is_moowoodle_pro_inactive', true ) ?

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
						background: linear-gradient(-28deg, #f6a091, #bb939c, #5f6eb3) !important;
						color: White !important;
					};
				</style>
				<div class="upgrade-to-pro"><i class="dashicons dashicons-awards"></i>' . esc_html__( 'Upgrade to Pro', 'moowoodle' ) . '</div> ',
				'manage_options',
				'',
				array( $this, 'handle_external_redirects' )
			);
		}

		remove_submenu_page( 'moowoodle', 'moowoodle' );
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
}
