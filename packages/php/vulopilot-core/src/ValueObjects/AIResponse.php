<?php
/**
 * AIResponse file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * An AIProviderInterface's response to an AIRequest. Immutable — sanitizing
 * the content (AISafetyValidator::sanitize_response()) produces a new
 * instance via with_content() rather than mutating this one.
 *
 * @class       AIResponse class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class AIResponse {

    /**
     * @var string
     */
    private string $content;

    /**
     * @var string
     */
    private string $provider;

    /**
     * @var string
     */
    private string $model;

    /**
     * @var int
     */
    private int $prompt_tokens;

    /**
     * @var int
     */
    private int $completion_tokens;

    /**
     * @var string
     */
    private string $finish_reason;

    /**
     * @param string $content            Generated content.
     * @param string $provider           Provider id that generated this response.
     * @param string $model              Model id that generated this response.
     * @param int    $prompt_tokens      Tokens used by the prompt.
     * @param int    $completion_tokens  Tokens used by the completion.
     * @param string $finish_reason      Why generation stopped (e.g. 'stop', 'incomplete').
     */
    public function __construct(
        string $content,
        string $provider,
        string $model,
        int $prompt_tokens,
        int $completion_tokens,
        string $finish_reason
    ) {
        $this->content           = $content;
        $this->provider          = $provider;
        $this->model             = $model;
        $this->prompt_tokens     = $prompt_tokens;
        $this->completion_tokens = $completion_tokens;
        $this->finish_reason     = $finish_reason;
    }

    /**
     * @return string
     */
    public function get_content(): string {
        return $this->content;
    }

    /**
     * @return string
     */
    public function get_provider(): string {
        return $this->provider;
    }

    /**
     * @return string
     */
    public function get_model(): string {
        return $this->model;
    }

    /**
     * @return int
     */
    public function get_prompt_tokens(): int {
        return $this->prompt_tokens;
    }

    /**
     * @return int
     */
    public function get_completion_tokens(): int {
        return $this->completion_tokens;
    }

    /**
     * @return string
     */
    public function get_finish_reason(): string {
        return $this->finish_reason;
    }

    /**
     * Returns a copy of this response with different content — used to
     * apply sanitization without mutating the original.
     *
     * @param string $new_content Replacement content.
     * @return self
     */
    public function with_content( string $new_content ): self {
        return new self(
            $new_content,
            $this->provider,
            $this->model,
            $this->prompt_tokens,
            $this->completion_tokens,
            $this->finish_reason
        );
    }
}
