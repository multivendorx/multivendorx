<?php
/**
 * ImproveReadabilityAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIActions\Actions;

use VuloPilotCore\Exceptions\InvalidActionInputException;
use VuloPilotCore\Exceptions\InvalidActionOutputException;
use VuloPilotCore\ValueObjects\ActionExecutionResult;
use VuloPilotCore\ValueObjects\ActionPreview;
use VuloPilotCore\ValueObjects\AIResponse;

defined( 'ABSPATH' ) || exit;

/**
 * The existing-content-rewrite pattern: unlike GenerateAltAction's single
 * postmeta value, this replaces a post's entire `post_content` — a much
 * larger snapshot, and a real risk (an AI rewrite could gut the content)
 * that validate_output() specifically guards against with a length-ratio
 * check. Uses `wp_update_post()` rather than a raw `$wpdb` write, which
 * has the bonus of creating a normal WordPress revision alongside our own
 * snapshot-based rollback — two independent safety nets, not a
 * replacement for either.
 *
 * @class       ImproveReadabilityAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ImproveReadabilityAction extends AbstractBasicAction {

    /**
     * A rewrite shorter than this fraction of the original is treated as
     * a likely truncation/summarization rather than a genuine
     * readability pass, and rejected.
     */
    private const MIN_LENGTH_RATIO = 0.5;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'improve-readability';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Improve readability', 'vulopilot' );
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
                'content' => 'You improve the readability of WordPress post content: shorter sentences, active voice, '
                    . 'clearer paragraph breaks. Preserve every HTML tag, the overall structure, and all factual claims exactly. '
                    . 'Do not add or remove information. Respond with ONLY the rewritten HTML content — no commentary.',
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
                __( 'The AI returned content that looks truncated rather than rewritten — rejected for safety.', 'vulopilot' )
            );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            __( 'Rewrite content for readability', 'vulopilot' ),
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
