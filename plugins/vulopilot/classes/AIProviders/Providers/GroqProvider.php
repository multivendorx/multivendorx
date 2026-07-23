<?php
/**
 * GroqProvider class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Providers;

defined( 'ABSPATH' ) || exit;

/**
 * Groq's OpenAI-compatible API (api.groq.com) — same wire protocol as
 * OpenAI, running open-weight models on Groq's own inference hardware.
 * Chosen by users mainly for latency, not model choice, hence the
 * available-model list being fast open-weight models rather than a GPT
 * family.
 *
 * @class       GroqProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GroqProvider extends AbstractOpenAiCompatibleProvider {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'groq';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Groq', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_available_models(): array {
        return array( 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768' );
    }

    /**
     * @inheritDoc
     */
    protected function get_base_url(): string {
        return 'https://api.groq.com/openai/v1';
    }
}
