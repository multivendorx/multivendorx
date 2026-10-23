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
 * Installs the companion VuloMail plugin once Install.php flags a site as
 * eligible, and -- on a site upgrading from before 5.0.21 with prior admin
 * email/SMS settings configured -- migrates those settings into it. A brand
 * new install has nothing to migrate, so it only gets the plugin installed;
 * REASON_OPTION ('install' vs 'migrate') is what render_admin_notice() uses
 * to show the right wording for each case.
 *
 * After that, Notifications::trigger_notifications() routes SMS through
 * VuloMail instead of the built-in SMS gateways, falling back to the
 * original path if VuloMail isn't ready for it yet.
 *
 * @class       Module class
 * @version     5.0.21
 * @author      MultiVendorX
 */
class VuloMailMigration {

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
	 * Option storing why this run is happening: 'install' (a brand new site, nothing to
	 * migrate) or 'migrate' (an existing site upgrading from before 5.0.21 with prior
	 * email/SMS settings configured). Controls which success notice text is shown.
	 *
	 * @var string
	 */
	const REASON_OPTION = 'multivendorx_vulomail_migration_reason';

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
		add_action( 'admin_menu', array( $this, 'maybe_run_pending_migration' ), 1 );
		add_action( 'admin_notices', array( $this, 'render_admin_notice' ) );
		add_action( 'admin_post_multivendorx_retry_vulomail_migration', array( $this, 'handle_retry_request' ) );
	}

	/**
	 * Install/activate VuloMail and migrate settings into it, if eligible.
	 *
	 * Runs on early admin_menu rather than admin_init: installing a plugin
	 * needs admin-only includes/capabilities not reliably available during
	 * the version-bump migration, and admin_menu fires before admin_init,
	 * so VuloMail's own menu callback can still register in the same request.
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

		$events_delivery_settings = get_option( Utill::MULTIVENDORX_SETTINGS['events-delivery'], array() );
		$migrated     = $this->migrate_settings_to_vulomail( $events_delivery_settings );

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
		 * @param array $events_delivery_settings The events-delivery settings that were migrated.
		 */
		do_action( 'multivendorx_after_vulomail_migration', $events_delivery_settings );
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

		$this->ensure_vulomail_booted();

		return true;
	}

	/**
	 * Finish booting VuloMail in the current request if it was just activated.
	 *
	 * activate_plugin() only includes the main file, not plugins_loaded/init —
	 * without this, VuloMail's admin menu wouldn't appear until the next page
	 * load. No-ops if VuloMail was already active before this request.
	 *
	 * @return void
	 */
	private function ensure_vulomail_booted() {
		if ( ! function_exists( 'VuloMail' ) || did_action( 'vulomail_loaded' ) ) {
			return;
		}

		$vulomail = VuloMail();
		$vulomail->init_plugin();
		$vulomail->init_classes();
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
			// WP_Upgrader_Skin has no get_error_messages(); check its $result property instead.
			$skin_result = $upgrader_skin->result;
			$message     = ( $skin_result instanceof \WP_Error && $skin_result->has_errors() )
				? implode( ' ', $skin_result->get_error_messages() )
				: __( 'VuloMail could not be downloaded or installed.', 'multivendorx' );

			return new \WP_Error( 'vulomail_install_failed', $message );
		}

		return true;
	}

	/**
	 * Migrate events-delivery settings into VuloMail's own settings/connections.
	 *
	 * `receiver_email_address` has no VuloMail equivalent and stays in
	 * MultiVendorX's settings — VuloMail only owns delivery/transport.
	 *
	 * @param array $events_delivery_settings The multivendorx_events_delivery_settings option value.
	 * @return true|\WP_Error
	 */
	private function migrate_settings_to_vulomail( array $events_delivery_settings ) {
		if ( ! function_exists( 'VuloMail' ) ) {
			return new \WP_Error( 'vulomail_unavailable', __( 'VuloMail did not load after activation.', 'multivendorx' ) );
		}

		$vulomail = VuloMail();

		$receiver_phone = $this->read_composite_phone_field( $events_delivery_settings, 'sms_receiver_phone_number' );

		$settings_update = array();

		if ( '' !== $receiver_phone['number'] ) {
			$settings_update['sms_admin_phone'] = $receiver_phone['number'];
		}

		if ( '' !== $receiver_phone['country_code'] ) {
			$settings_update['sms_country_code'] = $receiver_phone['country_code'];
		}

		if ( ! empty( $events_delivery_settings['sender_email_address'] ) ) {
			$settings_update['from_email'] = $events_delivery_settings['sender_email_address'];
		}

		if ( ! empty( $events_delivery_settings['sender_name'] ) ) {
			$settings_update['from_name'] = $events_delivery_settings['sender_name'];
		}

		if ( $settings_update ) {
			$vulomail->settings->update( $settings_update );
		}

		return $this->migrate_sms_gateway_connection( $vulomail, $events_delivery_settings );
	}

	/**
	 * Read a "phone number + country code" field as Zyra's settings form stores it:
	 * nested under the field's own key (e.g. `sms_receiver_phone_number.sms_receiver_phone_number`).
	 *
	 * @param array  $events_delivery_settings The multivendorx_events_delivery_settings option value.
	 * @param string $field_key    The composite field's key, e.g. 'sms_receiver_phone_number'.
	 * @return array{country_code: string, number: string}
	 */
	private function read_composite_phone_field( array $events_delivery_settings, $field_key ) {
		$field = $events_delivery_settings[ $field_key ] ?? null;

		if ( ! is_array( $field ) ) {
			return array(
				'country_code' => '',
				'number'       => '',
			);
		}

		return array(
			'country_code' => (string) ( $field['country_code'] ?? '' ),
			'number'       => (string) ( $field[ $field_key ] ?? '' ),
		);
	}

	/**
	 * Migrate the active SMS gateway's credentials into a VuloMail connection,
	 * so secret fields are encrypted by VuloMail itself rather than by us.
	 *
	 * @param object $vulomail     The VuloMail() plugin instance.
	 * @param array  $events_delivery_settings The multivendorx_events_delivery_settings option value.
	 * @return true|\WP_Error
	 */
	private function migrate_sms_gateway_connection( $vulomail, array $events_delivery_settings ) {
		$gateway = $events_delivery_settings['sms_gateway_selector'] ?? '';

		if ( empty( $gateway ) || 'none' === $gateway ) {
			return true;
		}

		$sender_phone = $this->read_composite_phone_field( $events_delivery_settings, 'sms_sender_phone_number' );
		$sender       = trim( $sender_phone['country_code'] . $sender_phone['number'] );

		$credentials_by_gateway = array(
			'twilio'     => array(
				'account_sid' => $events_delivery_settings['twilio_account_sid'] ?? '',
				'auth_token'  => $events_delivery_settings['twilio_auth_token'] ?? '',
				'from'        => $sender,
			),
			'vonage'     => array(
				'api_key'    => $events_delivery_settings['vonage_api_key'] ?? '',
				'api_secret' => $events_delivery_settings['vonage_api_secret'] ?? '',
				'from'       => $sender,
			),
			'plivo'      => array(
				'auth_id'    => $events_delivery_settings['plivo_auth_id'] ?? '',
				'auth_token' => $events_delivery_settings['plivo_auth_token'] ?? '',
				'from'       => $sender,
			),
			'clickatell' => array(
				'api_key' => $events_delivery_settings['clickatell_api_key'] ?? '',
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

		// Saving a connection doesn't make it active — must also set sms_primary.
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
			$message = 'install' === get_option( self::REASON_OPTION )
				? __( 'MultiVendorX has installed VuloMail, the companion plugin used to deliver marketplace email and SMS notifications. Set up an SMS gateway and/or email connection inside VuloMail to start sending.', 'multivendorx' )
				: __( 'MultiVendorX has installed VuloMail and migrated your admin notification settings to it. SMS notifications now deliver through VuloMail; email notifications will too once you add an email connection inside VuloMail (MultiVendorX never had its own SMTP credentials to migrate).', 'multivendorx' );

			printf(
				'<div class="notice notice-success is-dismissible"><p>%s</p></div>',
				esc_html( $message )
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
