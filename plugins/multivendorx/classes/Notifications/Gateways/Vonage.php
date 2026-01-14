<?php

namespace MultiVendorX\Notifications\Gateways;

use WP_Error;

/**
 * Nexmo Class
 *
 * @see https://developer.nexmo.com/api/sms
 */
class Vonage {

    /**
     * API Endpoint
     */
    const ENDPOINT = 'https://rest.nexmo.com';

    /**
     * Get the name
     *
     * @return string
     */
    public function name() {
        return __( 'Vonage (nexmo)', 'multivendorx' );
    }

    /**
     * Send SMS
     *
     * @param string $to
     * @param string $message
     *
     * @return WP_Error|bool
     */
    public function send( $to, $message ) {
        $api_key     = MultiVendorX()->setting->get_setting( 'vonage_api_key' );
        $api_secret  = MultiVendorX()->setting->get_setting( 'vonage_api_secret' );
        $from_number = MultiVendorX()->setting->get_setting( 'sms_sender_phone_number' );

        $args = array(
            'body' => array(
                'from'       => $from_number,
                'text'       => $message,
                'to'         => $to,
                'api_key'    => $api_key,
                'api_secret' => $api_secret,
            ),
        );

        $request       = wp_remote_post( self::ENDPOINT . '/sms/json', $args );
        $body          = json_decode( wp_remote_retrieve_body( $request ) );
        $response_code = wp_remote_retrieve_response_code( $request );

        if ( is_wp_error( $request ) ) {
            return $request;
        }

        if ( $body->messages[0]->status !== '0' ) {
            return new WP_Error(
                $body->messages[0]->status,
                $body->messages[0]->{'error-text'}
            );
        }

        return true;
    }
}
