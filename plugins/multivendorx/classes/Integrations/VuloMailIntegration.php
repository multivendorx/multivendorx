<?php
/**
 * VuloMail integration class.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Installs, activates, and migrates MultiVendorX's built-in admin email/SMS
 * recipient settings into the companion VuloMail plugin (wordpress.org slug
 * `vulomail`) the first time an admin with install_plugins capability visits
 * wp-admin after the version-gated migration in Install.php flags a site as
 * eligible (i.e. the site already had an admin notification email or SMS
 * recipient configured before updating).
 *
 * Once VuloMail is active and ready, Notifications::trigger_notifications()
 * routes email/SMS through VuloMail's public `vulomail_send_email()` /
 * `vulomail_send_sms()` functions instead of wp_mail()/the built-in SMS
 * gateway classes, falling back to the original path if VuloMail isn't
 * ready (e.g. install failed, or the admin hasn't finished configuring a
 * provider inside VuloMail yet).
 *
 * @class       Module class
 * @version     5.0.21
 * @author      MultiVendorX
 */
class VuloMailIntegration {

	/**
	 * Option storing the current migration status: 'pending', 'done', or 'failed'.
	 *
	 * @var string
	 */
	const STATUS_OPTION = 'multivendorx_vulomail_migration_status';

	/**
	 * Option storing the last migration error message, when status is 'failed'.
	 *
	 * @var string
	 */
	const ERROR_OPTION = 'multivendorx_vulomail_migration_error';

	/**
	 * Option flagging that the one-time success notice has already been shown.
	 *
	 * @var string
	 */
	const NOTICE_SHOWN_OPTION = 'multivendorx_vulomail_migration_notice_shown';

	/**
	 * VuloMail's wordpress.org plugin slug.
	 *
	 * @var string
	 */
	const PLUGIN_SLUG = 'vulomail';

	/**
	 * VuloMail's main plugin file, relative to the plugins directory.
	 *
	 * @var string
	 */
	const PLUGIN_FILE = 'vulomail/vulomail.php';

	/**
	 * Constructor.
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'admin_init', array( $this, 'maybe_run_pending_migration' ) );
		add_action( 'admin_notices', array( $this, 'render_admin_notice' ) );
		add_action( 'admin_post_multivendorx_retry_vulomail_migration', array( $this, 'handle_retry_request' ) );
	}

	/**
	 * Install/activate VuloMail and migrate settings into it, if Install.php's
	 * do_migration() flagged this site as eligible and nobody has done it yet.
	 *
	 * Runs on admin_init (rather than inline during the version-bump migration
	 * in Install.php) because installing a plugin needs admin-only includes,
	 * WP_Filesystem, and an install_plugins-capable user — none of which are
	 * reliably available on the arbitrary request (including a front-end one)
	 * that happens to trigger the version bump.
	 *
	 * @return void
	 */
	public function maybe_run_pending_migration() {
		if ( 'pending' !== get_option( self::STATUS_OPTION ) ) {
			return;
		}

		if ( ! current_user_can( 'install_plugins' ) || ! current_user_can( 'activate_plugins' ) ) {
			return;
		}

		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$installed = $this->install_and_activate_vulomail();

		if ( is_wp_error( $installed ) ) {
			$this->mark_failed( $installed );
			return;
		}

		$mvx_settings = get_option( Utill::MULTIVENDORX_SETTINGS['events-delivery'], array() );
		$migrated     = $this->migrate_settings_to_vulomail( $mvx_settings );

		if ( is_wp_error( $migrated ) ) {
			$this->mark_failed( $migrated );
			return;
		}

		update_option( self::STATUS_OPTION, 'done' );
		delete_option( self::ERROR_OPTION );

		/**
		 * Fires after MultiVendorX's settings have been migrated into VuloMail.
		 *
		 * @since 5.0.21
		 *
		 * @param array $mvx_settings The events-delivery settings that were migrated.
		 */
		do_action( 'multivendorx_after_vulomail_migration', $mvx_settings );
	}

	/**
	 * Record a failed install/migration attempt.
	 *
	 * @param \WP_Error $error The error to record and log.
	 * @return void
	 */
	private function mark_failed( $error ) {
		update_option( self::STATUS_OPTION, 'failed' );
		update_option( self::ERROR_OPTION, $error->get_error_message() );
		MultiVendorX()->util->log( $error );
	}

	/**
	 * Install VuloMail from wordpress.org (if not already present) and activate it.
	 *
	 * @return true|\WP_Error
	 */
	private function install_and_activate_vulomail() {
		if ( is_plugin_active( self::PLUGIN_FILE ) ) {
			return true;
		}

		if ( ! file_exists( WP_PLUGIN_DIR . '/' . self::PLUGIN_FILE ) ) {
			$install_result = $this->download_and_install_vulomail();

			if ( is_wp_error( $install_result ) ) {
				return $install_result;
			}
		}

		$activated = activate_plugin( self::PLUGIN_FILE );

		if ( is_wp_error( $activated ) ) {
			return $activated;
		}

		return true;
	}

	/**
	 * Download and install VuloMail from the wordpress.org plugin directory.
	 *
	 * @return true|\WP_Error
	 */
	private function download_and_install_vulomail() {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/misc.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$plugin_information = plugins_api(
			'plugin_information',
			array(
				'slug'   => self::PLUGIN_SLUG,
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
			// WP_Upgrader_Skin has no get_error_messages() method; the result (string|bool|WP_Error)
			// lands in its public $result property instead.
			$skin_result = $upgrader_skin->result;
			$message     = ( $skin_result instanceof \WP_Error && $skin_result->has_errors() )
				? implode( ' ', $skin_result->get_error_messages() )
				: __( 'VuloMail could not be downloaded or installed.', 'multivendorx' );

			return new \WP_Error( 'vulomail_install_failed', $message );
		}

		return true;
	}

	/**
	 * Migrate MultiVendorX's events-delivery settings into VuloMail's own
	 * settings/connections storage via VuloMail's public service accessors.
	 *
	 * `receiver_email_address` (the "to" address for marketplace notification
	 * emails) has no VuloMail equivalent and is intentionally left in
	 * MultiVendorX's own settings — VuloMail only owns delivery/transport
	 * (sender identity, SMS admin alert phone, provider connections), not
	 * MultiVendorX's own notion of which address should receive which
	 * marketplace event.
	 *
	 * @param array $mvx_settings The multivendorx_events_delivery_settings option value.
	 * @return true|\WP_Error
	 */
	private function migrate_settings_to_vulomail( array $mvx_settings ) {
		if ( ! function_exists( 'VuloMail' ) ) {
			return new \WP_Error( 'vulomail_unavailable', __( 'VuloMail did not load after activation.', 'multivendorx' ) );
		}

		$vulomail = VuloMail();

		$settings_update = array();

		if ( ! empty( $mvx_settings['sms_receiver_phone_number'] ) ) {
			$settings_update['sms_admin_phone'] = $mvx_settings['sms_receiver_phone_number'];
		}

		if ( ! empty( $mvx_settings['country_code'] ) ) {
			$settings_update['sms_country_code'] = $mvx_settings['country_code'];
		}

		if ( ! empty( $mvx_settings['sender_email_address'] ) ) {
			$settings_update['from_email'] = $mvx_settings['sender_email_address'];
		}

		if ( ! empty( $mvx_settings['sender_name'] ) ) {
			$settings_update['from_name'] = $mvx_settings['sender_name'];
		}

		if ( $settings_update ) {
			$vulomail->settings->update( $settings_update );
		}

		return $this->migrate_sms_gateway_connection( $vulomail, $mvx_settings );
	}

	/**
	 * Migrate the active MultiVendorX SMS gateway's credentials into a VuloMail
	 * SMS connection, using VuloMail's own ConnectionRepository::save() so
	 * secret fields are encrypted by VuloMail itself rather than by us.
	 *
	 * @param object $vulomail     The VuloMail() plugin instance.
	 * @param array  $mvx_settings The multivendorx_events_delivery_settings option value.
	 * @return true|\WP_Error
	 */
	private function migrate_sms_gateway_connection( $vulomail, array $mvx_settings ) {
		$gateway = $mvx_settings['sms_gateway_selector'] ?? '';

		if ( empty( $gateway ) || 'none' === $gateway ) {
			return true;
		}

		$sender = trim( ( $mvx_settings['country_code'] ?? '' ) . ( $mvx_settings['sms_sender_phone_number'] ?? '' ) );

		$credentials_by_gateway = array(
			'twilio'     => array(
				'account_sid' => $mvx_settings['twilio_account_sid'] ?? '',
				'auth_token'  => $mvx_settings['twilio_auth_token'] ?? '',
				'from'        => $sender,
			),
			'vonage'     => array(
				'api_key'    => $mvx_settings['vonage_api_key'] ?? '',
				'api_secret' => $mvx_settings['vonage_api_secret'] ?? '',
				'from'       => $sender,
			),
			'plivo'      => array(
				'auth_id'    => $mvx_settings['plivo_auth_id'] ?? '',
				'auth_token' => $mvx_settings['plivo_auth_token'] ?? '',
				'from'       => $sender,
			),
			'clickatell' => array(
				'api_key' => $mvx_settings['clickatell_api_key'] ?? '',
				'from'    => $sender,
			),
		);

		if ( ! isset( $credentials_by_gateway[ $gateway ] ) ) {
			return true;
		}

		$connection_settings = array_filter(
			$credentials_by_gateway[ $gateway ],
			static function ( $value ) {
				return '' !== $value;
			}
		);

		if ( empty( $connection_settings ) ) {
			return true;
		}

		$saved = $vulomail->connections->save(
			array(
				'channel'  => 'sms',
				'provider' => $gateway,
				'label'    => __( 'Migrated from MultiVendorX', 'multivendorx' ),
				'enabled'  => true,
				'settings' => $connection_settings,
			)
		);

		if ( is_wp_error( $saved ) ) {
			return $saved;
		}

		// Saving a connection doesn't make it VuloMail's active one — Dispatcher::is_ready()
		// only resolves a connection through the `sms_primary` setting, so without this the
		// connection would exist but never actually be used to send anything.
		$vulomail->settings->update( array( 'sms_primary' => $saved['id'] ) );

		return true;
	}

	/**
	 * Render a one-time success notice, or a persistent failure notice with a
	 * manual retry link, in wp-admin.
	 *
	 * @return void
	 */
	public function render_admin_notice() {
		if ( ! current_user_can( 'install_plugins' ) ) {
			return;
		}

		$status = get_option( self::STATUS_OPTION );

		if ( 'done' === $status && ! get_option( self::NOTICE_SHOWN_OPTION ) ) {
			printf(
				'<div class="notice notice-success is-dismissible"><p>%s</p></div>',
				esc_html__( 'MultiVendorX has installed VuloMail and migrated your admin notification settings to it. SMS notifications now deliver through VuloMail; email notifications will too once you add an email connection inside VuloMail (MultiVendorX never had its own SMTP credentials to migrate).', 'multivendorx' )
			);
			update_option( self::NOTICE_SHOWN_OPTION, 1 );
			return;
		}

		if ( 'failed' === $status ) {
			$message   = get_option( self::ERROR_OPTION, __( 'Unknown error.', 'multivendorx' ) );
			$retry_url = wp_nonce_url(
				admin_url( 'admin-post.php?action=multivendorx_retry_vulomail_migration' ),
				'multivendorx_retry_vulomail_migration'
			);

			printf(
				'<div class="notice notice-error"><p>%s</p><p><a href="%s" class="button">%s</a></p></div>',
				esc_html(
					sprintf(
						/* translators: %s: error message. */
						__( 'MultiVendorX could not automatically install/configure VuloMail: %s', 'multivendorx' ),
						$message
					)
				),
				esc_url( $retry_url ),
				esc_html__( 'Retry', 'multivendorx' )
			);
		}
	}

	/**
	 * Handle the "Retry" link on the failure notice by re-flagging the
	 * migration as pending; the next admin_init picks it up again.
	 *
	 * @return void
	 */
	public function handle_retry_request() {
		if ( ! current_user_can( 'install_plugins' ) || ! check_admin_referer( 'multivendorx_retry_vulomail_migration' ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'multivendorx' ) );
		}

		update_option( self::STATUS_OPTION, 'pending' );
		delete_option( self::ERROR_OPTION );

		wp_safe_redirect( admin_url() );
		exit;
	}
}
