<?php
/**
 * Plivo SMS Gateway.
 *
 * Handles sending SMS messages via Plivo API.
 *
 * @package MultiVendorX
 * @see https://www.plivo.com/docs/sms/api/message#send-a-message
 */

namespace MultiVendorX\Notifications\Gateways;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Plivo SMS Gateway Class.
 */
class Plivo {

    /**
     * API Endpoint.
     */
    const ENDPOINT = 'https://api.plivo.com/v1/Account/{auth_id}/Message/';

    /**
     * Get the gateway name.
     *
     * @return string Gateway name.
     */
    public function name() {
        return __( 'Plivo', 'multivendorx' );
    }

    /**
     * Send SMS via Plivo.
     *
     * @param string $to      Recipient phone number in international format.
     * @param string $message SMS message content.
     *
     * @return true|WP_Error True on success, WP_Error on failure.
     */
    public function send( $to, $message ) {
        $auth_id     = MultiVendorX()->setting->get_setting( 'plivo_auth_id' );
        $auth_token  = MultiVendorX()->setting->get_setting( 'plivo_auth_token' );
        $from_number = MultiVendorX()->setting->get_setting( 'sms_sender_phone_number' );
        $from_number = $from_number['country_code'] . $from_number['sms_sender_phone_number'];

        $args = array(
            'headers' => array(
                'Authorization' => 'Basic ' . base64_encode( $auth_id . ':' . $auth_token ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
            ),
            'body'    => array(
                'src'  => $from_number,
                'dst'  => $to,
                'text' => $message,
            ),
        );

        $endpoint = str_replace( '{auth_id}', $auth_id, self::ENDPOINT );
        $response = wp_remote_post( $endpoint, $args );
        $body     = json_decode( wp_remote_retrieve_body( $response ) );

        if ( 202 !== $response['response']['code'] ) {
            return new WP_Error( $body->code, $body->message );
        }

        return true;
    }
}
