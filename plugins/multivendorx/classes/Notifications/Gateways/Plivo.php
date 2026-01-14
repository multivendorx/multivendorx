<?php

namespace MultiVendorX\Notifications\Gateways;

use WP_Error;

/**
 * Plivo Class
 *
 * @see https://www.plivo.com/docs/sms/api/message#send-a-message
 */
class Plivo {

    /**
     * API Endpoint
     */
    const ENDPOINT = 'https://api.plivo.com/v1/Account/{auth_id}/Message/';

    /**
     * Get the name
     *
     * @return string
     */
    public function name() {
        return __( 'Plivo', 'multivendorx' );
    }

    /**
     * Send SMS
     *
     * @param string $to
     * @param string $message
     *
     * @return WP_Error|true
     */
    public function send( $to, $message ) {
        $auth_id     = MultiVendorX()->setting->get_setting( 'plivo_auth_id' );
        $auth_token  = MultiVendorX()->setting->get_setting( 'plivo_auth_token' );
        $from_number = MultiVendorX()->setting->get_setting( 'sms_sender_phone_number' );

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
