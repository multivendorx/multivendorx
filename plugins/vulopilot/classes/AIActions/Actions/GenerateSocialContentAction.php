<?php
/**
 * GenerateSocialContentAction class file.
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
 * A social-media caption has no native WordPress field to write into
 * (unlike a title/excerpt/content), so this follows GenerateSchemaAction's
 * dedicated-postmeta pattern: stores the generated captions in
 * `_vulopilot_social_captions` without touching the post's visible
 * content at all. Same known, acceptable limitation GenerateSchemaAction
 * already has — nothing on the site surfaces this meta key yet; this
 * action's job ends at generating and saving good captions.
 *
 * @class       GenerateSocialContentAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateSocialContentAction extends AbstractBasicAction {

    private const META_KEY     = '_vulopilot_social_captions';
    private const MIN_VARIANTS = 2;
    private const MAX_VARIANTS = 3;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-social-content';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate social media content', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_id = absint( $input['post_id'] ?? 0 );
        $post    = $post_id ? get_post( $post_id ) : null;

        if ( ! $post || 'publish' !== $post->post_status ) {
            throw new InvalidActionInputException( __( 'post_id must refer to a published post or page.', 'vulopilot' ) );
        }

        return array(
            'post_id' => $post_id,
            'title'   => $post->post_title,
            'content' => $post->post_content,
            'url'     => get_permalink( $post ),
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
                    'You write short social media captions promoting a piece of web content. Produce %1$d-%2$d distinct '
                        . 'caption variants, each under 280 characters, that make someone want to click through and read. '
                        . 'Respond with ONLY a raw JSON array of strings like ["...", "..."] — no markdown fences, no commentary.',
                    self::MIN_VARIANTS,
                    self::MAX_VARIANTS
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Title: %s\nURL: %s\n\nContent:\n%s",
                    $input['title'],
                    $input['url'],
                    wp_trim_words( wp_strip_all_tags( $input['content'] ), 200 )
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        $content = preg_replace( '/^```(?:json)?\s*|\s*```$/', '', trim( $response->get_content() ) );
        $decoded = json_decode( trim( (string) $content ), true );

        return array( 'captions' => is_array( $decoded ) ? $decoded : array() );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $captions = $output['captions'] ?? array();

        if ( empty( $captions ) || ! is_array( $captions ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not return any caption variants.', 'vulopilot' ) );
        }

        foreach ( $captions as $caption ) {
            if ( ! is_string( $caption ) || '' === trim( $caption ) ) {
                throw new InvalidActionOutputException( __( 'The AI returned an empty caption variant.', 'vulopilot' ) );
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        $current = get_post_meta( $input['post_id'], self::META_KEY, true );

        return new ActionPreview(
            sprintf(
                /* translators: %d is the number of caption variants generated. */
                __( 'Save %d social caption variant(s) for this page', 'vulopilot' ),
                count( $output['captions'] )
            ),
            ! empty( $current ) ? wp_json_encode( $current ) : null,
            implode( "\n\n", $output['captions'] ),
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $post_id        = $input['post_id'];
        $previous_value = get_post_meta( $post_id, self::META_KEY, true );

        update_post_meta( $post_id, self::META_KEY, $output['captions'] );

        return new ActionExecutionResult(
            true,
            'post',
            (string) $post_id,
            array(
                'post_id'        => $post_id,
                'previous_value' => $previous_value,
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        if ( '' === $snapshot['previous_value'] ) {
            delete_post_meta( $snapshot['post_id'], self::META_KEY );
            return;
        }

        update_post_meta( $snapshot['post_id'], self::META_KEY, $snapshot['previous_value'] );
    }
}
