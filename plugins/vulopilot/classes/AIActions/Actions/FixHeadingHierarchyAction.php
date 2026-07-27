<?php
/**
 * FixHeadingHierarchyAction class file.
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
 * GEO-MODULE.md's fix for GeoSemanticStructureScanner's finding — the
 * same existing-content-rewrite pattern as ImproveReadabilityAction,
 * scoped to renumbering only heading tag levels. `validate_output()` goes
 * one step further than a plain length-ratio check: it re-runs the exact
 * same heading-order skip definition GeoSemanticStructureScanner itself
 * uses (duplicated here rather than a cross-namespace dependency, the
 * same tradeoff ScannerFixMap's own docblock already accepts) so an AI
 * rewrite that fails to actually resolve the skip is rejected rather than
 * silently accepted as "fixed."
 *
 * @class       FixHeadingHierarchyAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class FixHeadingHierarchyAction extends AbstractBasicAction {

    /**
     * A rewrite shorter than this fraction of the original is treated as
     * more than a heading-tag renumbering pass and rejected.
     */
    private const MIN_LENGTH_RATIO = 0.95;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'fix-heading-hierarchy';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Fix heading hierarchy', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_id = absint( $input['post_id'] ?? 0 );
        $post    = $post_id ? get_post( $post_id ) : null;

        if ( ! $post || ! in_array( $post->post_type, array( 'post', 'page' ), true ) ) {
            throw new InvalidActionInputException( __( 'post_id must refer to an existing post or page.', 'vulopilot' ) );
        }

        if ( ! $this->has_heading_level_skip( $post->post_content ) ) {
            throw new InvalidActionInputException( __( 'This post\'s heading levels do not skip — there is nothing to fix.', 'vulopilot' ) );
        }

        return array(
            'post_id'          => $post_id,
            'original_content' => $post->post_content,
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => 'This content\'s heading tags (h1-h6) skip a level at least once (e.g. an <h2> followed '
                    . 'later by an <h4> with no <h3> anywhere between them), which breaks the document outline AI '
                    . 'systems and screen readers rely on. Renumber ONLY the heading tag levels so each heading is never '
                    . 'more than one level deeper than the heading immediately before it — never change heading text, '
                    . 'never change any other tag, never change the body content. Respond with ONLY the full rewritten '
                    . 'HTML content — no commentary.',
            ),
            array(
                'role'    => 'user',
                'content' => $input['original_content'],
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        return array( 'rewritten_content' => trim( $response->get_content() ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $rewritten = $output['rewritten_content'] ?? '';

        if ( '' === trim( wp_strip_all_tags( $rewritten ) ) ) {
            throw new InvalidActionOutputException( __( 'The AI returned empty content.', 'vulopilot' ) );
        }

        $original_length  = mb_strlen( wp_strip_all_tags( $input['original_content'] ) );
        $rewritten_length = mb_strlen( wp_strip_all_tags( $rewritten ) );

        if ( $original_length > 0 && ( $rewritten_length / $original_length ) < self::MIN_LENGTH_RATIO ) {
            throw new InvalidActionOutputException(
                __( 'The AI returned content that looks truncated rather than a targeted rewrite — rejected for safety.', 'vulopilot' )
            );
        }

        if ( $this->has_heading_level_skip( $rewritten ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not resolve the heading level skip — rejected.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            __( 'Fix skipped heading levels in this content', 'vulopilot' ),
            wp_trim_words( wp_strip_all_tags( $input['original_content'] ), 30 ),
            wp_trim_words( wp_strip_all_tags( $output['rewritten_content'] ), 30 ),
            'html'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $result = wp_update_post(
            array(
                'ID'           => $input['post_id'],
                'post_content' => $output['rewritten_content'],
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
     * Same heading-order skip definition as
     * GeoSemanticStructureScanner::has_heading_level_skip() — duplicated
     * here (rather than a cross-namespace dependency) to re-verify the
     * AI's rewrite actually resolved the skip before accepting it.
     *
     * @param string $content Post content (raw HTML).
     * @return bool
     */
    private function has_heading_level_skip( string $content ): bool {
        if ( ! preg_match_all( '/<h([1-6])[\s>]/i', $content, $matches ) ) {
            return false;
        }

        $levels   = array_map( 'intval', $matches[1] );
        $previous = $levels[0];

        for ( $i = 1, $count = count( $levels ); $i < $count; $i++ ) {
            if ( $levels[ $i ] > $previous + 1 ) {
                return true;
            }

            $previous = $levels[ $i ];
        }

        return false;
    }
}
