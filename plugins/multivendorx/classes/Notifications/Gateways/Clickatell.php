<?php

namespace MultiVendorX\Notifications\Gateways;

use WP_Error;

/**
 * Clickatell Class
 *
 * @see https://www.clickatell.com/developers/api-documentation/rest-api-send-message/
 */
class Clickatell {

    /**
     * API Endpoint
     */
    const ENDPOINT = 'https://platform.clickatell.com/messages';

    /**
     * Get the name
     *
     * @return string
     */
    public function name() {
        return __( 'Clickatell', 'multivendorx' );
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
        $to = $to[1] . $to[0];
        $api_key = MultiVendorX()->setting->get_setting( 'clickatell_api_key' );

        $args = array(
            'headers' => array(
                'Authorization' => $api_key,
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ),
            'body'    => wp_json_encode(
                array(
                    'to'      => array( $to ),
                    'content' => $message,
                )
            ),
        );

        $response = wp_remote_post( self::ENDPOINT, $args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $body          = wp_remote_retrieve_body( $response );
        $response_code = wp_remote_retrieve_response_code( $response );

        // phpcs:disable
        if ( 202 !== $response_code ) {
            switch ( $response_code ) {
                case 200:
                    $body = json_decode( $body );

                    return new WP_Error(
                        $body->errorCode,
                        $body->errorDescription
                    );

                case 400:
                    return new WP_Error(
                        400,
                        'Bad Request'
                    );

                default:
                    return new WP_Error(
                        $response_code,
                        'Bad Request'
                    );
            }
        }
        // phpcs:enable

        return true;
    }
}
