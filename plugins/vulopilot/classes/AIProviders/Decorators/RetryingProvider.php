<?php
/**
 * RetryingProvider class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Decorators;

use VuloPilotCore\Contracts\AI\AIProviderInterface;
use VuloPilotCore\Exceptions\TransientProviderException;
use VuloPilotCore\ValueObjects\AIRequest;
use VuloPilotCore\ValueObjects\AIResponse;

defined( 'ABSPATH' ) || exit;

/**
 * Wraps any AIProviderInterface with retry-with-backoff on transient
 * failures — implements the same interface it wraps (AI-ARCHITECTURE.md's
 * decorator pattern), so ProviderRegistry can stack this around an
 * OpenAiProvider exactly the same way it would around any other adapter,
 * with zero code here that knows which provider it's wrapping.
 *
 * Only catches TransientProviderException — a ProviderRequestException
 * (bad API key, malformed request) or RateLimitExceededException
 * (thrown before the inner call even happens) pass straight through, per
 * those exceptions' own docblocks.
 *
 * @class       RetryingProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RetryingProvider implements AIProviderInterface {

    private AIProviderInterface $inner;
    private int $max_attempts;
    private int $base_delay_ms;

    /**
     * @param AIProviderInterface $inner         Provider (or another decorator) to wrap.
     * @param int                 $max_attempts   Total attempts, including the first.
     * @param int                 $base_delay_ms  Delay before the second attempt; doubles each retry after that.
     */
    public function __construct( AIProviderInterface $inner, int $max_attempts = 3, int $base_delay_ms = 500 ) {
        $this->inner         = $inner;
        $this->max_attempts  = max( 1, $max_attempts );
        $this->base_delay_ms = $base_delay_ms;
    }

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return $this->inner->get_id();
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return $this->inner->get_label();
    }

    /**
     * @inheritDoc
     */
    public function supports_streaming(): bool {
        return $this->inner->supports_streaming();
    }

    /**
     * @inheritDoc
     */
    public function get_available_models(): array {
        return $this->inner->get_available_models();
    }

    /**
     * @inheritDoc
     */
    public function send( AIRequest $request ): AIResponse {
        return $this->with_retries( fn() => $this->inner->send( $request ) );
    }

    /**
     * @inheritDoc
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse {
        // A stream that has already emitted partial chunks to $on_chunk
        // can't be safely retried mid-flight (the caller would see
        // duplicated content) — retries only apply to the initial
        // connection attempt failing before any chunk arrives.
        return $this->with_retries( fn() => $this->inner->send_streaming( $request, $on_chunk ) );
    }

    /**
     * @param callable $attempt function(): AIResponse
     * @return AIResponse
     *
     * @throws TransientProviderException If every attempt is exhausted.
     */
    private function with_retries( callable $attempt ): AIResponse {
        $attempts_made = 0;

        while ( true ) {
            try {
                return $attempt();
            } catch ( TransientProviderException $exception ) {
                ++$attempts_made;

                if ( $attempts_made >= $this->max_attempts ) {
                    throw $exception;
                }

                usleep( $this->base_delay_ms * 1000 * ( 2 ** ( $attempts_made - 1 ) ) );
            }
        }
    }
}
