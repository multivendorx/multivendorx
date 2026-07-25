<?php
/**
 * GeoScore file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\ValueObjects;

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
     * @var array{entity_coverage: int, question_coverage: int, answer_completeness: int, llm_readability: int, purpose_clarity: int, conversation_readiness: int, knowledge_graph_coverage: int, answer_first_structure: int}
     */
    private array $ai_scores;

    /**
     * @var array{retrieval_score: int, citation_readiness: int, ai_summary_qa_detection: int, entity_naming_consistency: int, content_freshness: int, data_point_evidence_density: int} The 6 readme.txt AI-Visibility sub-metrics computed without an AI call — see GeoAnalysis\GeoAnalyzer::calculate_sub_scores().
     */
    private array $sub_scores;

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
     * @param int      $post_id             Post this score is for.
     * @param int|null $deterministic_score 0-100, or null if no GEO scan history exists yet.
     * @param array    $ai_scores           entity_coverage/question_coverage/answer_completeness/llm_readability/purpose_clarity/conversation_readiness/knowledge_graph_coverage/answer_first_structure, each 0-100.
     * @param array    $sub_scores          retrieval_score/citation_readiness/ai_summary_qa_detection/entity_naming_consistency/content_freshness/data_point_evidence_density, each 0-100.
     * @param int      $overall_score       0-100.
     * @param string[] $suggestions         Human-readable improvement suggestions.
     * @param string   $generated_at        MySQL datetime string, UTC.
     */
    public function __construct(
        int $post_id,
        ?int $deterministic_score,
        array $ai_scores,
        array $sub_scores,
        int $overall_score,
        array $suggestions,
        string $generated_at
    ) {
        $this->post_id             = $post_id;
        $this->deterministic_score = $deterministic_score;
        $this->ai_scores           = $ai_scores;
        $this->sub_scores          = $sub_scores;
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
     * @return array{entity_coverage: int, question_coverage: int, answer_completeness: int, llm_readability: int, purpose_clarity: int, conversation_readiness: int, knowledge_graph_coverage: int, answer_first_structure: int}
     */
    public function get_ai_scores(): array {
        return $this->ai_scores;
    }

    /**
     * @return array{retrieval_score: int, citation_readiness: int, ai_summary_qa_detection: int, entity_naming_consistency: int, content_freshness: int, data_point_evidence_density: int}
     */
    public function get_sub_scores(): array {
        return $this->sub_scores;
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
            'sub_scores'          => $this->sub_scores,
            'overall_score'       => $this->overall_score,
            'suggestions'         => $this->suggestions,
            'generated_at'        => $this->generated_at,
        );
    }
}
