<?php
/**
 * ProviderFallbackChain class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Decorators;

use VuloPilotCore\Contracts\AI\AIProviderInterface;
use VuloPilotCore\Exceptions\AIProviderException;
use VuloPilotCore\ValueObjects\AIRequest;
use VuloPilotCore\ValueObjects\AIResponse;

defined( 'ABSPATH' ) || exit;

/**
 * Tries an ordered list of providers, moving to the next on any
 * AIProviderException until one succeeds or the list is exhausted. Still
 * implements AIProviderInterface like every other decorator here — this
 * is the "Fallback" requirement, expressed as one more composable piece
 * rather than special-cased orchestration logic living in
 * ProviderRegistry. Each entry in $providers is typically already wrapped
 * in RateLimitedProvider/RetryingProvider/UsageTrackingProvider by
 * ProviderRegistry::build_chain() before it ever reaches here, so a
 * "fallback" is a last resort after each individual provider's own
 * retries are already exhausted, not a substitute for them.
 *
 * @class       ProviderFallbackChain class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProviderFallbackChain implements AIProviderInterface {

    /**
     * @var AIProviderInterface[]
     */
    private array $providers;

    /**
     * @param AIProviderInterface[] $providers Tried in array order.
     *
     * @throws \InvalidArgumentException If $providers is empty.
     */
    public function __construct( array $providers ) {
        if ( ! $providers ) {
            throw new \InvalidArgumentException( 'ProviderFallbackChain needs at least one provider.' );
        }

        $this->providers = array_values( $providers );
    }

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return $this->providers[0]->get_id();
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return $this->providers[0]->get_label();
    }

    /**
     * @inheritDoc
     */
    public function supports_streaming(): bool {
        return $this->providers[0]->supports_streaming();
    }

    /**
     * @inheritDoc
     */
    public function get_available_models(): array {
        return $this->providers[0]->get_available_models();
    }

    /**
     * @inheritDoc
     */
    public function send( AIRequest $request ): AIResponse {
        return $this->try_each( static fn( AIProviderInterface $provider ) => $provider->send( $request ) );
    }

    /**
     * @inheritDoc
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse {
        return $this->try_each( static fn( AIProviderInterface $provider ) => $provider->send_streaming( $request, $on_chunk ) );
    }

    /**
     * @param callable $call function( AIProviderInterface ): AIResponse
     * @return AIResponse
     *
     * @throws AIProviderException The last provider tried's own exception, if every provider fails.
     */
    private function try_each( callable $call ): AIResponse {
        $last_exception = null;

        foreach ( $this->providers as $provider ) {
            try {
                return $call( $provider );
            } catch ( AIProviderException $exception ) {
                $last_exception = $exception;
                continue;
            }
        }

        throw $last_exception;
    }
}
