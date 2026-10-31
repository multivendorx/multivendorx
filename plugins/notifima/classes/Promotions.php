<?php
/**
 * Promotions class file.
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
class Promotions {

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
			<h2><?php esc_html_e( 'Improve your email deliverability with VuloMail', 'notifima' ); ?></h2>

			<p>
				<?php esc_html_e( 'Track outgoing emails, monitor email delivery, and quickly identify failed notifications with VuloMail.', 'notifima' ); ?>
			</p>

			<p>
				<a class="button button-secondary" href="<?php echo esc_url( $install_url ); ?>">
					<?php esc_html_e( 'Install VuloMail', 'notifima' ); ?>
				</a>

				<a href="<?php echo esc_url( 'https://vulomail.com/' ); ?>" target="_blank" rel="noopener noreferrer">
					<?php esc_html_e( 'Learn more', 'notifima' ); ?>
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

		update_option( Utill::NOTIFIMA_OTHER_SETTINGS['vulomail_notice'], time(), false );

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
	 * Check whether the VuloMail notice should be displayed.
	 *
	 * @return bool
	 */
	private function should_display_vulomail_notice() {
		$dismissed_at = (int) get_option( Utill::NOTIFIMA_OTHER_SETTINGS['vulomail_notice'], 0 );

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