<?php
/**
 * GenerateAuthorBioAction class file.
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
 * GEO-MODULE.md's fix for both GeoAuthorInfoScanner's and
 * GeoEeatSignalsScanner's findings — both are only ever raised because the
 * post's author has no bio (`get_the_author_meta('description')`;
 * GeoEeatSignalsScanner's own docblock explains its check only fires when
 * *neither* of two signals is present, so filling in the bio alone is
 * enough to resolve either finding on the next scan). Unlike every other
 * action in this folder, the thing mutated is the *author's user account*,
 * not the post itself — this action's input is only ever a post id, used
 * to resolve which author to write a bio for.
 *
 * @class       GenerateAuthorBioAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateAuthorBioAction extends AbstractBasicAction {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-author-bio';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate author bio', 'vulopilot' );
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

        $author_id = (int) $post->post_author;
        $author    = get_userdata( $author_id );

        if ( ! $author ) {
            throw new InvalidActionInputException( __( 'This post has no valid author to write a bio for.', 'vulopilot' ) );
        }

        $existing_bio = (string) get_the_author_meta( 'description', $author_id );

        if ( '' !== trim( $existing_bio ) ) {
            throw new InvalidActionInputException( __( 'This author already has a bio — there is nothing to fix.', 'vulopilot' ) );
        }

        return array(
            'author_id'    => $author_id,
            'author_name'  => $author->display_name,
            'post_title'   => $post->post_title,
            'post_excerpt' => wp_trim_words( wp_strip_all_tags( $post->post_content ), 60 ),
            'previous_bio' => $existing_bio,
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => 'You write short, professional author bios for a website byline. Write 2-3 sentences '
                    . 'establishing the author\'s expertise/relevance to the kind of content they write, based on the '
                    . 'sample article given. Do not invent specific credentials, employers, or affiliations that cannot '
                    . 'be reasonably inferred from the sample. Respond with ONLY the bio text — no commentary, no quotes.',
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Author name: %s\n\nSample article title: %s\n\nSample article excerpt:\n%s",
                    $input['author_name'],
                    $input['post_title'],
                    $input['post_excerpt']
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        return array( 'bio' => trim( wp_strip_all_tags( $response->get_content() ) ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        if ( '' === ( $output['bio'] ?? '' ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not return any bio text.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            sprintf(
                /* translators: %s is the author's display name. */
                __( 'Add an author bio for %s', 'vulopilot' ),
                $input['author_name']
            ),
            null,
            $output['bio'],
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $bio     = sanitize_textarea_field( $output['bio'] );
        $updated = update_user_meta( $input['author_id'], 'description', $bio );

        if ( ! $updated ) {
            return new ActionExecutionResult( false, 'user', (string) $input['author_id'], array(), __( 'Could not save the author bio.', 'vulopilot' ) );
        }

        return new ActionExecutionResult(
            true,
            'user',
            (string) $input['author_id'],
            array(
                'author_id'    => $input['author_id'],
                'previous_bio' => $input['previous_bio'],
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        update_user_meta( $snapshot['author_id'], 'description', $snapshot['previous_bio'] );
    }
}
