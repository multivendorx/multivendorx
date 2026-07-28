<?php
/**
 * AddSubheadingsAction class file.
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
 * Fixes Scanners\Basic\HeadingStructureScanner's finding: 300+ word
 * content with no `<h2>`-`<h6>` tag anywhere in it. Distinct from
 * FixHeadingHierarchyAction, which fixes a different condition (a heading
 * level SKIP, e.g. h2 straight to h4) on content that already HAS
 * subheadings — mapping HeadingStructureScanner's findings to that action
 * instead would reject nearly every real one, since "no headings at all"
 * never has a skip to detect in the first place.
 *
 * Same existing-content-rewrite pattern as FixHeadingHierarchyAction: the
 * AI is asked to insert `<h2>` breaks into the existing prose without
 * changing any wording, not to write new content. `validate_output()`
 * re-runs the exact same "no h2-h6 anywhere" check
 * HeadingStructureScanner itself uses (duplicated here rather than a
 * cross-namespace dependency, the same tradeoff ScannerFixMap's own
 * docblock already accepts) so a rewrite that fails to actually add
 * subheadings is rejected rather than silently accepted as "fixed".
 *
 * @class       AddSubheadingsAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AddSubheadingsAction extends AbstractBasicAction {

    /**
     * A rewrite shorter than this fraction of the original is treated as
     * more than subheadings being inserted and rejected — inserting a
     * handful of short `<h2>text</h2>` tags should barely change the
     * total length, unlike FixHeadingHierarchyAction's pure renumbering
     * pass, so this is intentionally a slightly looser ratio than that
     * action's 0.95 to allow for the added heading text itself.
     */
    private const MIN_LENGTH_RATIO = 0.9;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'add-subheadings';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Add subheadings', 'vulopilot' );
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

        if ( $this->has_subheading( $post->post_content ) ) {
            throw new InvalidActionInputException( __( 'This post already has subheadings — there is nothing to fix.', 'vulopilot' ) );
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
                'content' => 'This content has no subheadings (no <h2> through <h6> tags anywhere), which makes long '
                    . 'content harder for both readers and search engines to scan. Break it into logical sections by '
                    . 'inserting <h2> subheadings at natural topic breaks — write the heading text yourself, based on '
                    . 'what each section actually covers. Do NOT change, remove, or add to the existing wording — every '
                    . 'sentence of the original body text must appear unchanged, just organized under new <h2> headings. '
                    . 'Do not change any other tag. Respond with ONLY the full rewritten HTML content — no commentary.',
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
                __( 'The AI returned content that looks truncated rather than the original text with headings added — rejected for safety.', 'vulopilot' )
            );
        }

        if ( ! $this->has_subheading( $rewritten ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not add any subheadings — rejected.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            __( 'Add subheadings to this content', 'vulopilot' ),
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
     * Same "no h2-h6 tag anywhere" definition as
     * HeadingStructureScanner::scan()'s own inline check — duplicated here
     * to re-verify the AI's rewrite actually added one before accepting it.
     *
     * @param string $content Post content (raw HTML).
     * @return bool
     */
    private function has_subheading( string $content ): bool {
        return 1 === preg_match( '/<h[2-6][\s>]/i', $content );
    }
}
