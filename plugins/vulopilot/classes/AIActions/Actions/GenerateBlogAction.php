<?php
/**
 * GenerateBlogAction class file.
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
 * The new-content-creation pattern — the odd one out among the four
 * built-in actions: its input is a topic the site owner types, not a
 * Recommendation's object_type/object_ref (there's no existing post or
 * attachment this operates on; see AI-ACTIONS.md's "Why this supersedes
 * AIJobHandlerInterface" for why that distinction is exactly what forced
 * AIActionInterface's input to be a plain array rather than tied to a
 * Recommendation).
 *
 * execute() always creates a `draft`, never `publish` — approving this
 * action only approves *generating* a draft for a human to review, not
 * putting AI-written content live unsupervised. rollback() trashes the
 * created post rather than force-deleting it, so WordPress's own
 * trash/restore safety net still applies on top of ours.
 *
 * @class       GenerateBlogAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateBlogAction extends AbstractBasicAction {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-blog';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate blog post', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $topic = sanitize_text_field( (string) ( $input['topic'] ?? '' ) );

        if ( mb_strlen( $topic ) < 5 ) {
            throw new InvalidActionInputException( __( 'Please provide a topic of at least 5 characters.', 'vulopilot' ) );
        }

        return array( 'topic' => $topic );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => 'You write WordPress blog post drafts. Respond in exactly this format, nothing else:'
                    . "\nTITLE: <the title>\n\nBODY:\n<the full post body as HTML paragraphs>",
            ),
            array(
                'role'    => 'user',
                'content' => sprintf( 'Write a blog post about: %s', $input['topic'] ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        $content = $response->get_content();

        preg_match( '/TITLE:\s*(.+?)\n/i', $content, $title_match );
        preg_match( '/BODY:\s*(.+)/is', $content, $body_match );

        return array(
            'title' => trim( $title_match[1] ?? '' ),
            'body'  => trim( $body_match[1] ?? '' ),
        );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        if ( '' === ( $output['title'] ?? '' ) || '' === ( $output['body'] ?? '' ) ) {
            throw new InvalidActionOutputException(
                __( 'The AI response did not match the expected TITLE/BODY format.', 'vulopilot' )
            );
        }

        if ( mb_strlen( wp_strip_all_tags( $output['body'] ) ) < 100 ) {
            throw new InvalidActionOutputException( __( 'The AI returned a post body that is too short to be useful.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            sprintf(
                /* translators: %s is the generated post title. */
                __( 'Create a new draft post: %s', 'vulopilot' ),
                $output['title']
            ),
            null,
            wp_trim_words( wp_strip_all_tags( $output['body'] ), 40 ),
            'html'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $post_id = wp_insert_post(
            array(
                'post_title'   => $output['title'],
                'post_content' => $output['body'],
                'post_status'  => 'draft',
                'post_type'    => 'post',
            ),
            true
        );

        if ( is_wp_error( $post_id ) ) {
            return new ActionExecutionResult( false, null, null, array(), $post_id->get_error_message() );
        }

        return new ActionExecutionResult(
            true,
            'post',
            (string) $post_id,
            array( 'created_post_id' => $post_id )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        wp_trash_post( $snapshot['created_post_id'] );
    }
}
