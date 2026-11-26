<?php
/**
 * Communications class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Admin notices promoting Notifima Pro and VuloMail.
 *
 * @version     3.1.9
 * @package     Notifima
 */
class Communications {

	/**
	 * Promotions constructor. Registers notice, AJAX and script hooks.
	 */
	public function __construct() {
		add_action( 'admin_notices', array( $this, 'display_vulomail_promotion_notice' ) );
		add_action( 'wp_ajax_notifima_admin_notice_action', array( $this, 'dismiss_vulomail_notice' ) );
		add_filter( 'admin_notifima_register_scripts', array( $this, 'register_notice_script' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_notice_script' ) );
	}

	/**
	 * Display the Notifima promotion to administrators who have not activated it.
	 *
	 * This notice is independent of the Notifima Pro license state.
	 *
	 * @return void
	 */
	public function display_vulomail_promotion_notice() {
		if ( $this->is_vulomail_active() || ! $this->should_display_vulomail_notice() ) {
			return;
		}

		$install_url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=vulomail' ), 'install-plugin_vulomail' );
		?>
		<div class="notice notice-info is-dismissible notifima-vulomail-notice">
			<span class="notifima-vulomail-icon dashicons dashicons-email-alt" aria-hidden="true"></span>

			<div class="notifima-vulomail-body">
				<p class="notifima-vulomail-title">
					<?php esc_html_e( 'Improve your email deliverability with VuloMail', 'notifima' ); ?>
					<span class="notifima-vulomail-badge"><?php esc_html_e( 'Free', 'notifima' ); ?></span>
				</p>
				<p class="notifima-vulomail-desc">
					<?php esc_html_e( 'Track outgoing emails, monitor email delivery, and quickly identify failed notifications with VuloMail.', 'notifima' ); ?>
				</p>
			</div>

			<div class="notifima-vulomail-actions">
				<a class="button button-primary notifima-vulomail-install" href="<?php echo esc_url( $install_url ); ?>">
					<?php esc_html_e( 'Install VuloMail', 'notifima' ); ?>
				</a>
				<a class="notifima-vulomail-learn" href="<?php echo esc_url( 'https://vulomail.com/' ); ?>" target="_blank" rel="noopener noreferrer">
					<?php esc_html_e( 'Learn more', 'notifima' ); ?>
					<span class="screen-reader-text"><?php esc_html_e( '(opens in a new tab)', 'notifima' ); ?></span>
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

		update_option( Utill::NOTIFIMA_OTHER_SETTINGS['vulomail_notice_dismissal_time'], time(), false );

		wp_send_json_success();
	}

	/**
	 * Register the admin-notice dismiss/action handling script.
	 *
	 * @param array $scripts Existing admin scripts.
	 * @return array
	 */
	public function register_notice_script( $scripts ) {
		$scripts['notifima-admin-notices'] = array(
			'src'  => FrontendScripts::get_asset_path() . 'js/public/' . NOTIFIMA_PLUGIN_SLUG . '-admin-notices.min.js',
			'deps' => array( 'jquery' ),
		);

		return $scripts;
	}

	/**
	 * Enqueue the admin-notice dismiss/action handling script.
	 *
	 * @return void
	 */
	public function enqueue_notice_script() {
		FrontendScripts::enqueue_script( 'notifima-admin-notices' );

		// The VuloMail notice shows on every admin screen, not only Notifima's, so its layout ships as an inline
		// stylesheet here rather than in the admin app's bundle.
		wp_register_style( 'notifima-admin-notices', false, array(), NOTIFIMA_PLUGIN_VERSION );
		wp_enqueue_style( 'notifima-admin-notices' );
		wp_add_inline_style( 'notifima-admin-notices', $this->get_vulomail_notice_css() );

		FrontendScripts::localize_script(
			'notifima-admin-notices',
			'notifimaAdminNotices',
			array(
				'action' => 'notifima_admin_notice_action',
				'nonce'  => wp_create_nonce( 'dismiss_vulomail_notice' ),
			)
		);
	}

	/**
	 * Layout of the VuloMail notice: an icon tile, the title and description, then the actions, on one row from 783px
	 * up and stacked below that. `#wpbody` lets it outrank the Notifima admin app's own notice restyle, which would
	 * otherwise recolour the install button's label to match its background.
	 *
	 * @return string
	 */
	private function get_vulomail_notice_css() {
		return '
			#wpbody .notifima-vulomail-notice { display: flex; align-items: center; gap: 16px; padding: 16px 48px 16px 16px; border-left-color: #5007aa; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-icon { flex: none; width: 44px; height: 44px; border-radius: 10px; background: #f4eefb; color: #5007aa; font-size: 24px; line-height: 44px; text-align: center; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-body { flex: 1; min-width: 0; }
			#wpbody .notifima-vulomail-notice p { margin: 0; padding: 0; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: #1d2327; font-size: 14px; font-weight: 600; line-height: 1.4; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-badge { padding: 1px 8px; border-radius: 999px; background: #e7f6ec; color: #1a7f37; font-size: 11px; font-weight: 600; line-height: 18px; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-desc { margin-top: 2px; color: #50575e; font-size: 13px; line-height: 1.5; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-actions { display: flex; flex: none; align-items: center; gap: 16px; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-install { margin: 0; border-color: #5007aa; background: #5007aa; color: #fff; font-weight: 600; text-decoration: none; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-install:hover,
			#wpbody .notifima-vulomail-notice .notifima-vulomail-install:focus { border-color: #3f0588; background: #3f0588; color: #fff; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-learn { display: inline-flex; align-items: center; gap: 2px; color: #5007aa; font-weight: 600; text-decoration: none; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-learn:hover { text-decoration: underline; }
			#wpbody .notifima-vulomail-notice .notifima-vulomail-learn .dashicons { width: 16px; height: 16px; font-size: 16px; }
			@media (max-width: 782px) {
				#wpbody .notifima-vulomail-notice { flex-wrap: wrap; align-items: flex-start; }
				#wpbody .notifima-vulomail-notice .notifima-vulomail-body { flex-basis: calc(100% - 60px); }
				#wpbody .notifima-vulomail-notice .notifima-vulomail-actions { flex-basis: 100%; padding-left: 60px; }
			}
		';
	}

	/**
	 * Check whether the VuloMail notice should be displayed.
	 *
	 * @return bool
	 */
	private function should_display_vulomail_notice() {
		$dismissed_at = (int) get_option( Utill::NOTIFIMA_OTHER_SETTINGS['vulomail_notice_dismissal_time'], 0 );

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