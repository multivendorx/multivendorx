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
 * REASON_OPTION ('install' vs 'migrate') picks the success notice's wording.
 * Installing, activating and the notices are CompanionPlugin's.
 *
 * After that, Notifications::trigger_notifications() routes SMS through
 * VuloMail instead of the built-in SMS gateways, falling back to the
 * original path if VuloMail isn't ready for it yet.
 *
 * @class       VuloMailMigration class
 * @version     5.0.21
 * @author      MultiVendorX
 */
class VuloMailMigration extends CompanionPlugin {

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
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_plugin_slug() {
		return self::PLUGIN_SLUG;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_plugin_file() {
		return self::PLUGIN_FILE;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_plugin_name() {
		return 'VuloMail';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_status_option() {
		return 'multivendorx_vulomail_migration_status';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_error_option() {
		return 'multivendorx_vulomail_migration_error';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_notice_shown_option() {
		return 'multivendorx_vulomail_migration_notice_shown';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_retry_action() {
		return 'multivendorx_retry_vulomail_migration';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_success_message() {
		return 'install' === get_option( 'multivendorx_vulomail_migration_reason' )
			? __( 'MultiVendorX has installed VuloMail, the companion plugin used to deliver marketplace email and SMS notifications. Set up an SMS gateway and/or email connection inside VuloMail to start sending.', 'multivendorx' )
			: __( 'MultiVendorX has installed VuloMail and migrated your admin notification settings to it. SMS notifications now deliver through VuloMail; email notifications will too once you add an email connection inside VuloMail (MultiVendorX never had its own SMTP credentials to migrate).', 'multivendorx' );
	}

	/**
	 * Migrate MultiVendorX's events-delivery settings into the now-active VuloMail.
	 *
	 * @return true|\WP_Error
	 */
	protected function after_install() {
		$events_delivery_settings = get_option( Utill::MULTIVENDORX_SETTINGS['events-delivery'], array() );
		$migrated                 = $this->migrate_settings_to_vulomail( $events_delivery_settings );

		if ( is_wp_error( $migrated ) ) {
			return $migrated;
		}

		/**
		 * Fires after MultiVendorX's settings have been migrated into VuloMail.
		 *
		 * @since 5.0.21
		 *
		 * @param array $events_delivery_settings The events-delivery settings that were migrated.
		 */
		do_action( 'multivendorx_after_vulomail_migration', $events_delivery_settings );

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
}
