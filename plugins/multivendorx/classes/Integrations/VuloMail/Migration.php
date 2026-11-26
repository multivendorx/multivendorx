<?php
/**
 * Migration class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations\VuloMail;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * One-time migration of a site's pre-5.0.21 admin email/SMS settings (`Utill::MULTIVENDORX_SETTINGS['events-delivery']`)
 * into VuloMail's own settings/connections, once VuloMail is active -- a brand new site has
 * nothing to migrate, `maybe_migrate()` is then a no-op (VuloMail is still installed regardless,
 * by the sibling `Integration`'s `PluginInstaller`). Version-gated from `Install.php`'s
 * `do_migration()`, same pattern as `Integrations\VuloForm\Migration`.
 */
class Migration {

    const MIGRATED_OPTION = 'multivendorx_vulomail_settings_migrated';

    /**
     * Run once per site (version-gated from `Install.php`'s `do_migration()`).
     *
     * @return void
     */
    public static function maybe_migrate() {
        if ( get_option( self::MIGRATED_OPTION ) ) {
            return;
        }

        if ( ! function_exists( 'VuloMail' ) ) {
            return;
        }

        // Only ever attempted once.
        update_option( self::MIGRATED_OPTION, time() );

        $events_delivery_settings = get_option( Utill::MULTIVENDORX_SETTINGS['events-delivery'], array() );
        $migrated                 = self::migrate_settings_to_vulomail( $events_delivery_settings );

        if ( is_wp_error( $migrated ) ) {
            Utill::log( $migrated );
            return;
        }

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
     * Migrate events-delivery settings into VuloMail's own settings/connections.
     *
     * `receiver_email_address` has no VuloMail equivalent and stays in MultiVendorX's settings --
     * VuloMail only owns delivery/transport.
     *
     * @param array $events_delivery_settings The multivendorx_events_delivery_settings option value.
     * @return true|\WP_Error
     */
    private static function migrate_settings_to_vulomail( array $events_delivery_settings ) {
        $vulomail = VuloMail();

        $receiver_phone = self::read_composite_phone_field( $events_delivery_settings, 'sms_receiver_phone_number' );

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

        return self::migrate_sms_gateway_connection( $vulomail, $events_delivery_settings );
    }

    /**
     * Read a "phone number + country code" field as Zyra's settings form stores it: nested under
     * the field's own key (e.g. `sms_receiver_phone_number.sms_receiver_phone_number`).
     *
     * @param array  $events_delivery_settings The multivendorx_events_delivery_settings option value.
     * @param string $field_key                The composite field's key, e.g. 'sms_receiver_phone_number'.
     * @return array{country_code: string, number: string}
     */
    private static function read_composite_phone_field( array $events_delivery_settings, $field_key ) {
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
     * Migrate the active SMS gateway's credentials into a VuloMail connection, so secret fields
     * are encrypted by VuloMail itself rather than by us.
     *
     * @param object $vulomail                 The VuloMail() plugin instance.
     * @param array  $events_delivery_settings The multivendorx_events_delivery_settings option value.
     * @return true|\WP_Error
     */
    private static function migrate_sms_gateway_connection( $vulomail, array $events_delivery_settings ) {
        $gateway = $events_delivery_settings['sms_gateway_selector'] ?? '';

        if ( empty( $gateway ) || 'none' === $gateway ) {
            return true;
        }

        $sender_phone = self::read_composite_phone_field( $events_delivery_settings, 'sms_sender_phone_number' );
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

        // Saving a connection doesn't make it active -- must also set sms_primary.
        $vulomail->settings->update( array( 'sms_primary' => $saved['id'] ) );

        return true;
    }
}
