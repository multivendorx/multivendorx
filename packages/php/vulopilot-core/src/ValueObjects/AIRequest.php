<?php
/**
 * AIRequest file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * A chat-style request sent to an AIProviderInterface.
 *
 * @class       AIRequest class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class AIRequest {

    /**
     * @var string
     */
    private string $model;

    /**
     * @var array<int, array{role: string, content: string}>
     */
    private array $messages;

    /**
     * @var float|null
     */
    private ?float $temperature;

    /**
     * @var int|null
     */
    private ?int $max_tokens;

    /**
     * @param string     $model       Model id to use.
     * @param array      $messages    array<int, array{role: string, content: string}>.
     * @param float|null $temperature Optional; providers apply their own default when null.
     * @param int|null   $max_tokens  Optional; providers apply their own default when null.
     */
    public function __construct(
        string $model,
        array $messages,
        ?float $temperature = null,
        ?int $max_tokens = null
    ) {
        $this->model       = $model;
        $this->messages    = $messages;
        $this->temperature = $temperature;
        $this->max_tokens  = $max_tokens;
    }

    /**
     * @return string
     */
    public function get_model(): string {
        return $this->model;
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    public function get_messages(): array {
        return $this->messages;
    }

    /**
     * @return float|null
     */
    public function get_temperature(): ?float {
        return $this->temperature;
    }

    /**
     * @return int|null
     */
    public function get_max_tokens(): ?int {
        return $this->max_tokens;
    }
}
