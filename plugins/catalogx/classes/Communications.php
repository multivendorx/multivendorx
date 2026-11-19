<?php
/**
 * Communications class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * Handles CatalogX communications, including promotional notices and plugin listing links.
 *
 * @class Communications
 */
class Communications {

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
			<span class="catalogx-vulomail-icon dashicons dashicons-email-alt" aria-hidden="true"></span>

			<div class="catalogx-vulomail-body">
				<p class="catalogx-vulomail-title">
					<?php esc_html_e( 'Improve your email deliverability with VuloMail', 'catalogx' ); ?>
					<span class="catalogx-vulomail-badge"><?php esc_html_e( 'Free', 'catalogx' ); ?></span>
				</p>
				<p class="catalogx-vulomail-desc">
					<?php esc_html_e( 'Track outgoing emails, monitor email delivery, and quickly identify failed notifications with VuloMail.', 'catalogx' ); ?>
				</p>
			</div>

			<div class="catalogx-vulomail-actions">
				<a class="button button-primary catalogx-vulomail-install" href="<?php echo esc_url( $install_url ); ?>">
					<?php esc_html_e( 'Install VuloMail', 'catalogx' ); ?>
				</a>
				<a class="catalogx-vulomail-learn" href="<?php echo esc_url( 'https://vulomail.com/' ); ?>" target="_blank" rel="noopener noreferrer">
					<?php esc_html_e( 'Learn more', 'catalogx' ); ?>
					<span class="screen-reader-text"><?php esc_html_e( '(opens in a new tab)', 'catalogx' ); ?></span>
					<span class="dashicons dashicons-external" aria-hidden="true"></span>
				</a>
			</div>
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

		update_option( Utill::CATALOGX_OTHER_SETTINGS['vulomail_notice_dismissal_time'], time(), false );

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

		// The VuloMail notice shows on every admin screen, not only CatalogX's, so its layout ships as an inline
		// stylesheet here rather than in the admin app's bundle.
		wp_register_style( 'catalogx-admin-notices', false, array(), CatalogX()->version );
		wp_enqueue_style( 'catalogx-admin-notices' );
		wp_add_inline_style( 'catalogx-admin-notices', $this->get_vulomail_notice_css() );
	}

	/**
	 * Layout of the VuloMail notice: an icon tile, the title and description, then the actions, on one row from 783px
	 * up and stacked below that. `#wpbody` lets it outrank the CatalogX admin app's own notice restyle, which would
	 * otherwise recolour the install button's label to match its background.
	 *
	 * @return string
	 */
	private function get_vulomail_notice_css() {
		return '
			#wpbody .catalogx-vulomail-notice { display: flex; align-items: center; gap: 16px; padding: 16px 48px 16px 16px; border-left-color: #5007aa; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-icon { flex: none; width: 44px; height: 44px; border-radius: 10px; background: #f4eefb; color: #5007aa; font-size: 24px; line-height: 44px; text-align: center; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-body { flex: 1; min-width: 0; }
			#wpbody .catalogx-vulomail-notice p { margin: 0; padding: 0; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: #1d2327; font-size: 14px; font-weight: 600; line-height: 1.4; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-badge { padding: 1px 8px; border-radius: 999px; background: #e7f6ec; color: #1a7f37; font-size: 11px; font-weight: 600; line-height: 18px; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-desc { margin-top: 2px; color: #50575e; font-size: 13px; line-height: 1.5; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-actions { display: flex; flex: none; align-items: center; gap: 16px; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-install { margin: 0; border-color: #5007aa; background: #5007aa; color: #fff; font-weight: 600; text-decoration: none; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-install:hover,
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-install:focus { border-color: #3f0588; background: #3f0588; color: #fff; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-learn { display: inline-flex; align-items: center; gap: 2px; color: #5007aa; font-weight: 600; text-decoration: none; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-learn:hover { text-decoration: underline; }
			#wpbody .catalogx-vulomail-notice .catalogx-vulomail-learn .dashicons { width: 16px; height: 16px; font-size: 16px; }
			@media (max-width: 782px) {
				#wpbody .catalogx-vulomail-notice { flex-wrap: wrap; align-items: flex-start; }
				#wpbody .catalogx-vulomail-notice .catalogx-vulomail-body { flex-basis: calc(100% - 60px); }
				#wpbody .catalogx-vulomail-notice .catalogx-vulomail-actions { flex-basis: 100%; padding-left: 60px; }
			}
		';
	}

	/**
	 * Check whether the VuloMail notice should be displayed.
	 *
	 * @return bool
	 */
	private function should_display_vulomail_notice() {
		$dismissed_at = (int) get_option( Utill::CATALOGX_OTHER_SETTINGS['vulomail_notice_dismissal_time'], 0 );

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