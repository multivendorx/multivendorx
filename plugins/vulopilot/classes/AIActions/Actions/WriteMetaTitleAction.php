<?php
/**
 * WriteMetaTitleAction class file.
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
 * Closes RuleEngine\Rules\SeoTitleRewriteRule's fix loop — that rule is
 * already registered in RuleRegistry but had no matching action until
 * now (verified against AI-ACTIONS.md's by-convention id/concept
 * matching, the same way WriteMetaDescriptionAction closes
 * MissingMetaDescriptionRule's). Writes directly to the native
 * `post_title` field (the same field Scanners\Basic\SeoScanner checks
 * the length of) via wp_update_post(), rather than a dedicated postmeta
 * key — a deliberate choice: it's the only way this actually changes
 * what search engines/visitors see, at the cost of being a more visible
 * change (page <h1>, post lists, RSS) than WriteMetaDescriptionAction's
 * post_excerpt write. Same propose/approve/rollback safety net (a real
 * wp_update_post() write also gets a WordPress revision as a bonus).
 *
 * @class       WriteMetaTitleAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WriteMetaTitleAction extends AbstractBasicAction {

    /**
     * Matches SeoScanner's own TITLE_MIN_LENGTH/TITLE_MAX_LENGTH thresholds.
     */
    private const MIN_LENGTH = 10;
    private const MAX_LENGTH = 60;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'write-meta-title';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Write meta title', 'vulopilot' );
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

        return array(
            'post_id'        => $post_id,
            'previous_title' => $post->post_title,
            'content'        => $post->post_content,
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
                    'You write SEO-optimized page titles for search engine results. '
                        . 'Write one title, between %1$d and %2$d characters. '
                        . 'Respond with ONLY the title itself — no quotes, no preamble.',
                    self::MIN_LENGTH,
                    self::MAX_LENGTH
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Current title: %s\n\nContent:\n%s",
                    $input['previous_title'],
                    wp_trim_words( wp_strip_all_tags( $input['content'] ), 200 )
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

        if ( mb_strlen( $title ) > self::MAX_LENGTH * 2 ) {
            throw new InvalidActionOutputException( __( 'The AI returned a title that is too long.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            __( 'Rewrite page title', 'vulopilot' ),
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
