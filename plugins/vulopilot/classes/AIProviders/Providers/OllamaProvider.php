<?php
/**
 * OllamaProvider class file.
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
 * Ollama — a locally (or self-hosted, e.g. on the same network) run
 * model server, the one provider here with no API key at all (BYOK
 * doesn't apply the same way: what's configured per DATABASE.md's
 * `vulopilot_ai_provider_configs.credentials` is a base URL, not a
 * secret — still stored through the same table/CredentialEncryption
 * path for consistency, even though there's nothing sensitive about a
 * localhost URL). Its streaming format is also the odd one out here:
 * newline-delimited raw JSON objects, not SSE `data: ` lines — every
 * non-empty line already IS one complete event.
 *
 * @class       OllamaProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OllamaProvider implements AIProviderInterface {

    private const DEFAULT_BASE_URL = 'http://localhost:11434';

    private string $base_url;

    /**
     * @param string $base_url Ollama server URL — what's stored as this
     *                         provider's "credential", since there's no API key.
     */
    public function __construct( string $base_url = self::DEFAULT_BASE_URL ) {
        $this->base_url = '' !== trim( $base_url ) ? rtrim( $base_url, '/' ) : self::DEFAULT_BASE_URL;
    }

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'ollama';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Ollama (self-hosted)', 'vulopilot' );
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
        // Unlike every hosted provider here, Ollama's real model list is
        // whatever the site owner has pulled locally (`ollama pull llama3.2`)
        // — not a fixed catalog this adapter can know in advance. These
        // are common defaults to pre-select in the UI, not a claim that
        // they're installed.
        return array( 'llama3.2', 'llama3.1', 'mistral', 'qwen2.5' );
    }

    /**
     * @inheritDoc
     */
    public function send( AIRequest $request ): AIResponse {
        $response = wp_remote_post(
            $this->base_url . '/api/chat',
            array(
                'timeout' => 60,
                'headers' => array( 'Content-Type' => 'application/json' ),
                'body'    => wp_json_encode( $this->build_body( $request, false ) ),
            )
        );

        $body = $this->handle_http_response( $response );

        return new AIResponse(
            $body['message']['content'] ?? '',
            $this->get_id(),
            $body['model'] ?? $request->get_model(),
            (int) ( $body['prompt_eval_count'] ?? 0 ),
            (int) ( $body['eval_count'] ?? 0 ),
            ( $body['done'] ?? false ) ? 'stop' : 'incomplete'
        );
    }

    /**
     * @inheritDoc
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse {
        $content           = '';
        $model             = $request->get_model();
        $prompt_tokens     = 0;
        $completion_tokens = 0;
        $finish_reason     = 'incomplete';

        StreamingHttpClient::stream_post(
            $this->base_url . '/api/chat',
            array( 'Content-Type' => 'application/json' ),
            wp_json_encode( $this->build_body( $request, true ) ),
            function ( string $line ) use ( &$content, &$model, &$prompt_tokens, &$completion_tokens, &$finish_reason, $on_chunk ) {
                $event = json_decode( $line, true );

                if ( ! is_array( $event ) ) {
                    return;
                }

                $model = $event['model'] ?? $model;
                $delta = $event['message']['content'] ?? '';

                if ( '' !== $delta ) {
                    $content .= $delta;
                    $on_chunk( $delta );
                }

                if ( ! empty( $event['done'] ) ) {
                    $finish_reason     = 'stop';
                    $prompt_tokens     = (int) ( $event['prompt_eval_count'] ?? 0 );
                    $completion_tokens = (int) ( $event['eval_count'] ?? 0 );
                }
            }
        );

        return new AIResponse( $content, $this->get_id(), $model, $prompt_tokens, $completion_tokens, $finish_reason );
    }

    /**
     * @param AIRequest $request Request to translate.
     * @param bool      $stream  Whether this call is for the streaming path.
     * @return array<string, mixed>
     */
    private function build_body( AIRequest $request, bool $stream ): array {
        $body = array(
            'model'    => $request->get_model(),
            'messages' => $request->get_messages(),
            'stream'   => $stream,
        );

        $options = array();

        if ( null !== $request->get_temperature() ) {
            $options['temperature'] = $request->get_temperature();
        }

        if ( null !== $request->get_max_tokens() ) {
            $options['num_predict'] = $request->get_max_tokens();
        }

        if ( $options ) {
            $body['options'] = $options;
        }

        return $body;
    }

    /**
     * @param mixed $response wp_remote_post()'s return value.
     * @return array<string, mixed>
     *
     * @throws TransientProviderException The local/self-hosted server couldn't be reached, or a 5xx.
     * @throws ProviderRequestException    Any other 4xx (e.g. the requested model isn't pulled locally).
     */
    private function handle_http_response( $response ): array {
        if ( is_wp_error( $response ) ) {
            throw new TransientProviderException( $response->get_error_message() );
        }

        $status = wp_remote_retrieve_response_code( $response );
        $body   = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $status >= 500 ) {
            throw new TransientProviderException( sprintf( 'Ollama returned HTTP %d', $status ) );
        }

        if ( $status >= 400 ) {
            throw new ProviderRequestException( $body['error'] ?? sprintf( 'Ollama returned HTTP %d', $status ) );
        }

        return is_array( $body ) ? $body : array();
    }
}
