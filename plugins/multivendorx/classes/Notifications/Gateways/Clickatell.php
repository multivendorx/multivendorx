<?php
/**
 * Clickatell SMS Gateway.
 *
 * Handles sending SMS messages via Clickatell REST API.
 *
 * @package MultiVendorX
 * @see https://www.clickatell.com/developers/api-documentation/rest-api-send-message/
 */

namespace MultiVendorX\Notifications\Gateways;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Clickatell SMS Gateway Class.
 */
class Clickatell {

    /**
     * API Endpoint.
     */
    const ENDPOINT = 'https://platform.clickatell.com/messages';

    /**
     * Get the gateway name.
     *
     * @return string Gateway name.
     */
    public function name() {
        return __( 'Clickatell', 'multivendorx' );
    }

    /**
     * Send SMS via Clickatell.
     *
     * @param string $to      Recipient phone number in international format.
     * @param string $message SMS message content.
     *
     * @return true|WP_Error True on success, WP_Error on failure.
     */
    public function send( $to, $message ) {
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

        if ( 202 !== $response_code ) {
            switch ( $response_code ) {
                case 200:
                    $body = json_decode( $body );

                    return new WP_Error(
                        $body->errorCode ?? 0, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
                        $body->errorDescription ?? __( 'Unknown error', 'multivendorx' ) // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
                    );

                case 400:
                    return new WP_Error(
                        400,
                        __( 'Bad Request', 'multivendorx' )
                    );

                default:
                    return new WP_Error(
                        $response_code,
                        __( 'Bad Request', 'multivendorx' )
                    );
            }
        }

        return true;
    }
}
