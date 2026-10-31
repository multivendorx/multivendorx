<?php
/**
 * Promotions class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * Handles CatalogX promotional notices and plugin listing links.
 *
 * @class Promotions
 */
class Promotions {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_filter(
			'plugin_row_meta',
			array( $this, 'plugin_row_meta' ),
			10,
			2
		);

		add_action(
			'in_plugin_update_message-woocommerce-catalog-enquiry/Woocommerce_Catalog_Enquiry.php',
			array( $this, 'catalogx_plugin_update_message' )
		);

		if ( is_admin() && ! wp_doing_ajax() ) {
			add_filter(
				'plugin_action_links_' . CatalogX()->plugin_base,
				array( $this, 'get_plugin_action_links' )
			);
		}
		add_action( 'admin_notices', array( $this, 'display_vulomail_promotion_notice' ) );
		add_action( 'wp_ajax_catalogx_admin_notice_action', array( $this, 'dismiss_vulomail_notice' ) );
		add_filter( 'catalogx_admin_scripts', array( $this, 'register_notice_script' ) );
		add_filter( 'catalogx_localize_scripts', array( $this, 'localize_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_notice_script' ), 21 );
	}

	/**
	 * Show plugin update message for major updates.
	 *
	 * @return void
	 */
	public function catalogx_plugin_update_message() {
		if ( version_compare( get_option( 'catalogx_plugin_version' ), '6.0.0', '<' ) ) {
			?>
			<p>
				<strong><?php esc_html_e( 'Heads up!', 'catalogx' ); ?></strong>
				<?php esc_html_e( '6.0.0 is a major update. Make a full site backup before upgrading your marketplace to avoid any undesirable situations.', 'catalogx' ); ?>
			</p>
			<?php
		}
	}

	/**
	 * Add custom action links to the plugin listing.
	 *
	 * @param array $links Existing links.
	 * @return array
	 */
	public function get_plugin_action_links( $links ) {
		$plugin_links = array(
			'<a href="' .
			admin_url( 'admin.php?page=catalogx#&tab=settings&subtab=pages-shortcodes' ) .
			'">' .
			__( 'Settings', 'catalogx' ) .
			'</a>',
		);

		$links = array_merge( $plugin_links, $links );

		if ( ! Utill::is_khali_dabba() ) {
			$links[] =
				'<a href="' .
				esc_url( CATALOGX_PRO_SHOP_URL ) .
				'" class="catalogx-pro-plugin" target="_blank" style="font-weight:700;background:linear-gradient(110deg,rgb(63,20,115) 0%,25%,rgb(175 59 116) 50%,75%,rgb(219 75 84) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">' .
				__( 'Upgrade to Pro', 'catalogx' ) .
				'</a>';
		}

		return $links;
	}

	/**
	 * Add plugin row meta links.
	 *
	 * @param array  $links Existing meta links.
	 * @param string $file Plugin file.
	 * @return array
	 */
	public function plugin_row_meta( $links, $file ) {
		if ( CatalogX()->plugin_base !== $file ) {
			return $links;
		}

		$row_meta = array(
			'docs'    => sprintf(
				'<a href="%s" target="_blank">%s</a>',
				'https://catalogx.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
				esc_html__( 'Docs', 'catalogx' )
			),
			'support' => sprintf(
				'<a href="%s" target="_blank">%s</a>',
				'https://catalogx.com/support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
				esc_html__( 'Support', 'catalogx' )
			),
		);

		if ( ! Utill::is_khali_dabba() ) {
			$row_meta['pro'] = sprintf(
				'<a href="%s" class="catalogx-pro-plugin" target="_blank" style="font-weight:700;background:linear-gradient(110deg,rgb(63,20,115) 0%%,25%%,rgb(175 59 116) 50%%,75%%,rgb(219 75 84) 100%%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" title="%s">%s</a>',
				esc_url( CATALOGX_PRO_SHOP_URL ),
				esc_attr__( 'Upgrade to Pro', 'catalogx' ),
				__( 'Upgrade to Pro', 'catalogx' )
			);
		}

		return array_merge( $links, $row_meta );
	}

	/**
	 * Display the Catalogx promotion to administrators who have not activated it.
	 *
	 * This notice is independent of the Catlogx Pro license state.
	 *
	 * @return void
	 */
	public function display_vulomail_promotion_notice() {
		if ( $this->is_vulomail_active() || ! $this->should_display_vulomail_notice() ) {
			return;
		}

		$install_url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=vulomail' ), 'install-plugin_vulomail' );
		?>
		<div class="notice notice-info is-dismissible catalogx-vulomail-notice">
			<h2><?php esc_html_e( 'Improve your email deliverability with VuloMail', 'catalogx' ); ?></h2>

			<p>
				<?php esc_html_e( 'Track outgoing emails, monitor email delivery, and quickly identify failed notifications with VuloMail.', 'catalogx' ); ?>
			</p>

			<p>
				<a class="button button-secondary" href="<?php echo esc_url( $install_url ); ?>">
					<?php esc_html_e( 'Install VuloMail', 'catalogx' ); ?>
				</a>

				<a href="<?php echo esc_url( 'https://vulomail.com/' ); ?>" target="_blank" rel="noopener noreferrer">
					<?php esc_html_e( 'Learn more', 'catalogx' ); ?>
				</a>
			</p>
		</div>
		<?php
	}

	/**
	 * Save the VuloMail notice dismissal timestamp.
	 *
	 * @return void
	 */
	public function dismiss_vulomail_notice() {
		check_ajax_referer( 'dismiss_vulomail_notice', 'nonce' );

		update_option( Utill::CATALOGX_OTHER_SETTINGS['vulomail_notice'], time(), false );

		wp_send_json_success();
	}

	/**
	 * Register the admin-notice dismiss/action handling script.
	 *
	 * @param array $scripts Existing admin scripts.
	 * @return array
	 */
	public function register_notice_script( $scripts ) {
		$scripts['catalogx-admin-notices'] = array(
			'src'  => FrontendScripts::get_asset_path() . 'js/public/' . CATALOGX_PLUGIN_SLUG . '-admin-notices.min.js',
			'deps' => array( 'jquery' ),
		);
		return $scripts;
	}
    /**
     * Add this plugin's localized script data.
     *
     * @param array $localize_script Script localization data keyed by script handle.
     * @return array
     */
    public function localize_scripts( $localize_script ) {
		$localize_scripts = array(
            'catalogx-admin-notices'  => array(
				'object_name' => 'catalogxAdminNotices',
                'data'        => array(
                    'action'  => 'catalogx_admin_notice_action',
                    'nonce'   => wp_create_nonce( 'dismiss_vulomail_notice' ),
                ),
            ),
		);

        return array_merge( $localize_script, $localize_scripts );
	}

	/**
	 * Enqueue the admin-notice dismiss/action handling script.
	 *
	 * @return void
	 */
	public function enqueue_notice_script() {
		FrontendScripts::enqueue_script( 'catalogx-admin-notices' );
		FrontendScripts::localize_scripts('catalogx-admin-notices');
	}

	/**
	 * Check whether the VuloMail notice should be displayed.
	 *
	 * @return bool
	 */
	private function should_display_vulomail_notice() {
		$dismissed_at = (int) get_option( Utill::CATALOGX_OTHER_SETTINGS['vulomail_notice'], 0 );

		return ! $dismissed_at || ( time() - $dismissed_at ) >= YEAR_IN_SECONDS;
	}

	/**
	 * Check whether VuloMail is active on this site or network.
	 *
	 * @return bool
	 */
	private function is_vulomail_active() {
		$active_plugins = (array) get_option( 'active_plugins', array() );

		if ( is_multisite() ) {
			$network_plugins = array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) );
			$active_plugins  = array_merge( $active_plugins, $network_plugins );
		}

		return in_array( 'vulomail/vulomail.php', $active_plugins, true );
	}

}