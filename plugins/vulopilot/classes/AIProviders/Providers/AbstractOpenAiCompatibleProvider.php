<?php
/**
 * AbstractOpenAiCompatibleProvider class file.
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
 * Shared request/response mapping for the three providers here that
 * genuinely speak the same wire protocol — OpenAI's own API, and
 * OpenRouter/Groq, both of which are explicitly OpenAI-compatible proxies
 * (same `/chat/completions` shape, same Bearer auth, same SSE streaming
 * format). Only the base URL and a handful of extra headers differ
 * between them; duplicating this class three times over would be exactly
 * the kind of repetition naming-quality.md and the root CLAUDE.md's
 * "never duplicate code that already exists" rule warn against.
 *
 * Anthropic and Gemini get their own standalone adapters (AnthropicProvider,
 * GeminiProvider) because their request/response shapes are genuinely
 * different, not just re-hostable — forcing them into this same base
 * class would be the opposite mistake (a false abstraction).
 *
 * @class       AbstractOpenAiCompatibleProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractOpenAiCompatibleProvider implements AIProviderInterface {

    protected string $api_key;

    /**
     * @param string $api_key Decrypted API key (see CredentialEncryption — ProviderRegistry
     *                        decrypts once, right before constructing an adapter).
     */
    public function __construct( string $api_key ) {
        $this->api_key = $api_key;
    }

    /**
     * @return string Base URL up to and not including '/chat/completions'.
     */
    abstract protected function get_base_url(): string;

    /**
     * @return array<string, string> Any headers beyond Authorization/Content-Type.
     */
    protected function get_extra_headers(): array {
        return array();
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
    public function send( AIRequest $request ): AIResponse {
        $response = wp_remote_post(
            $this->get_base_url() . '/chat/completions',
            array(
                'timeout' => 30,
                'headers' => $this->build_headers(),
                'body'    => wp_json_encode( $this->build_body( $request, false ) ),
            )
        );

        return $this->parse_completion( $this->handle_http_response( $response ) );
    }

    /**
     * @inheritDoc
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse {
        $content           = '';
        $model             = $request->get_model();
        $finish_reason     = 'stop';
        $prompt_tokens     = 0;
        $completion_tokens = 0;

        StreamingHttpClient::stream_post(
            $this->get_base_url() . '/chat/completions',
            $this->build_headers(),
            wp_json_encode( $this->build_body( $request, true ) ),
            function ( string $line ) use ( &$content, &$model, &$finish_reason, &$prompt_tokens, &$completion_tokens, $on_chunk ) {
                if ( 0 !== strpos( $line, 'data:' ) ) {
                    return;
                }

                $payload = trim( substr( $line, 5 ) );

                if ( '[DONE]' === $payload ) {
                    return;
                }

                $event = json_decode( $payload, true );

                if ( ! is_array( $event ) ) {
                    return;
                }

                $model = $event['model'] ?? $model;
                $delta = $event['choices'][0]['delta']['content'] ?? '';

                if ( '' !== $delta ) {
                    $content .= $delta;
                    $on_chunk( $delta );
                }

                if ( isset( $event['choices'][0]['finish_reason'] ) && null !== $event['choices'][0]['finish_reason'] ) {
                    $finish_reason = $event['choices'][0]['finish_reason'];
                }

                if ( isset( $event['usage'] ) ) {
                    $prompt_tokens     = (int) ( $event['usage']['prompt_tokens'] ?? 0 );
                    $completion_tokens = (int) ( $event['usage']['completion_tokens'] ?? 0 );
                }
            }
        );

        return new AIResponse( $content, $this->get_id(), $model, $prompt_tokens, $completion_tokens, $finish_reason );
    }

    /**
     * @return array<string, string>
     */
    private function build_headers(): array {
        return array_merge(
            array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type'  => 'application/json',
            ),
            $this->get_extra_headers()
        );
    }

    /**
     * @param AIRequest $request  Request to translate.
     * @param bool      $stream   Whether this is for the streaming endpoint call.
     * @return array<string, mixed>
     */
    private function build_body( AIRequest $request, bool $stream ): array {
        $body = array(
            'model'    => $request->get_model(),
            'messages' => $request->get_messages(),
            'stream'   => $stream,
        );

        if ( null !== $request->get_temperature() ) {
            $body['temperature'] = $request->get_temperature();
        }

        if ( null !== $request->get_max_tokens() ) {
            $body['max_tokens'] = $request->get_max_tokens();
        }

        if ( $stream ) {
            // Ask for a final usage-bearing chunk — supported by OpenAI,
            // OpenRouter, and Groq's streaming APIs alike.
            $body['stream_options'] = array( 'include_usage' => true );
        }

        return $body;
    }

    /**
     * @param mixed $response wp_remote_post()'s return value.
     * @return array<string, mixed> Decoded JSON body.
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
            throw new TransientProviderException( sprintf( '%s returned HTTP %d', $this->get_id(), $status ) );
        }

        if ( $status >= 400 ) {
            throw new ProviderRequestException( $body['error']['message'] ?? sprintf( '%s returned HTTP %d', $this->get_id(), $status ) );
        }

        return is_array( $body ) ? $body : array();
    }

    /**
     * @param array<string, mixed> $body Decoded non-streaming response body.
     * @return AIResponse
     */
    private function parse_completion( array $body ): AIResponse {
        $choice = $body['choices'][0] ?? array();

        return new AIResponse(
            $choice['message']['content'] ?? '',
            $this->get_id(),
            $body['model'] ?? '',
            (int) ( $body['usage']['prompt_tokens'] ?? 0 ),
            (int) ( $body['usage']['completion_tokens'] ?? 0 ),
            $choice['finish_reason'] ?? 'stop'
        );
    }
}
