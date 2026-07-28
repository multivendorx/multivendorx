<?php
/**
 * SplitLongParagraphsAction class file.
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
 * GEO-MODULE.md's fix for GeoChunkingScanner's finding — the same
 * existing-content-rewrite pattern as ImproveReadabilityAction, scoped to
 * a narrower instruction (split paragraphs over
 * GeoChunkingScanner::MAX_PARAGRAPH_WORD_COUNT words at natural sentence
 * boundaries, change nothing else) so a re-scan's
 * `longest_paragraph_word_count()` check comes back under threshold
 * without the rest of the content being touched.
 *
 * @class       SplitLongParagraphsAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SplitLongParagraphsAction extends AbstractBasicAction {

    /**
     * A rewrite shorter than this fraction of the original is treated as
     * more than a paragraph-break pass and rejected — splitting a
     * paragraph shouldn't meaningfully change the total word count, so
     * this stays tighter than ImproveReadabilityAction's own guard.
     */
    private const MIN_LENGTH_RATIO = 0.9;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'split-long-paragraphs';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Split long paragraphs', 'vulopilot' );
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

        if ( '' === trim( wp_strip_all_tags( $post->post_content ) ) ) {
            throw new InvalidActionInputException( __( 'This post has no content to rewrite.', 'vulopilot' ) );
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
                'content' => 'This content contains at least one paragraph over 150 words, which is harder for an AI '
                    . 'system to cleanly retrieve as a single relevant chunk than the same information split into '
                    . 'shorter paragraphs. Find any paragraph over about 150 words and split it into two or more shorter '
                    . 'paragraphs at natural sentence/idea boundaries. Do not change any wording, remove any information, '
                    . 'or touch paragraphs that are already a reasonable length. Preserve every HTML tag exactly. '
                    . 'Respond with ONLY the full rewritten HTML content — no commentary.',
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
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            __( 'Split long paragraphs in this content', 'vulopilot' ),
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
}
