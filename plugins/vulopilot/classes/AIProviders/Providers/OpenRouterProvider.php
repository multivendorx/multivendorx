<?php
/**
 * OpenRouterProvider class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Providers;

defined( 'ABSPATH' ) || exit;

/**
 * OpenRouter — an OpenAI-compatible proxy in front of many upstream
 * model providers. Model ids are namespaced by upstream vendor
 * (e.g. 'anthropic/claude-3.5-sonnet'), and OpenRouter's own docs ask
 * proxied clients to identify themselves via HTTP-Referer/X-Title, which
 * is the one real difference from a bare OpenAI request.
 *
 * @class       OpenRouterProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OpenRouterProvider extends AbstractOpenAiCompatibleProvider {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'openrouter';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'OpenRouter', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_available_models(): array {
        return array(
            'openai/gpt-4o',
            'anthropic/claude-3.5-sonnet',
            'google/gemini-2.0-flash-001',
            'meta-llama/llama-3.3-70b-instruct',
        );
    }

    /**
     * @inheritDoc
     */
    protected function get_base_url(): string {
        return 'https://openrouter.ai/api/v1';
    }

    /**
     * @inheritDoc
     */
    protected function get_extra_headers(): array {
        return array(
            'HTTP-Referer' => home_url( '/' ),
            'X-Title'      => 'VuloPilot',
        );
    }
}
