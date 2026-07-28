<?php
/**
 * DifferentiateDuplicateTitleAction class file.
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
 * Fixes Scanners\Basic\DuplicateContentScanner's finding: two or more
 * published posts sharing the exact same title. That scanner's Finding
 * has a real, deliberate quirk this action's input has to work around:
 * `object_ref` is a COMMA-JOINED LIST of every matching post id (e.g.
 * "12,45,78"), not a single id, because the finding is inherently about a
 * group, not one post. `object_type` is still 'post', so
 * ScannerFixMap/FindingFixRest still resolve a `post_id` input key from it
 * as normal — but naively `absint()`-ing a comma-joined string only ever
 * parses its leading numeric prefix, silently operating on the wrong (or
 * an arbitrary) post. This action instead reads the finding's own `meta`
 * column, which DuplicateContentScanner already stores as a real
 * `post_ids` array (merged into this action's raw input by
 * FindingFixRest's generic meta-merge — no ScannerFixMap/FindingFixRest
 * change needed) and uses THAT, ignoring whatever `post_id` a naive
 * comma-string parse would have produced.
 *
 * Only ONE of the duplicate posts is rewritten — the one with the
 * HIGHEST id in the group (DuplicateContentScanner's own matching-ids
 * query has no explicit ORDER BY, but MySQL returns them in primary-key
 * order for an unordered SELECT on an indexed PK in practice, so the
 * highest id is reliably the most-recently-created post: the one that
 * introduced the conflict against pre-existing content, not the original).
 * The other posts in the group are left untouched.
 *
 * @class       DifferentiateDuplicateTitleAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class DifferentiateDuplicateTitleAction extends AbstractBasicAction {

    /**
     * A rewritten title longer than this is rejected as a run-on AI
     * response rather than a genuine title.
     */
    private const MAX_LENGTH = 150;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'differentiate-duplicate-title';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Differentiate duplicate title', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_ids = array_values( array_unique( array_filter( array_map( 'absint', (array) ( $input['post_ids'] ?? array() ) ) ) ) );

        if ( count( $post_ids ) < 2 ) {
            throw new InvalidActionInputException( __( 'post_ids must list at least 2 posts sharing a duplicate title.', 'vulopilot' ) );
        }

        sort( $post_ids );
        $target_id = array_pop( $post_ids ); // Highest id — see this class's own docblock for why.
        $post      = get_post( $target_id );

        if ( ! $post || 'publish' !== $post->post_status ) {
            throw new InvalidActionInputException( __( 'The targeted duplicate post no longer exists or is not published.', 'vulopilot' ) );
        }

        $sibling_titles = array();

        foreach ( $post_ids as $sibling_id ) {
            $sibling = get_post( $sibling_id );

            if ( $sibling ) {
                $sibling_titles[] = $sibling->post_title;
            }
        }

        if ( empty( $sibling_titles ) ) {
            throw new InvalidActionInputException( __( 'None of the other posts sharing this title still exist.', 'vulopilot' ) );
        }

        return array(
            'post_id'        => $target_id,
            'previous_title' => $post->post_title,
            'content'        => $post->post_content,
            'sibling_titles' => $sibling_titles,
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
                    'This page shares its exact title with %d other published page(s) on the same site, which splits '
                        . 'search ranking signal between them. Write ONE new title for THIS page that stays accurate to '
                        . 'its own content but is clearly distinct from the shared title. Respond with ONLY the new '
                        . 'title — no quotes, no preamble, no explanation.',
                    count( $input['sibling_titles'] )
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Current (duplicated) title: %s\n\nContent:\n%s",
                    $input['previous_title'],
                    wp_trim_words( wp_strip_all_tags( $input['content'] ), 150 )
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        return array( 'title' => trim( $response->get_content(), " \t\n\r\0\x0B\"'" ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $title = $output['title'] ?? '';

        if ( '' === $title ) {
            throw new InvalidActionOutputException( __( 'The AI returned an empty title.', 'vulopilot' ) );
        }

        if ( mb_strlen( $title ) > self::MAX_LENGTH ) {
            throw new InvalidActionOutputException( __( 'The AI returned a title that is too long.', 'vulopilot' ) );
        }

        if ( 0 === strcasecmp( trim( $title ), trim( $input['previous_title'] ) ) ) {
            throw new InvalidActionOutputException( __( 'The AI returned the same title unchanged — rejected.', 'vulopilot' ) );
        }

        foreach ( $input['sibling_titles'] as $sibling_title ) {
            if ( 0 === strcasecmp( trim( $title ), trim( $sibling_title ) ) ) {
                throw new InvalidActionOutputException( __( 'The AI returned a title that duplicates another post\'s title — rejected.', 'vulopilot' ) );
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            __( 'Rewrite this page\'s duplicated title', 'vulopilot' ),
            $input['previous_title'],
            $output['title'],
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $result = wp_update_post(
            array(
                'ID'         => $input['post_id'],
                'post_title' => $output['title'],
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
                'post_id'        => $input['post_id'],
                'previous_title' => $input['previous_title'],
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        wp_update_post(
            array(
                'ID'         => $snapshot['post_id'],
                'post_title' => $snapshot['previous_title'],
            )
        );
    }
}
