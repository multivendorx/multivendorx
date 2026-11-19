<?php
/**
 * Base for a companion VuloLabs plugin that MultiVendorX installs from wordpress.org.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations;

use MultiVendorX\AdminNotice;

defined( 'ABSPATH' ) || exit;

/**
 * Installs and activates one companion plugin (VuloMail, VuloForm) once Install.php
 * flags it 'pending', then shows a one-time success notice, or a failure notice with
 * a Retry link. A subclass names the plugin and its options, and can run its own step
 * after the plugin is active (VuloMailMigration moves settings into VuloMail).
 *
 * Runs on early admin_menu rather than admin_init: installing a plugin needs
 * admin-only includes/capabilities not reliably available during the version-bump
 * migration, and admin_menu fires before admin_init, so the companion's own menu
 * callback can still register in the same request.
 *
 * @class       CompanionPlugin class
 * @version     5.0.23
 * @author      MultiVendorX
 */
abstract class CompanionPlugin {

	/**
	 * The companion's wordpress.org slug, e.g. 'vulomail'.
	 *
	 * @return string
	 */
	abstract protected function get_plugin_slug();

	/**
	 * The companion's main file relative to the plugins directory, e.g. 'vulomail/vulomail.php'.
	 *
	 * @return string
	 */
	abstract protected function get_plugin_file();

	/**
	 * The companion's display name, e.g. 'VuloMail'.
	 *
	 * @return string
	 */
	abstract protected function get_plugin_name();

	/**
	 * Option holding the install status: 'pending', 'done' or 'failed'.
	 *
	 * @return string
	 */
	abstract protected function get_status_option();

	/**
	 * Option holding the last error message while the status is 'failed'.
	 *
	 * @return string
	 */
	abstract protected function get_error_option();

	/**
	 * Option flagging that the one-time success notice has been shown.
	 *
	 * @return string
	 */
	abstract protected function get_notice_shown_option();

	/**
	 * The admin-post action (and nonce action) behind the failure notice's Retry link.
	 *
	 * @return string
	 */
	abstract protected function get_retry_action();

	/**
	 * Text of the one-time success notice.
	 *
	 * @return string
	 */
	abstract protected function get_success_message();

	/**
	 * Constructor.
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'maybe_run_pending_install' ), 1 );
		add_action( 'admin_notices', array( $this, 'render_admin_notice' ) );
		add_action( 'admin_post_' . $this->get_retry_action(), array( $this, 'handle_retry_request' ) );
	}

	/**
	 * Runs once the companion is installed and active. Override to configure it.
	 *
	 * @return true|\WP_Error
	 */
	protected function after_install() {
		return true;
	}

	/**
	 * Install/activate the companion, then run after_install(), if flagged pending.
	 *
	 * @return void
	 */
	public function maybe_run_pending_install() {
		if ( 'pending' !== get_option( $this->get_status_option() ) ) {
			return;
		}

		if ( ! current_user_can( 'install_plugins' ) || ! current_user_can( 'activate_plugins' ) ) {
			return;
		}

		// Two admin requests at once (the post-login redirect, a second tab) would both
		// download the plugin, and the loser would record "Destination folder already
		// exists" over the winner's success. add_option() is atomic, so only one runs.
		$lock_option = $this->get_status_option() . '_lock';
		if ( ! add_option( $lock_option, time(), '', false ) ) {
			if ( time() - (int) get_option( $lock_option ) < 5 * MINUTE_IN_SECONDS ) {
				return;
			}
			// A request that died mid-install left the lock behind; take it over.
			update_option( $lock_option, time(), false );
		}

		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$installed = $this->install_and_activate();
		if ( true === $installed ) {
			$installed = $this->after_install();
		}

		if ( is_wp_error( $installed ) ) {
			update_option( $this->get_status_option(), 'failed' );
			update_option( $this->get_error_option(), $installed->get_error_message() );
			MultiVendorX()->util->log( $installed );
		} else {
			update_option( $this->get_status_option(), 'done' );
			delete_option( $this->get_error_option() );
		}

		delete_option( $lock_option );
	}

	/**
	 * Install the companion from wordpress.org (if not already present) and activate it.
	 *
	 * @return true|\WP_Error
	 */
	private function install_and_activate() {
		if ( is_plugin_active( $this->get_plugin_file() ) ) {
			return true;
		}

		if ( ! file_exists( WP_PLUGIN_DIR . '/' . $this->get_plugin_file() ) ) {
			$downloaded = $this->download_and_install();

			if ( is_wp_error( $downloaded ) ) {
				return $downloaded;
			}
		}

		// Checks the companion's own "Requires PHP"/"Requires at least" and refuses if unmet.
		$activated = activate_plugin( $this->get_plugin_file() );

		if ( is_wp_error( $activated ) ) {
			return $activated;
		}

		$this->boot_in_current_request();

		return true;
	}

	/**
	 * Finish booting a just-activated companion in this request.
	 *
	 * activate_plugin() only includes the main file, not plugins_loaded/init — without
	 * this, the companion's admin menu wouldn't appear until the next page load. Each
	 * VuloLabs plugin has a global accessor named after it (VuloMail(), VuloForm()) and
	 * fires "{slug}_loaded" once booted, which is what makes this generic.
	 *
	 * @return void
	 */
	private function boot_in_current_request() {
		$accessor = $this->get_plugin_name();

		if ( ! function_exists( $accessor ) || did_action( $this->get_plugin_slug() . '_loaded' ) ) {
			return;
		}

		$companion = $accessor();
		$companion->init_plugin();
		$companion->init_classes();
	}

	/**
	 * Download and install the companion from the wordpress.org plugin directory.
	 *
	 * @return true|\WP_Error
	 */
	private function download_and_install() {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/misc.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$plugin_information = plugins_api(
			'plugin_information',
			array(
				'slug'   => $this->get_plugin_slug(),
				'fields' => array( 'sections' => false ),
			)
		);

		if ( is_wp_error( $plugin_information ) ) {
			return $plugin_information;
		}

		$upgrader_skin = new \Automatic_Upgrader_Skin();
		$upgrader      = new \Plugin_Upgrader( $upgrader_skin );
		$installed     = $upgrader->install( $plugin_information->download_link );

		if ( is_wp_error( $installed ) ) {
			return $installed;
		}

		if ( ! $installed ) {
			// WP_Upgrader_Skin has no get_error_messages(); check its $result property instead.
			$skin_result = $upgrader_skin->result;
			$message     = ( $skin_result instanceof \WP_Error && $skin_result->has_errors() )
				? implode( ' ', $skin_result->get_error_messages() )
				: sprintf(
					/* translators: %s: companion plugin name, e.g. VuloMail. */
					__( '%s could not be downloaded or installed.', 'multivendorx' ),
					$this->get_plugin_name()
				);

			return new \WP_Error( $this->get_plugin_slug() . '_install_failed', $message );
		}

		return true;
	}

	/**
	 * Render the one-time success notice, or the persistent failure notice with a Retry link.
	 *
	 * @return void
	 */
	public function render_admin_notice() {
		if ( ! current_user_can( 'install_plugins' ) ) {
			return;
		}

		$status = get_option( $this->get_status_option() );

		if ( 'done' === $status && ! get_option( $this->get_notice_shown_option() ) ) {
			AdminNotice::render(
				array(
					'type'        => 'success',
					'dismissible' => true,
					'message'     => esc_html( $this->get_success_message() ),
				)
			);
			update_option( $this->get_notice_shown_option(), 1 );
			return;
		}

		if ( 'failed' === $status ) {
			$error     = get_option( $this->get_error_option(), __( 'Unknown error.', 'multivendorx' ) );
			$retry_url = wp_nonce_url(
				admin_url( 'admin-post.php?action=' . $this->get_retry_action() ),
				$this->get_retry_action()
			);

			AdminNotice::render(
				array(
					'type'    => 'error',
					'title'   => sprintf(
						/* translators: %s: companion plugin name, e.g. VuloMail. */
						__( 'MultiVendorX couldn\'t set up %s', 'multivendorx' ),
						$this->get_plugin_name()
					),
					'message' => esc_html( $error ),
					'actions' => array(
						array(
							'label' => __( 'Retry', 'multivendorx' ),
							'url'   => $retry_url,
						),
					),
				)
			);
		}
	}

	/**
	 * Handle the failure notice's Retry link: flag the install pending again, so the
	 * next wp-admin page load picks it up.
	 *
	 * @return void
	 */
	public function handle_retry_request() {
		if ( ! current_user_can( 'install_plugins' ) || ! check_admin_referer( $this->get_retry_action() ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'multivendorx' ) );
		}

		update_option( $this->get_status_option(), 'pending' );
		delete_option( $this->get_error_option() );

		wp_safe_redirect( admin_url() );
		exit;
	}
}
