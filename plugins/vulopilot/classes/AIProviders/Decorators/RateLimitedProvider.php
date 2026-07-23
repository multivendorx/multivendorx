<?php
/**
 * RateLimitedProvider class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Decorators;

use VuloPilotCore\Contracts\AI\AIProviderInterface;
use VuloPilotCore\Exceptions\RateLimitExceededException;
use VuloPilotCore\ValueObjects\AIRequest;
use VuloPilotCore\ValueObjects\AIResponse;

defined( 'ABSPATH' ) || exit;

/**
 * Wraps any AIProviderInterface with a per-minute request budget, using a
 * WP transient as a lightweight sliding-window-by-the-minute counter —
 * not a new caching layer (performance.md/database.md's guidance against
 * inventing one), a transient is exactly the existing WP mechanism for
 * "a value that should expire on its own."
 *
 * This guards against *this site* hammering a provider (or burning
 * through Built-in Credits too fast) — a local, pre-emptive check, unlike
 * RetryingProvider which reacts to the provider's own responses.
 *
 * @class       RateLimitedProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RateLimitedProvider implements AIProviderInterface {

    private AIProviderInterface $inner;
    private int $max_requests_per_minute;

    /**
     * @param AIProviderInterface $inner                    Provider (or another decorator) to wrap.
     * @param int                 $max_requests_per_minute
     */
    public function __construct( AIProviderInterface $inner, int $max_requests_per_minute = 20 ) {
        $this->inner                   = $inner;
        $this->max_requests_per_minute = max( 1, $max_requests_per_minute );
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
        $this->enforce_limit();

        return $this->inner->send( $request );
    }

    /**
     * @inheritDoc
     */
    public function send_streaming( AIRequest $request, callable $on_chunk ): AIResponse {
        $this->enforce_limit();

        return $this->inner->send_streaming( $request, $on_chunk );
    }

    /**
     * @return void
     *
     * @throws RateLimitExceededException If this minute's budget is already spent.
     */
    private function enforce_limit(): void {
        $transient_key = 'vulopilot_ai_rate_' . $this->inner->get_id() . '_' . floor( time() / MINUTE_IN_SECONDS );
        $count         = (int) get_transient( $transient_key );

        if ( $count >= $this->max_requests_per_minute ) {
            throw new RateLimitExceededException(
                sprintf(
                    /* translators: 1: provider id, 2: requests-per-minute limit. */
                    __( '%1$s rate limit reached (%2$d requests/minute).', 'vulopilot' ),
                    $this->inner->get_id(),
                    $this->max_requests_per_minute
                )
            );
        }

        set_transient( $transient_key, $count + 1, MINUTE_IN_SECONDS );
    }
}
