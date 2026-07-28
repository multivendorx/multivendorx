<?php
/**
 * NormalizeEntityNamingAction class file.
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
 * GEO-MODULE.md's fix for GeoEntityNamingConsistencyScanner's finding —
 * the same existing-content-rewrite pattern as ImproveReadabilityAction,
 * scoped to normalizing every spelling/casing/spacing variant of the
 * site's own name down to one exact string. `validate_output()` re-runs
 * the same variant-counting logic the scanner itself uses (duplicated
 * here rather than a cross-namespace dependency, the same tradeoff
 * ScannerFixMap's own docblock already accepts) so an AI rewrite that
 * misses a variant is rejected rather than silently accepted as "fixed."
 *
 * @class       NormalizeEntityNamingAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class NormalizeEntityNamingAction extends AbstractBasicAction {

    /**
     * A rewrite shorter than this fraction of the original is treated as
     * more than a targeted find/replace pass and rejected.
     */
    private const MIN_LENGTH_RATIO = 0.9;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'normalize-entity-naming';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Normalize brand name spelling', 'vulopilot' );
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

        $site_name = trim( (string) get_bloginfo( 'name' ) );

        if ( strlen( $site_name ) < 3 ) {
            throw new InvalidActionInputException( __( 'The site name is too short to normalize reliably.', 'vulopilot' ) );
        }

        return array(
            'post_id'          => $post_id,
            'site_name'        => $site_name,
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
                'content' => sprintf(
                    'This content refers to the site "%1$s" using more than one different spelling/casing/spacing '
                        . 'variant. Find every mention of this brand name, regardless of how it\'s written, and rewrite '
                        . 'it to exactly "%1$s" every time. Change nothing else — no other wording, no other tags. '
                        . 'Respond with ONLY the full rewritten HTML content — no commentary.',
                    $input['site_name']
                ),
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

        if ( $this->count_naming_variants( wp_strip_all_tags( $rewritten ), $input['site_name'] ) > 1 ) {
            throw new InvalidActionOutputException( __( 'The AI did not normalize every spelling variant — rejected.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            __( 'Normalize brand name spelling throughout this content', 'vulopilot' ),
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
     * Same exact-casing/spacing variant-counting logic as
     * GeoEntityNamingConsistencyScanner::find_naming_variants() — used
     * here to confirm the AI actually normalized every variant down to
     * one, not to detect the issue in the first place.
     *
     * @param string $content   Plain-text content to search.
     * @param string $site_name The site's own name.
     * @return int
     */
    private function count_naming_variants( string $content, string $site_name ): int {
        if ( ! preg_match_all( '/' . preg_quote( $site_name, '/' ) . '/i', $content, $matches ) ) {
            return 0;
        }

        return count( array_unique( $matches[0] ) );
    }
}
