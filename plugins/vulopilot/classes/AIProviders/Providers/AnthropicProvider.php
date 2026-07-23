<?php
/**
 * AnthropicProvider class file.
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
 * Anthropic's Messages API — genuinely different from the OpenAI-family
 * shape, not just re-hostable: auth is `x-api-key` (not Bearer), a
 * mandatory `anthropic-version` header, `max_tokens` is required (OpenAI
 * treats it as optional), any 'system' role message must be pulled out of
 * the messages array into its own top-level `system` field, and the
 * response content is an array of typed blocks rather than a single
 * string. Streaming is SSE like the OpenAI family, but framed as named
 * events (`content_block_delta`, `message_delta`, …) rather than one
 * uniform chunk shape.
 *
 * @class       AnthropicProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AnthropicProvider implements AIProviderInterface {

    private const API_VERSION        = '2023-06-01';
    private const BASE_URL           = 'https://api.anthropic.com/v1';
    private const DEFAULT_MAX_TOKENS = 1024;

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
        return 'anthropic';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Anthropic', 'vulopilot' );
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
        return array( 'claude-opus-4-6', 'claude-sonnet-5', 'claude-haiku-4-5' );
    }

    /**
     * @inheritDoc
     */
    public function send( AIRequest $request ): AIResponse {
        $response = wp_remote_post(
            self::BASE_URL . '/messages',
            array(
                'timeout' => 30,
                'headers' => $this->build_headers(),
                'body'    => wp_json_encode( $this->build_body( $request ) ),
            )
        );

        $body = $this->handle_http_response( $response );

        $text_blocks = array_filter( $body['content'] ?? array(), static fn( $block ) => 'text' === ( $block['type'] ?? '' ) );

        return new AIResponse(
            implode( '', array_column( $text_blocks, 'text' ) ),
            $this->get_id(),
            $body['model'] ?? '',
            (int) ( $body['usage']['input_tokens'] ?? 0 ),
            (int) ( $body['usage']['output_tokens'] ?? 0 ),
            $body['stop_reason'] ?? 'stop'
        );
    }

    /**
     * @inheritDoc
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse {
        $content           = '';
        $model             = $request->get_model();
        $stop_reason       = 'stop';
        $prompt_tokens     = 0;
        $completion_tokens = 0;

        StreamingHttpClient::stream_post(
            self::BASE_URL . '/messages',
            $this->build_headers(),
            wp_json_encode( array_merge( $this->build_body( $request ), array( 'stream' => true ) ) ),
            function ( string $line ) use ( &$content, &$model, &$stop_reason, &$prompt_tokens, &$completion_tokens, $on_chunk ) {
                if ( 0 !== strpos( $line, 'data:' ) ) {
                    return;
                }

                $event = json_decode( trim( substr( $line, 5 ) ), true );

                if ( ! is_array( $event ) ) {
                    return;
                }

                switch ( $event['type'] ?? '' ) {
                    case 'message_start':
                        $model         = $event['message']['model'] ?? $model;
                        $prompt_tokens = (int) ( $event['message']['usage']['input_tokens'] ?? 0 );
                        break;

                    case 'content_block_delta':
                        $delta = $event['delta']['text'] ?? '';
                        if ( '' !== $delta ) {
                            $content .= $delta;
                            $on_chunk( $delta );
                        }
                        break;

                    case 'message_delta':
                        $stop_reason       = $event['delta']['stop_reason'] ?? $stop_reason;
                        $completion_tokens = (int) ( $event['usage']['output_tokens'] ?? $completion_tokens );
                        break;
                }
            }
        );

        return new AIResponse( $content, $this->get_id(), $model, $prompt_tokens, $completion_tokens, $stop_reason );
    }

    /**
     * @return array<string, string>
     */
    private function build_headers(): array {
        return array(
            'x-api-key'         => $this->api_key,
            'anthropic-version' => self::API_VERSION,
            'Content-Type'      => 'application/json',
        );
    }

    /**
     * @param AIRequest $request Request to translate.
     * @return array<string, mixed>
     */
    private function build_body( AIRequest $request ): array {
        $system   = null;
        $messages = array();

        foreach ( $request->get_messages() as $message ) {
            if ( 'system' === $message['role'] ) {
                $system = $message['content'];
                continue;
            }
            $messages[] = $message;
        }

        $body = array(
            'model'      => $request->get_model(),
            'messages'   => $messages,
            'max_tokens' => $request->get_max_tokens() ?? self::DEFAULT_MAX_TOKENS,
        );

        if ( null !== $system ) {
            $body['system'] = $system;
        }

        if ( null !== $request->get_temperature() ) {
            $body['temperature'] = $request->get_temperature();
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
            throw new TransientProviderException( sprintf( 'Anthropic returned HTTP %d', $status ) );
        }

        if ( $status >= 400 ) {
            throw new ProviderRequestException( $body['error']['message'] ?? sprintf( 'Anthropic returned HTTP %d', $status ) );
        }

        return is_array( $body ) ? $body : array();
    }
}
