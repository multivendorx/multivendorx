<?php
/**
 * GenerateComparisonPageAction class file.
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
 * Readme.txt's "AI Content Assistant" → "Comparison Pages" — the only
 * action in this codebase whose input is two existing objects rather than
 * one (every other action here, e.g. SuggestInternalLinksAction, anchors
 * on a single post_id and lets the AI pick *from* a candidate list; none
 * take two explicit, user-chosen ids up front). validate_input() loads
 * both posts by id and rejects the pair if either is missing/empty or if
 * the two ids are the same post.
 *
 * The generated comparison is new content (a fresh draft, GenerateBlogAction's
 * shape), not a rewrite of either source post — so unlike a two-object
 * *rewrite* action, there's no ambiguity about which existing object_ref
 * ActionExecutionResult should carry: the newly created draft is the one
 * object this action actually mutates. Both source post ids are kept in
 * the snapshot for traceability even though rollback() only needs the
 * created post id.
 *
 * execute() always creates a `draft`, never `publish`. rollback() trashes
 * the created post.
 *
 * @class       GenerateComparisonPageAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateComparisonPageAction extends AbstractBasicAction {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-comparison-page';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate comparison page', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_a_id = absint( $input['post_a_id'] ?? 0 );
        $post_b_id = absint( $input['post_b_id'] ?? 0 );

        if ( $post_a_id && $post_a_id === $post_b_id ) {
            throw new InvalidActionInputException( __( 'post_a_id and post_b_id must refer to two different items.', 'vulopilot' ) );
        }

        $post_a = $post_a_id ? get_post( $post_a_id ) : null;
        $post_b = $post_b_id ? get_post( $post_b_id ) : null;

        if ( ! $post_a || ! $post_b ) {
            throw new InvalidActionInputException( __( 'post_a_id and post_b_id must both refer to existing posts, pages, or products.', 'vulopilot' ) );
        }

        if ( '' === trim( wp_strip_all_tags( $post_a->post_content ) ) || '' === trim( wp_strip_all_tags( $post_b->post_content ) ) ) {
            throw new InvalidActionInputException( __( 'Both items need existing content to compare.', 'vulopilot' ) );
        }

        return array(
            'post_a_id' => $post_a_id,
            'post_b_id' => $post_b_id,
            'title_a'   => $post_a->post_title,
            'title_b'   => $post_b->post_title,
            'content_a' => $post_a->post_content,
            'content_b' => $post_b->post_content,
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => 'You write balanced, informative comparison pages for two products/items. '
                    . 'Cover key similarities and differences and help the reader decide which fits their needs — do not '
                    . 'simply declare one item better without reasoning. Respond in exactly this format, nothing else:'
                    . "\nTITLE: <e.g. 'A vs B: Which Should You Choose?'>\n\nBODY:\n<the full comparison as HTML, using headings and a summary paragraph>",
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Item A: %s\n\n%s\n\n---\n\nItem B: %s\n\n%s",
                    $input['title_a'],
                    wp_trim_words( wp_strip_all_tags( $input['content_a'] ), 200 ),
                    $input['title_b'],
                    wp_trim_words( wp_strip_all_tags( $input['content_b'] ), 200 )
                ),
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
            throw new InvalidActionOutputException( __( 'The AI returned a comparison that is too short to be useful.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            sprintf(
                /* translators: %s is the generated comparison page title. */
                __( 'Create a new draft comparison page: %s', 'vulopilot' ),
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
            array(
                'created_post_id' => $post_id,
                'post_a_id'       => $input['post_a_id'],
                'post_b_id'       => $input['post_b_id'],
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        wp_trash_post( $snapshot['created_post_id'] );
    }
}
