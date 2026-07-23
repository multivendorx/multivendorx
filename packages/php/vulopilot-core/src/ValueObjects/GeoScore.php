<?php
/**
 * GeoScore file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * A single post's GEO (Generative Engine Optimization) score, produced by
 * GeoAnalysis\GeoAnalyzer::analyze() — combines deterministic Scanner
 * findings with AI-judged dimensions into one overall score.
 *
 * @class       GeoScore class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class GeoScore {

    /**
     * @var int
     */
    private int $post_id;

    /**
     * @var int|null Null when no GEO scan history exists yet for this post.
     */
    private ?int $deterministic_score;

    /**
     * @var array{entity_coverage: int, question_coverage: int, answer_completeness: int, llm_readability: int}
     */
    private array $ai_scores;

    /**
     * @var int 0-100.
     */
    private int $overall_score;

    /**
     * @var string[]
     */
    private array $suggestions;

    /**
     * @var string MySQL datetime string, UTC.
     */
    private string $generated_at;

    /**
     * @param int         $post_id             Post this score is for.
     * @param int|null    $deterministic_score 0-100, or null if no GEO scan history exists yet.
     * @param array       $ai_scores           entity_coverage/question_coverage/answer_completeness/llm_readability, each 0-100.
     * @param int         $overall_score       0-100.
     * @param string[]    $suggestions         Human-readable improvement suggestions.
     * @param string      $generated_at        MySQL datetime string, UTC.
     */
    public function __construct(
        int $post_id,
        ?int $deterministic_score,
        array $ai_scores,
        int $overall_score,
        array $suggestions,
        string $generated_at
    ) {
        $this->post_id             = $post_id;
        $this->deterministic_score = $deterministic_score;
        $this->ai_scores           = $ai_scores;
        $this->overall_score       = $overall_score;
        $this->suggestions         = $suggestions;
        $this->generated_at        = $generated_at;
    }

    /**
     * @return int
     */
    public function get_post_id(): int {
        return $this->post_id;
    }

    /**
     * @return int|null
     */
    public function get_deterministic_score(): ?int {
        return $this->deterministic_score;
    }

    /**
     * @return array{entity_coverage: int, question_coverage: int, answer_completeness: int, llm_readability: int}
     */
    public function get_ai_scores(): array {
        return $this->ai_scores;
    }

    /**
     * @return int
     */
    public function get_overall_score(): int {
        return $this->overall_score;
    }

    /**
     * @return string[]
     */
    public function get_suggestions(): array {
        return $this->suggestions;
    }

    /**
     * @return string
     */
    public function get_generated_at(): string {
        return $this->generated_at;
    }

    /**
     * @return array<string, mixed>
     */
    public function to_array(): array {
        return array(
            'post_id'             => $this->post_id,
            'deterministic_score' => $this->deterministic_score,
            'ai_scores'           => $this->ai_scores,
            'overall_score'       => $this->overall_score,
            'suggestions'         => $this->suggestions,
            'generated_at'        => $this->generated_at,
        );
    }
}
