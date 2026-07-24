<?php
/**
 * GeoAnalyzer class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\GeoAnalysis;

use VuloPilotCore\ValueObjects\GeoScore;
use VuloPilot\AIProviders\Support\SafeRequestSender;
use VuloPilot\Repositories\FindingRepository;

defined( 'ABSPATH' ) || exit;

/**
 * Generates a GeoScore for one post (GEO-MODULE.md's "Generate GEO Score"
 * / "Generate AI suggestions" capability). Deliberately a plain,
 * concrete orchestrator with no interface — like Scanners\ScanRunner and
 * RuleEngine\RuleEngine, there is exactly one way "analyze this post for
 * GEO" happens in this codebase, so an interface here would have one
 * implementer and add nothing (the same reasoning already applied
 * throughout SCANNERS.md/RULE-ENGINE.md).
 *
 * This is NOT an AIAction: nothing about the post's own content is
 * mutated, so there is no Approval/Execution/Rollback lifecycle to run
 * (AI-ACTIONS.md's stages 5-7 exist specifically to gate a *mutation*,
 * and a read-only analysis has none). It still reuses the exact same
 * safety-validated AI call path every AIAction goes through
 * (AIProviders\Support\SafeRequestSender, extracted from
 * AIActions\ActionRunner precisely so this class didn't have to
 * duplicate that sequence) and the exact same FindingRepository every
 * other engine already persists through — no parallel infrastructure.
 *
 * @class       GeoAnalyzer class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoAnalyzer {

    /**
     * The 7 GEO-MODULE.md scanners scoped to a single post, plus the one
     * sitewide check (Trust Signals) that applies identically to every
     * post — 8 total, matching GeoScore's docblock.
     */
    private const TOTAL_DETERMINISTIC_CHECKS = 8;

    public const META_KEY = '_vulopilot_geo_score';

    private FindingRepository $findings;
    private SafeRequestSender $request_sender;

    /**
     * $request_sender is deliberately required, not defaulted — unlike
     * FindingRepository (a plain `$wpdb` wrapper, cheap to construct
     * anywhere), a fresh AIProviders\ProviderRegistry hooks its own
     * `add_action('init', ..., 20)` registration
     * (ProviderRegistry::__construct()); one built here on demand, after
     * 'init' has already fired, would never run register_providers() and
     * would silently have no adapters. VuloPilot.php's init_classes()
     * builds the one real SafeRequestSender during bootstrap and this
     * class must be given that same instance, the same reason
     * AIActions\ActionRunner requires it too.
     *
     * @param SafeRequestSender      $request_sender Sends a prompt through the safety-validate → provider chain → sanitize sequence.
     * @param FindingRepository|null $findings       Defaults to a new instance (injectable for tests).
     */
    public function __construct( SafeRequestSender $request_sender, ?FindingRepository $findings = null ) {
        $this->request_sender = $request_sender;
        $this->findings       = $findings ?? new FindingRepository();
    }

    /**
     * Runs a fresh analysis, persists it to postmeta, and returns it.
     *
     * @param int $post_id Post to analyze.
     * @return GeoScore
     *
     * @throws \InvalidArgumentException If post_id doesn't refer to a published post/page.
     * @throws \RuntimeException         If no AI provider is configured, or the AI response is unusable.
     */
    public function analyze( int $post_id ): GeoScore {
        $post = get_post( $post_id );

        if ( ! $post || ! in_array( $post->post_type, array( 'post', 'page' ), true ) || 'publish' !== $post->post_status ) {
            throw new \InvalidArgumentException( __( 'post_id must refer to a published post or page.', 'vulopilot' ) );
        }

        $deterministic_score       = $this->calculate_deterministic_score( $post_id );
        $messages                  = $this->build_prompt( $post, $deterministic_score );
        $response                  = $this->request_sender->send( $messages );
        $ai_scores_and_suggestions = $this->parse_response( $response );

        $overall_score = $this->calculate_overall_score( $deterministic_score, $ai_scores_and_suggestions['ai_scores'] );

        $score = new GeoScore(
            $post_id,
            $deterministic_score,
            $ai_scores_and_suggestions['ai_scores'],
            $overall_score,
            $ai_scores_and_suggestions['suggestions'],
            current_time( 'mysql', true )
        );

        update_post_meta( $post_id, self::META_KEY, wp_json_encode( $score->to_array() ) );

        return $score;
    }

    /**
     * Reads back a previously generated score without spending another
     * AI call — what the REST controller's GET route returns.
     *
     * @param int $post_id Post to read a score for.
     * @return array<string, mixed>|null
     */
    public function get_stored_score( int $post_id ): ?array {
        $stored = get_post_meta( $post_id, self::META_KEY, true );

        if ( '' === $stored ) {
            return null;
        }

        $decoded = json_decode( (string) $stored, true );

        return is_array( $decoded ) ? $decoded : null;
    }

    /**
     * Percentage of GEO-MODULE.md's 8 deterministic checks that have no
     * open finding for this post (7 per-post scanners) or sitewide (Trust
     * Signals) — null if this site has no GEO scan history at all yet,
     * so an absence of problems is never confused with "never checked."
     *
     * @param int $post_id Post to score.
     * @return int|null 0-100, or null if no 'geo' category finding has ever been recorded.
     */
    private function calculate_deterministic_score( int $post_id ): ?int {
        $has_any_geo_history = 0 < (int) $this->findings->find_all(
            array(
                'category' => 'geo',
                'per_page' => 1,
            )
        )['total'];

        if ( ! $has_any_geo_history ) {
            return null;
        }

        $per_post_failures = (int) $this->findings->find_all(
            array(
                'category'   => 'geo',
                'status'     => 'open',
                'object_ref' => (string) $post_id,
                'per_page'   => self::TOTAL_DETERMINISTIC_CHECKS,
            )
        )['total'];

        $sitewide_trust_signal_failure = 0 < (int) $this->findings->find_all(
            array(
                'category'   => 'geo',
                'status'     => 'open',
                'object_ref' => home_url( '/' ),
                'per_page'   => 1,
            )
        )['total'] ? 1 : 0;

        $failures = min( self::TOTAL_DETERMINISTIC_CHECKS, $per_post_failures + $sitewide_trust_signal_failure );

        return (int) round( ( self::TOTAL_DETERMINISTIC_CHECKS - $failures ) / self::TOTAL_DETERMINISTIC_CHECKS * 100 );
    }

    /**
     * @param \WP_Post $post                Post being analyzed.
     * @param int|null $deterministic_score Already-known deterministic score, if any — given to the AI as context.
     * @return array<int, array{role: string, content: string}>
     */
    private function build_prompt( \WP_Post $post, ?int $deterministic_score ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => 'You evaluate web content for how well AI answer engines (like ChatGPT, Perplexity, and AI Overviews) '
                    . 'can find, understand, and cite it. Score four dimensions from 0-100: '
                    . '"entity_coverage" (does the content clearly name and explain the key people/products/concepts it discusses), '
                    . '"question_coverage" (does it directly answer the questions a reader would plausibly search for), '
                    . '"answer_completeness" (are answers self-contained rather than requiring outside context), '
                    . '"llm_readability" (is it written in clear, extractable prose an AI system could quote directly). '
                    . 'Also give 3-5 concrete, specific suggestions to improve this content for AI answer engines. '
                    . 'Respond with ONLY raw JSON like {"entity_coverage": 70, "question_coverage": 60, "answer_completeness": 65, '
                    . '"llm_readability": 80, "suggestions": ["...", "..."]} — no markdown fences, no commentary.',
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Title: %s\n\nContent:\n%s%s",
                    $post->post_title,
                    wp_trim_words( wp_strip_all_tags( $post->post_content ), 500 ),
                    null !== $deterministic_score
                        ? sprintf( "\n\n(This content already scores %d/100 on separate structural checks — factor that in.)", $deterministic_score )
                        : ''
                ),
            ),
        );
    }

    /**
     * @param \VuloPilotCore\ValueObjects\AIResponse $response Raw AI response.
     * @return array{ai_scores: array{entity_coverage: int, question_coverage: int, answer_completeness: int, llm_readability: int}, suggestions: string[]}
     *
     * @throws \RuntimeException If the response isn't usable JSON in the expected shape.
     */
    private function parse_response( \VuloPilotCore\ValueObjects\AIResponse $response ): array {
        $content = preg_replace( '/^```(?:json)?\s*|\s*```$/', '', trim( $response->get_content() ) );
        $decoded = json_decode( trim( (string) $content ), true );

        if ( ! is_array( $decoded ) ) {
            throw new \RuntimeException( __( 'The AI did not return a usable GEO analysis.', 'vulopilot' ) );
        }

        $ai_scores = array();

        foreach ( array( 'entity_coverage', 'question_coverage', 'answer_completeness', 'llm_readability' ) as $key ) {
            $value = $decoded[ $key ] ?? null;

            if ( ! is_int( $value ) && ! ( is_numeric( $value ) && (string) (int) $value === (string) $value ) ) {
                throw new \RuntimeException(
                    sprintf(
                        /* translators: %s is the missing/invalid score dimension. */
                        __( 'The AI response is missing a valid "%s" score.', 'vulopilot' ),
                        $key
                    )
                );
            }

            $ai_scores[ $key ] = max( 0, min( 100, (int) $value ) );
        }

        $suggestions = array_values(
            array_filter(
                is_array( $decoded['suggestions'] ?? null ) ? $decoded['suggestions'] : array(),
                static fn( $suggestion ) => is_string( $suggestion ) && '' !== trim( $suggestion )
            )
        );

        if ( empty( $suggestions ) ) {
            throw new \RuntimeException( __( 'The AI did not return any suggestions.', 'vulopilot' ) );
        }

        return array(
            'ai_scores'   => $ai_scores,
            'suggestions' => $suggestions,
        );
    }

    /**
     * Simple, documented average — not a claim of scientific precision,
     * the same posture Controllers/Dashboard.php's calculate_overall_score()
     * already takes for the sitewide health score. If no deterministic
     * history exists yet, the AI-judged average stands alone rather than
     * averaging in a fabricated deterministic number.
     *
     * @param int|null                                                                                            $deterministic_score 0-100, or null.
     * @param array{entity_coverage: int, question_coverage: int, answer_completeness: int, llm_readability: int} $ai_scores Each 0-100.
     * @return int 0-100.
     */
    private function calculate_overall_score( ?int $deterministic_score, array $ai_scores ): int {
        $ai_average = (int) round( array_sum( $ai_scores ) / count( $ai_scores ) );

        if ( null === $deterministic_score ) {
            return $ai_average;
        }

        return (int) round( ( $deterministic_score + $ai_average ) / 2 );
    }
}
