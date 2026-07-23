<?php
/**
 * UsageTrackingProvider class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Decorators;

use VuloPilotCore\Contracts\AI\AIProviderInterface;
use VuloPilotCore\ValueObjects\AIRequest;
use VuloPilotCore\ValueObjects\AIResponse;
use VuloPilot\Repositories\AiHistoryRepository;

defined( 'ABSPATH' ) || exit;

/**
 * Wraps any AIProviderInterface, recording one vulopilot_ai_history row
 * per call — both token usage and cost estimate together, in a single
 * decorator rather than two. The spec named these as separate concerns
 * ("Cost tracking" / "Usage tracking"), but they're always computed from
 * the same AIResponse and written to the same ai_history row
 * (DATABASE.md) in the same insert; splitting them into two decorators
 * would mean either two DB writes per call or one decorator awkwardly
 * reaching into the other's state. One decorator, two concerns it
 * naturally shares data for.
 *
 * Records failures too (status = 'failure', zero tokens/cost) — an
 * audit trail of "what did we try and how did it go" is only complete if
 * it includes the calls that didn't work, not just the successful ones.
 *
 * @class       UsageTrackingProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class UsageTrackingProvider implements AIProviderInterface {

    /**
     * USD per 1,000 tokens, [prompt, completion]. Approximate published
     * pricing at the time this was written — real pricing changes over
     * time and per-provider promotions exist; treat this as a reasonable
     * estimate for the dashboard, not a billing-grade figure. Unknown
     * models fall back to a conservative default rather than reporting 0.
     *
     * @var array<string, array{0: float, 1: float}>
     */
    private const PRICING_PER_1K_TOKENS = array(
        'openai'     => array( 0.005, 0.015 ),
        'anthropic'  => array( 0.003, 0.015 ),
        'gemini'     => array( 0.00125, 0.005 ),
        'openrouter' => array( 0.003, 0.015 ),
        'groq'       => array( 0.00059, 0.00079 ),
        'ollama'     => array( 0.0, 0.0 ),
    );

    private AIProviderInterface $inner;
    private AiHistoryRepository $history;

    /**
     * @param AIProviderInterface      $inner   Provider (or another decorator) to wrap.
     * @param AiHistoryRepository|null $history Defaults to a new instance if not supplied (dependency
     *                                          injected in tests to assert against a fake).
     */
    public function __construct( AIProviderInterface $inner, ?AiHistoryRepository $history = null ) {
        $this->inner    = $inner;
        $this->history  = $history ?? new AiHistoryRepository();
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
        try {
            $response = $this->inner->send( $request );
            $this->record_success( $response );
            return $response;
        } catch ( \Throwable $exception ) {
            $this->record_failure();
            throw $exception;
        }
    }

    /**
     * @inheritDoc
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse {
        try {
            $response = $this->inner->send_streaming( $request, $on_chunk );
            $this->record_success( $response );
            return $response;
        } catch ( \Throwable $exception ) {
            $this->record_failure();
            throw $exception;
        }
    }

    /**
     * @param AIResponse $response Completed response.
     * @return void
     */
    private function record_success( AIResponse $response ): void {
        $this->history->insert(
            array(
                'provider'           => $response->get_provider(),
                'model'              => $response->get_model(),
                'prompt_tokens'      => $response->get_prompt_tokens(),
                'completion_tokens'  => $response->get_completion_tokens(),
                'cost_estimate'      => $this->estimate_cost( $response ),
                'status'             => 'success',
                'requested_by'       => get_current_user_id(),
            )
        );
    }

    /**
     * @return void
     */
    private function record_failure(): void {
        $this->history->insert(
            array(
                'provider'          => $this->inner->get_id(),
                'prompt_tokens'     => 0,
                'completion_tokens' => 0,
                'cost_estimate'     => 0,
                'status'            => 'failure',
                'requested_by'      => get_current_user_id(),
            )
        );
    }

    /**
     * @param AIResponse $response Completed response.
     * @return float USD.
     */
    private function estimate_cost( AIResponse $response ): float {
        [$prompt_rate, $completion_rate] = self::PRICING_PER_1K_TOKENS[ $response->get_provider() ] ?? array( 0.005, 0.015 );

        return round(
            ( $response->get_prompt_tokens() / 1000 * $prompt_rate )
            + ( $response->get_completion_tokens() / 1000 * $completion_rate ),
            4
        );
    }
}
