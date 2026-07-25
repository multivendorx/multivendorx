<?php
/**
 * SuggestInternalLinksAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIActions\Actions;

use VuloPilot\Exceptions\InvalidActionInputException;
use VuloPilot\Exceptions\InvalidActionOutputException;
use VuloPilot\ValueObjects\ActionExecutionResult;
use VuloPilot\ValueObjects\ActionPreview;
use VuloPilot\ValueObjects\AIResponse;

defined( 'ABSPATH' ) || exit;

/**
 * Pairs conceptually with Scanners\Basic\InternalLinkingScanner (flags a
 * post with zero internal links) — unlike every other action here, there
 * is no existing "find related posts" helper anywhere in the codebase to
 * build on, so validate_input() queries a bounded batch of candidate
 * posts itself (other published posts/pages sharing a category or tag
 * with the target, capped like OrphanPageScanner's bounded-sample
 * discipline) and hands that real, existing-URL candidate list to the
 * AI — the model picks from and writes anchor text for real posts, it
 * never invents a URL. validate_output() enforces this by rejecting any
 * suggestion whose URL isn't in the candidate list it was given.
 *
 * execute() appends a "Related reading" list to post_content — the same
 * visible-HTML-append shape GenerateFaqAction/GenerateSummaryBlockAction
 * already use, not fragile inline mid-paragraph link splicing.
 *
 * @class       SuggestInternalLinksAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SuggestInternalLinksAction extends AbstractBasicAction {

    private const MAX_CANDIDATES  = 10;
    private const MIN_SUGGESTIONS = 2;
    private const MAX_SUGGESTIONS = 5;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'suggest-internal-links';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Suggest internal links', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_id = absint( $input['post_id'] ?? 0 );
        $post    = $post_id ? get_post( $post_id ) : null;

        if ( ! $post || 'publish' !== $post->post_status ) {
            throw new InvalidActionInputException( __( 'post_id must refer to a published post or page.', 'vulopilot' ) );
        }

        $candidates = $this->find_candidate_posts( $post );

        if ( empty( $candidates ) ) {
            throw new InvalidActionInputException( __( 'No other published posts share a category or tag with this one to link to.', 'vulopilot' ) );
        }

        return array(
            'post_id'          => $post_id,
            'title'            => $post->post_title,
            'content'          => $post->post_content,
            'original_content' => $post->post_content,
            'candidates'       => $candidates,
        );
    }

    /**
     * Finds other published posts/pages sharing a category or tag with
     * the target post — a bounded, real candidate list so the AI is
     * picking from and writing anchor text for existing URLs, not
     * inventing them.
     *
     * @param \WP_Post $post The post links are being suggested for.
     * @return array<int, array{url: string, title: string}>
     */
    private function find_candidate_posts( \WP_Post $post ): array {
        // WP_Tax_Query requires one taxonomy per clause — it doesn't
        // accept an array of taxonomies within a single clause — so
        // category and post_tag term ids are queried and combined into
        // separate OR'd clauses, not merged into one.
        $tax_query = array( 'relation' => 'OR' );

        foreach ( array( 'category', 'post_tag' ) as $taxonomy ) {
            $term_ids = wp_get_post_terms( $post->ID, $taxonomy, array( 'fields' => 'ids' ) );

            if ( is_wp_error( $term_ids ) || empty( $term_ids ) ) {
                continue;
            }

            $tax_query[] = array(
                'taxonomy' => $taxonomy,
                'field'    => 'term_id',
                'terms'    => $term_ids,
            );
        }

        if ( count( $tax_query ) === 1 ) {
            return array();
        }

        $related = get_posts(
            array(
                'post_type'      => array( 'post', 'page' ),
                'post_status'    => 'publish',
                'post__not_in'   => array( $post->ID ),
                'posts_per_page' => self::MAX_CANDIDATES,
                'orderby'        => 'modified',
                'order'          => 'DESC',
                'tax_query'      => $tax_query, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
            )
        );

        $candidates = array();

        foreach ( $related as $candidate ) {
            $candidates[] = array(
                'url'   => get_permalink( $candidate ),
                'title' => $candidate->post_title,
            );
        }

        return $candidates;
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        $candidate_list = implode(
            "\n",
            array_map(
                static fn( array $c ) => sprintf( '- %s (%s)', $c['title'], $c['url'] ),
                $input['candidates']
            )
        );

        return array(
            array(
                'role'    => 'system',
                'content' => sprintf(
                    'You suggest internal links for a piece of web content. You will be given the article and a list of '
                        . 'candidate pages already on the same site. Pick %1$d-%2$d candidates that are genuinely relevant to '
                        . 'this article and write natural anchor text for each. Only use URLs from the candidate list — never '
                        . 'invent a URL. Respond with ONLY a raw JSON array like '
                        . '[{"url": "...", "anchor_text": "..."}] — no markdown fences, no commentary.',
                    self::MIN_SUGGESTIONS,
                    self::MAX_SUGGESTIONS
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Article title: %s\n\nArticle content:\n%s\n\nCandidate pages:\n%s",
                    $input['title'],
                    wp_trim_words( wp_strip_all_tags( $input['content'] ), 300 ),
                    $candidate_list
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        $content = preg_replace( '/^```(?:json)?\s*|\s*```$/', '', trim( $response->get_content() ) );
        $decoded = json_decode( trim( (string) $content ), true );

        return array( 'suggestions' => is_array( $decoded ) ? $decoded : array() );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $suggestions = $output['suggestions'] ?? array();

        if ( empty( $suggestions ) || ! is_array( $suggestions ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not return any link suggestions.', 'vulopilot' ) );
        }

        $candidate_urls = wp_list_pluck( $input['candidates'], 'url' );

        foreach ( $suggestions as $suggestion ) {
            if ( ! is_array( $suggestion ) || empty( $suggestion['url'] ) || empty( $suggestion['anchor_text'] ) ) {
                throw new InvalidActionOutputException( __( 'The AI returned an incomplete link suggestion.', 'vulopilot' ) );
            }

            if ( ! in_array( $suggestion['url'], $candidate_urls, true ) ) {
                throw new InvalidActionOutputException( __( 'The AI suggested a URL that was not in the candidate list.', 'vulopilot' ) );
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        $anchors = wp_list_pluck( $output['suggestions'], 'anchor_text' );

        return new ActionPreview(
            sprintf(
                /* translators: %d is the number of suggested internal links. */
                __( 'Add %d related-reading links to this page', 'vulopilot' ),
                count( $anchors )
            ),
            null,
            implode( "\n", $anchors ),
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $links_html = $this->build_links_html( $output['suggestions'] );
        $result     = wp_update_post(
            array(
                'ID'           => $input['post_id'],
                'post_content' => $input['original_content'] . "\n" . $links_html,
            ),
            true
        );

        if ( is_wp_error( $result ) ) {
            return new ActionExecutionResult( false, 'post', (string) $input['post_id'], array(), $result->get_error_message() );
        }

        return new ActionExecutionResult(
            true,
            'post',
            (string) $input['post_id'],
            array(
                'post_id'          => $input['post_id'],
                'previous_content' => $input['original_content'],
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        wp_update_post(
            array(
                'ID'           => $snapshot['post_id'],
                'post_content' => $snapshot['previous_content'],
            )
        );
    }

    /**
     * @param array<int, array{url: string, anchor_text: string}> $suggestions Link suggestions.
     * @return string
     */
    private function build_links_html( array $suggestions ): string {
        $html = '<h2>' . esc_html__( 'Related reading', 'vulopilot' ) . '</h2>' . "\n<ul>\n";

        foreach ( $suggestions as $suggestion ) {
            $html .= '<li><a href="' . esc_url( $suggestion['url'] ) . '">' . esc_html( $suggestion['anchor_text'] ) . '</a></li>' . "\n";
        }

        $html .= '</ul>';

        return $html;
    }
}
