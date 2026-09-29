<?php
namespace MultiVendorX\Intelligence;

defined( 'ABSPATH' ) || exit;

class Util {

    /**
     * Internal helper to handle all API requests and basic error checking.
     */
    private static function request( $url, $args ) {
        $response = wp_remote_post( $url, $args );
        if ( is_wp_error( $response ) ) {
            return $response;
        }
        return json_decode( wp_remote_retrieve_body( $response ), true );
    }

    /**
     * Internal helper to clean markdown and trim text.
     */
    private static function clean( $text ) {
        return trim( preg_replace( '/```json|```/', '', $text ) );
    }

    public static function call_gemini_api( $key, $prompt ) {
        $url  = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$key}";
        $body = array(
            'contents'         => array( array( 'parts' => array( array( 'text' => $prompt ) ) ) ),
            'generationConfig' => array(
				'temperature'    => 0.7,
				'candidateCount' => 1,
			),
        );

        $data = self::request(
            $url,
            array(
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $body ),
				'timeout' => 20,
            )
        );

        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        return $text ? self::clean( $text ) : $data;
    }

    public static function call_openai_api( $key, $prompt ) {
        $url  = 'https://api.openai.com/v1/responses';
        $body = array(
			'model' => 'gpt-5-nano',
			'input' => array(
				array(
					'role'    => 'user',
					'content' => array(
						array(
							'type' => 'input_text',
							'text' => $prompt,
						),
					),
				),
			),
		);

        $data = self::request(
            $url,
            array(
				'headers' => array(
					'Content-Type'  => 'application/json',
					'Authorization' => "Bearer $key",
				),
				'body'    => wp_json_encode( $body ),
				'timeout' => 30,
            )
        );

        if ( ! is_wp_error( $data ) && ! empty( $data['output'] ) ) {
            foreach ( $data['output'] as $item ) {
                foreach ( (array) ( $item['content'] ?? array() ) as $content ) {
                    if ( isset( $content['text'] ) ) {
						return self::clean( $content['text'] );
                    }
                }
            }
        }
        return $data;
    }

    public static function call_openrouter_api( $key, $prompt ) {
        $url   = 'https://openrouter.ai/api/v1/chat/completions';
        $model = MultiVendorX()->setting->get_setting( 'openrouter_api_model' ) ?: 'openai/gpt-4o-mini';
        $body  = array(
            'model'           => $model,
            'messages'        => array(
				array(
					'role'    => 'system',
					'content' => 'Return only valid JSON. No markdown. No explanations.',
				),
				array(
					'role'    => 'user',
					'content' => $prompt,
				),
			),
            'response_format' => array( 'type' => 'json_object' ),
        );

        $data = self::request(
            $url,
            array(
				'headers' => array(
					'Authorization' => "Bearer $key",
					'HTTP-Referer'  => site_url(),
					'X-Title'       => get_bloginfo( 'name' ),
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode( $body ),
				'timeout' => 30,
            )
        );
        $text = $data['choices'][0]['message']['content'] ?? '';
        return $text ? self::clean( $text ) : $data;
    }
}
