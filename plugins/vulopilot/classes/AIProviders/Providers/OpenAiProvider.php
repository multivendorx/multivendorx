<?php
/**
 * OpenAiProvider class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Providers;

defined( 'ABSPATH' ) || exit;

/**
 * OpenAI's Chat Completions API (api.openai.com).
 *
 * @class       OpenAiProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OpenAiProvider extends AbstractOpenAiCompatibleProvider {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'openai';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'OpenAI', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_available_models(): array {
        return array( 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o4-mini' );
    }

    /**
     * @inheritDoc
     */
    protected function get_base_url(): string {
        return 'https://api.openai.com/v1';
    }
}
