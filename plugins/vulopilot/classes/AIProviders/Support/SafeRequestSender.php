<?php
/**
 * SafeRequestSender class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Support;

use VuloPilotCore\ValueObjects\AIRequest;
use VuloPilotCore\ValueObjects\AIResponse;
use VuloPilot\AIProviders\ProviderRegistry;
use VuloPilot\AIProviders\Safety\AISafetyValidator;

defined( 'ABSPATH' ) || exit;

/**
 * The "safety-validate → build a fallback chain → send → sanitize the
 * response" sequence every real AI call in this codebase goes through —
 * originally written once, inline, inside AIActions\ActionRunner::propose().
 * GEO-MODULE.md's GeoAnalysis\GeoAnalyzer needed the exact same sequence
 * for a call that isn't an AIAction at all (a read-only score/suggestion
 * request, not a mutation with an approval gate), so this was extracted
 * out from ActionRunner into its own small, reusable class rather than
 * copy-pasting the same six lines into a second consumer.
 *
 * Deliberately narrow: this is not a new "AI request abstraction layer"
 * — it's the one sequence AIProviderInterface::send() always needs
 * wrapped around it, given a shared name so both call sites read as
 * "send this safely" instead of restating the mechanics.
 *
 * @class       SafeRequestSender class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SafeRequestSender {

    private ProviderRegistry $provider_registry;
    private AISafetyValidator $safety_validator;

    /**
     * @param ProviderRegistry  $provider_registry Registry to build an AI provider chain from.
     * @param AISafetyValidator $safety_validator  Validator both the prompt and response pass through.
     */
    public function __construct( ProviderRegistry $provider_registry, AISafetyValidator $safety_validator ) {
        $this->provider_registry = $provider_registry;
        $this->safety_validator  = $safety_validator;
    }

    /**
     * @param array<int, array{role: string, content: string}> $messages Chat-style prompt messages.
     * @return AIResponse
     *
     * @throws \VuloPilotCore\Exceptions\UnsafePromptException If the prompt fails safety validation.
     * @throws \RuntimeException If no AI provider is configured.
     */
    public function send( array $messages ): AIResponse {
        $this->safety_validator->validate_prompt( $messages );

        $provider = $this->provider_registry->build_fallback_chain();

        if ( ! $provider ) {
            throw new \RuntimeException( __( 'No AI provider is configured.', 'vulopilot' ) );
        }

        $model    = $provider->get_available_models()[0] ?? '';
        $response = $provider->send( new AIRequest( $model, $messages ) );

        return $this->safety_validator->sanitize_response( $response );
    }
}
