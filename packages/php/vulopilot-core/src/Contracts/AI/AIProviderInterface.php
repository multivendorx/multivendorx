<?php
/**
 * AIProviderInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\AI;

use VuloPilotCore\Exceptions\AIProviderException;
use VuloPilotCore\ValueObjects\AIRequest;
use VuloPilotCore\ValueObjects\AIResponse;

/**
 * Every AI provider adapter (free BYOK adapters under AIProviders\Providers\,
 * Pro's decorators, or a premium provider registered via
 * `vulopilot_ai_provider_sources`) implements this so engine code never
 * depends on a concrete SDK (AI-ARCHITECTURE.md).
 *
 * @class       AIProviderInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface AIProviderInterface {

    /**
     * @return string Unique, stable provider id (e.g. 'openai', 'anthropic').
     */
    public function get_id(): string;

    /**
     * @return string Human-readable label.
     */
    public function get_label(): string;

    /**
     * @return bool Whether send_streaming() is actually supported (rather than a fallback to send()).
     */
    public function supports_streaming(): bool;

    /**
     * @return string[] Model ids this provider currently offers.
     */
    public function get_available_models(): array;

    /**
     * @param AIRequest $request Request to send.
     * @return AIResponse
     * @throws AIProviderException When the provider call fails.
     */
    public function send( AIRequest $request ): AIResponse;

    /**
     * @param AIRequest $request  Request to send.
     * @param callable  $on_chunk function( string $delta ): void — called for each streamed content delta.
     * @return AIResponse The final, assembled response.
     * @throws AIProviderException When the provider call fails.
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse;
}
