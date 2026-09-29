<?php
/**
 * Twilio SMS Gateway.
 *
 * Handles sending SMS messages via Twilio API.
 *
 * @package MultiVendorX
 * @see https://www.twilio.com/docs/sms/api/message
 */

namespace MultiVendorX\Notifications\Gateways;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Twilio SMS Gateway Class.
 */
class Twilio {

    /**
     * API Endpoint.
     */
    const ENDPOINT = 'https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json';

    /**
     * Get the gateway name.
     *
     * @return string Gateway name.
     */
    public function name() {
        return __( 'Twilio', 'multivendorx' );
    }

    /**
     * Send SMS via Twilio.
     *
     * @param string $to      Recipient phone number in international format.
     * @param string $message SMS message content.
     *
     * @return true|WP_Error True on success, WP_Error on failure.
     */
    public function send( $to, $message ) {
        $account_sid = MultiVendorX()->setting->get_setting( 'twilio_account_sid' );
        $auth_token  = MultiVendorX()->setting->get_setting( 'twilio_auth_token' );
        $from_number = MultiVendorX()->setting->get_setting( 'sms_sender_phone_number' );
        $from_number = $from_number['country_code'] . $from_number['sms_sender_phone_number'];

        $args = array(
            'headers' => array(
                'Authorization' => 'Basic ' . base64_encode( $account_sid . ':' . $auth_token ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
            ),
            'body'    => array(
                'From' => $from_number,
                'To'   => $to,
                'Body' => $message,
            ),
        );

        $endpoint = str_replace( '{sid}', $account_sid, self::ENDPOINT );
        $response = wp_remote_post( $endpoint, $args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $body = json_decode( wp_remote_retrieve_body( $response ) );

        if ( 201 !== $response['response']['code'] ) {
            return new WP_Error( $body->code, $body->message );
        }

        return true;
    }
}
