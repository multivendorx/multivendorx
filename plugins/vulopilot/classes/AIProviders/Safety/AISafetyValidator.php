<?php
/**
 * AISafetyValidator class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Safety;

use VuloPilotCore\Exceptions\UnsafePromptException;
use VuloPilotCore\ValueObjects\AIResponse;

defined( 'ABSPATH' ) || exit;

/**
 * Two gates every AI call goes through: validate_prompt() before a
 * request is ever sent (called by AIActions\ActionRunner, not by adapters — an
 * adapter's only job is wire-format translation, per
 * AbstractOpenAiCompatibleProvider's docblock), and sanitize_response()
 * on whatever comes back before it's used anywhere a site owner would
 * see it (a Recommendation's description, a future auto-applied fix).
 *
 * Deliberately conservative, not exhaustive — the secret-pattern check
 * catches the shapes of the API keys this codebase's own adapters use
 * (an ounce of self-consistency: don't let a prompt-builder accidentally
 * interpolate the very credential ProviderRegistry just decrypted for the
 * call), not a general-purpose PII/secrets scanner.
 *
 * @class       AISafetyValidator class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AISafetyValidator {

    private const MAX_PROMPT_LENGTH = 32000;

    /**
     * @var string[] Regex patterns matching common API-key shapes.
     */
    private const SECRET_PATTERNS = array(
        '/sk-[a-zA-Z0-9]{20,}/',            // OpenAI-style secret key.
        '/AIza[0-9A-Za-z\-_]{35}/',          // Google API key.
        '/-----BEGIN (RSA |EC )?PRIVATE KEY-----/',
    );

    /**
     * @param array<int, array{role: string, content: string}> $messages The prompt about to be sent.
     * @return void
     *
     * @throws UnsafePromptException If the prompt is too long or appears to contain a secret.
     */
    public function validate_prompt( array $messages ): void {
        $combined = implode( "\n", array_column( $messages, 'content' ) );

        if ( mb_strlen( $combined ) > self::MAX_PROMPT_LENGTH ) {
            throw new UnsafePromptException(
                sprintf(
                    /* translators: %d is the maximum allowed prompt length in characters. */
                    __( 'This request is too long to send to an AI provider (limit: %d characters).', 'vulopilot' ),
                    self::MAX_PROMPT_LENGTH
                )
            );
        }

        foreach ( self::SECRET_PATTERNS as $pattern ) {
            if ( preg_match( $pattern, $combined ) ) {
                throw new UnsafePromptException(
                    __( 'This request appears to contain a credential and was blocked before sending.', 'vulopilot' )
                );
            }
        }
    }

    /**
     * Strips any HTML/script content out of an AI response before it's
     * used anywhere — a plain-text/markdown answer is what every job
     * handler here expects, and an AI response should never be trusted
     * as safe-to-render HTML just because it came back successfully.
     *
     * @param AIResponse $response Response to sanitize.
     * @return AIResponse A copy with sanitized content.
     */
    public function sanitize_response( AIResponse $response ): AIResponse {
        return $response->with_content( wp_kses( $response->get_content(), array() ) );
    }
}
