<?php
/**
 * Vonage (Nexmo) SMS Gateway.
 *
 * Handles sending SMS messages via Vonage/Nexmo API.
 *
 * @package MultiVendorX
 * @see https://developer.nexmo.com/api/sms
 */

namespace MultiVendorX\Notifications\Gateways;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Vonage SMS Gateway Class.
 */
class Vonage {

    /**
     * API Endpoint.
     */
    const ENDPOINT = 'https://rest.nexmo.com';

    /**
     * Get the gateway name.
     *
     * @return string Gateway name.
     */
    public function name() {
        return __( 'Vonage (nexmo)', 'multivendorx' );
    }

    /**
     * Send SMS via Vonage/Nexmo.
     *
     * @param string $to      Recipient phone number in international format.
     * @param string $message SMS message content.
     *
     * @return true|WP_Error True on success, WP_Error on failure.
     */
    public function send( $to, $message ) {
        $api_key     = MultiVendorX()->setting->get_setting( 'vonage_api_key' );
        $api_secret  = MultiVendorX()->setting->get_setting( 'vonage_api_secret' );
        $from_number = MultiVendorX()->setting->get_setting( 'sms_sender_phone_number' );
        $from_number = $from_number['country_code'] . $from_number['sms_sender_phone_number'];

        $args = array(
            'body' => array(
                'from'       => $from_number,
                'text'       => $message,
                'to'         => $to,
                'api_key'    => $api_key,
                'api_secret' => $api_secret,
            ),
        );

        $request = wp_remote_post( self::ENDPOINT . '/sms/json', $args );

        if ( is_wp_error( $request ) ) {
            return $request;
        }

        $body = json_decode( wp_remote_retrieve_body( $request ) );

        // Validate response structure.
        if ( empty( $body->messages ) || ! isset( $body->messages[0]->status ) ) {
            return new WP_Error(
                'invalid_response',
                __( 'Invalid API response from Vonage.', 'multivendorx' )
            );
        }

		if ( '0' !== $body->messages[0]->status ) {
            return new WP_Error(
                $body->messages[0]->status ?? 'unknown',
                $body->messages[0]->{'error-text'} ?? __( 'Unknown error', 'multivendorx' )
			);
        }

        return true;
    }
}
