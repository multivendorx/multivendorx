<?php
/**
 * GenerateExcerptAction class file.
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
 * Readme.txt's "AI Content Assistant" → "Excerpts" — writes to the native
 * `post_excerpt` field via `wp_update_post()`, the field WordPress itself
 * uses for archive/listing-page teasers. This targets the same field as
 * WriteMetaDescriptionAction (SEO-MODULE.md's fix for
 * MissingMetaDescriptionRule) — WordPress core has exactly one native
 * "excerpt" concept, so both actions necessarily write to it; running one
 * after the other will overwrite the other's result. That's an inherent
 * property of `post_excerpt` being a single field, not a bug introduced
 * here — the two actions differ in *what* they generate (a 1-2 sentence
 * reader-facing teaser here, versus a strict sub-160-character search
 * snippet there), and a site owner picking "Generate excerpt" is
 * consciously choosing this action's framing over the other's.
 *
 * @class       GenerateExcerptAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateExcerptAction extends AbstractBasicAction {

    /**
     * A teaser reads as padded rather than a hook past this length.
     */
    private const MAX_LENGTH = 300;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-excerpt';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate excerpt', 'vulopilot' );
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
            throw new InvalidActionInputException( __( 'This post has no content to summarize.', 'vulopilot' ) );
        }

        return array(
            'post_id'          => $post_id,
            'title'            => $post->post_title,
            'content'          => $post->post_content,
            'previous_excerpt' => $post->post_excerpt,
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => sprintf(
                    'You write inviting teaser excerpts for blog/archive listing pages — the kind a reader sees before '
                        . 'clicking through to the full article. Write 1-2 natural sentences, under %d characters, that make '
                        . 'someone want to read more. This is not a search-engine snippet — do not just summarize, hook the reader. '
                        . 'Respond with ONLY the excerpt itself — no quotes, no preamble.',
                    self::MAX_LENGTH
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Title: %s\n\nContent:\n%s",
                    $input['title'],
                    wp_trim_words( wp_strip_all_tags( $input['content'] ), 200 )
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        return array( 'excerpt' => trim( $response->get_content(), " \t\n\r\0\x0B\"'" ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $excerpt = $output['excerpt'] ?? '';

        if ( '' === $excerpt ) {
            throw new InvalidActionOutputException( __( 'The AI returned an empty excerpt.', 'vulopilot' ) );
        }

        if ( mb_strlen( $excerpt ) > self::MAX_LENGTH * 2 ) {
            throw new InvalidActionOutputException( __( 'The AI returned an excerpt that is too long.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            sprintf(
                /* translators: %s is the post/page title. */
                __( 'Set excerpt for %s', 'vulopilot' ),
                $input['title']
            ),
            '' !== $input['previous_excerpt'] ? $input['previous_excerpt'] : null,
            $output['excerpt'],
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $result = wp_update_post(
            array(
                'ID'           => $input['post_id'],
                'post_excerpt' => $output['excerpt'],
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
                'previous_excerpt' => $input['previous_excerpt'],
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
                'post_excerpt' => $snapshot['previous_excerpt'],
            )
        );
    }
}
