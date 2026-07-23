<?php
/**
 * ProviderRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders;

use VuloPilotCore\Contracts\AI\AIProviderInterface;
use VuloPilot\Repositories\AiProviderConfigRepository;
use VuloPilot\Services\CredentialEncryption;

defined( 'ABSPATH' ) || exit;

/**
 * Discovers registered adapter classes (same `vulopilot_*_sources`
 * filter-based discovery as Scanners\ScannerRegistry and
 * RuleEngine\RuleRegistry — see either's docblock for why this codebase
 * doesn't use Modules.php's folder-scan mechanism for a single-class
 * extension point) and is the one place that turns a stored, encrypted
 * `vulopilot_ai_provider_configs` row into a fully usable, decorated
 * AIProviderInterface — the only point in this codebase a provider
 * credential is ever decrypted.
 *
 * Every provider built here comes back wrapped
 * RateLimitedProvider → RetryingProvider → UsageTrackingProvider (that
 * order specifically: check the local budget before even trying, retry
 * transient failures within that budget, and record every real attempt —
 * successful or not — for the audit trail; see UsageTrackingProvider's
 * docblock on why failures are recorded too).
 *
 * @class       ProviderRegistry class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProviderRegistry {

    /**
     * @var array<string, class-string<AIProviderInterface>>
     */
    private array $adapter_classes = array();

    private AiProviderConfigRepository $configs;

    /**
     * ProviderRegistry constructor.
     */
    public function __construct() {
        $this->configs = new AiProviderConfigRepository();

        add_action( 'init', array( $this, 'register_providers' ), 20 );
    }

    /**
     * @return void
     */
    public function register_providers(): void {
        $this->adapter_classes = apply_filters( 'vulopilot_ai_provider_sources', $this->get_default_adapter_classes() );
    }

    /**
     * @return array<string, class-string<AIProviderInterface>>
     */
    private function get_default_adapter_classes(): array {
        return array(
            'openai'     => Providers\OpenAiProvider::class,
            'anthropic'  => Providers\AnthropicProvider::class,
            'gemini'     => Providers\GeminiProvider::class,
            'openrouter' => Providers\OpenRouterProvider::class,
            'ollama'     => Providers\OllamaProvider::class,
            'groq'       => Providers\GroqProvider::class,
        );
    }

    /**
     * @return string[]
     */
    public function get_registered_provider_ids(): array {
        return array_keys( $this->adapter_classes );
    }

    /**
     * Builds one provider id's fully decorated adapter, or null if it
     * isn't registered, isn't configured, or is configured but disabled.
     *
     * @param string $provider_id e.g. 'openai'.
     * @return AIProviderInterface|null
     */
    public function build_provider( string $provider_id ): ?AIProviderInterface {
        if ( ! isset( $this->adapter_classes[ $provider_id ] ) ) {
            return null;
        }

        $config = $this->configs->find_by_provider( $provider_id );

        if ( ! $config || empty( $config['is_active'] ) ) {
            return null;
        }

        $class      = $this->adapter_classes[ $provider_id ];
        $credential = CredentialEncryption::decrypt( (string) $config['credentials'] ) ?? '';
        $adapter    = new $class( $credential );

        return new Decorators\UsageTrackingProvider(
            new Decorators\RetryingProvider(
                new Decorators\RateLimitedProvider( $adapter )
            )
        );
    }

    /**
     * Builds a fallback chain across every currently active, configured
     * provider — what AIActions\ActionRunner sends every request through by default.
     * Order follows insertion order in `vulopilot_ai_provider_configs`; a
     * future settings screen letting a site owner reorder providers only
     * needs to change that stored order, not this method.
     *
     * @return AIProviderInterface|null Null if no provider is configured at all.
     */
    public function build_fallback_chain(): ?AIProviderInterface {
        $providers = array();

        foreach ( $this->get_registered_provider_ids() as $provider_id ) {
            $provider = $this->build_provider( $provider_id );

            if ( $provider ) {
                $providers[] = $provider;
            }
        }

        return $providers ? new Decorators\ProviderFallbackChain( $providers ) : null;
    }
}
