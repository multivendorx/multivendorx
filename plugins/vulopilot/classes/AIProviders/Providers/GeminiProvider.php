<?php
/**
 * GeminiProvider class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Providers;

use VuloPilotCore\Contracts\AI\AIProviderInterface;
use VuloPilotCore\Exceptions\ProviderRequestException;
use VuloPilotCore\Exceptions\TransientProviderException;
use VuloPilotCore\ValueObjects\AIRequest;
use VuloPilotCore\ValueObjects\AIResponse;
use VuloPilot\AIProviders\Support\StreamingHttpClient;

defined( 'ABSPATH' ) || exit;

/**
 * Google's Generative Language API — another genuinely different shape:
 * the API key is a `?key=` query parameter (not a header), messages are
 * called `contents` with `parts: [{text}]` instead of a plain string, the
 * assistant role is called 'model' not 'assistant', and a system message
 * goes in a separate top-level `systemInstruction` field (same idea as
 * Anthropic's `system`, different field name/shape). Streaming uses
 * `alt=sse` on the `:streamGenerateContent` endpoint, which — unlike
 * Gemini's default streaming response (a single streamed JSON array) —
 * frames each partial candidate as a `data: {...}` SSE line, letting this
 * adapter reuse the same line-by-line parsing shape as the OpenAI/
 * Anthropic adapters instead of needing a JSON-array streaming parser.
 *
 * @class       GeminiProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeminiProvider implements AIProviderInterface {

    private const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

    private string $api_key;

    /**
     * @param string $api_key Decrypted API key.
     */
    public function __construct( string $api_key ) {
        $this->api_key = $api_key;
    }

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gemini';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Google Gemini', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function supports_streaming(): bool {
        return true;
    }

    /**
     * @inheritDoc
     */
    public function get_available_models(): array {
        return array( 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash' );
    }

    /**
     * @inheritDoc
     */
    public function send( AIRequest $request ): AIResponse {
        $url = sprintf( '%s/%s:generateContent?key=%s', self::BASE_URL, $request->get_model(), rawurlencode( $this->api_key ) );

        $response = wp_remote_post(
            $url,
            array(
                'timeout' => 30,
                'headers' => array( 'Content-Type' => 'application/json' ),
                'body'    => wp_json_encode( $this->build_body( $request ) ),
            )
        );

        $body      = $this->handle_http_response( $response );
        $candidate = $body['candidates'][0] ?? array();
        $text      = implode( '', array_column( $candidate['content']['parts'] ?? array(), 'text' ) );

        return new AIResponse(
            $text,
            $this->get_id(),
            $request->get_model(),
            (int) ( $body['usageMetadata']['promptTokenCount'] ?? 0 ),
            (int) ( $body['usageMetadata']['candidatesTokenCount'] ?? 0 ),
            strtolower( $candidate['finishReason'] ?? 'stop' )
        );
    }

    /**
     * @inheritDoc
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse {
        $url = sprintf(
            '%s/%s:streamGenerateContent?alt=sse&key=%s',
            self::BASE_URL,
            $request->get_model(),
            rawurlencode( $this->api_key )
        );

        $content           = '';
        $finish_reason     = 'stop';
        $prompt_tokens     = 0;
        $completion_tokens = 0;

        StreamingHttpClient::stream_post(
            $url,
            array( 'Content-Type' => 'application/json' ),
            wp_json_encode( $this->build_body( $request ) ),
            function ( string $line ) use ( &$content, &$finish_reason, &$prompt_tokens, &$completion_tokens, $on_chunk ) {
                if ( ! str_starts_with( $line, 'data:' ) ) {
                    return;
                }

                $event = json_decode( trim( substr( $line, 5 ) ), true );

                if ( ! is_array( $event ) ) {
                    return;
                }

                $candidate = $event['candidates'][0] ?? array();
                $delta     = implode( '', array_column( $candidate['content']['parts'] ?? array(), 'text' ) );

                if ( '' !== $delta ) {
                    $content .= $delta;
                    $on_chunk( $delta );
                }

                if ( ! empty( $candidate['finishReason'] ) ) {
                    $finish_reason = strtolower( $candidate['finishReason'] );
                }

                if ( isset( $event['usageMetadata'] ) ) {
                    $prompt_tokens     = (int) ( $event['usageMetadata']['promptTokenCount'] ?? 0 );
                    $completion_tokens = (int) ( $event['usageMetadata']['candidatesTokenCount'] ?? 0 );
                }
            }
        );

        return new AIResponse( $content, $this->get_id(), $request->get_model(), $prompt_tokens, $completion_tokens, $finish_reason );
    }

    /**
     * @param AIRequest $request Request to translate.
     * @return array<string, mixed>
     */
    private function build_body( AIRequest $request ): array {
        $system   = null;
        $contents = array();

        foreach ( $request->get_messages() as $message ) {
            if ( 'system' === $message['role'] ) {
                $system = $message['content'];
                continue;
            }

            $contents[] = array(
                'role'  => 'assistant' === $message['role'] ? 'model' : 'user',
                'parts' => array( array( 'text' => $message['content'] ) ),
            );
        }

        $body = array( 'contents' => $contents );

        if ( null !== $system ) {
            $body['systemInstruction'] = array( 'parts' => array( array( 'text' => $system ) ) );
        }

        $generation_config = array();

        if ( null !== $request->get_temperature() ) {
            $generation_config['temperature'] = $request->get_temperature();
        }

        if ( null !== $request->get_max_tokens() ) {
            $generation_config['maxOutputTokens'] = $request->get_max_tokens();
        }

        if ( $generation_config ) {
            $body['generationConfig'] = $generation_config;
        }

        return $body;
    }

    /**
     * @param mixed $response wp_remote_post()'s return value.
     * @return array<string, mixed>
     *
     * @throws TransientProviderException Network failure, 5xx, or 429.
     * @throws ProviderRequestException   Any other 4xx.
     */
    private function handle_http_response( $response ): array {
        if ( is_wp_error( $response ) ) {
            throw new TransientProviderException( $response->get_error_message() );
        }

        $status = wp_remote_retrieve_response_code( $response );
        $body   = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $status >= 500 || 429 === $status ) {
            throw new TransientProviderException( sprintf( 'Gemini returned HTTP %d', $status ) );
        }

        if ( $status >= 400 ) {
            throw new ProviderRequestException( $body['error']['message'] ?? sprintf( 'Gemini returned HTTP %d', $status ) );
        }

        return is_array( $body ) ? $body : array();
    }
}
