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
        $from_number = $from_number[1] . $from_number[0];
        $to = $to[1] . $to[0];
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
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":response: : " . var_export($response, true) . "\n", FILE_APPEND);
        $body     = json_decode( wp_remote_retrieve_body( $response ) );
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":body: : " . var_export($body, true) . "\n", FILE_APPEND);
        if ( 202 !== $response['response']['code'] ) {
            return new WP_Error( $body->code, $body->message );
        }

        return true;
    }
}
