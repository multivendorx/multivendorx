<?php
/**
 * GenerateSchemaAction class file.
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
 * The content-append pattern: unlike ImproveReadabilityAction rewriting
 * `post_content` itself, this adds a new, independent piece of data
 * (JSON-LD structured data) alongside a post without touching its
 * existing content at all — stored in VuloPilot's own postmeta key, not
 * written into `post_content` or any SEO plugin's own meta key.
 *
 * Pairs conceptually with Scanners\Basic\SchemaScanner, which flags pages
 * with no structured data at all — this is the fix for that finding.
 *
 * Actually *outputting* this JSON-LD on the frontend (a `wp_head` hook
 * reading `_vulopilot_schema_json`) isn't built yet — see AI-ACTIONS.md's
 * "What's not here yet". This action's job ends at saving valid schema
 * data; rendering it is a separate, still-needed piece.
 *
 * @class       GenerateSchemaAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateSchemaAction extends AbstractBasicAction {

    private const META_KEY = '_vulopilot_schema_json';

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-schema';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate structured data (JSON-LD)', 'vulopilot' );
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

        return array( 'post_id' => $post_id );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        $post = get_post( $input['post_id'] );

        return array(
            array(
                'role'    => 'system',
                'content' => 'You write valid schema.org JSON-LD structured data for web pages. '
                    . 'Respond with ONLY the raw JSON — no markdown code fences, no commentary. '
                    . 'Use the "Article" type unless the content clearly describes a product, recipe, or event.',
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Page title: %s\nPage URL: %s\nContent excerpt: %s\n\nWrite JSON-LD structured data for this page.",
                    $post->post_title,
                    get_permalink( $post ),
                    wp_trim_words( wp_strip_all_tags( $post->post_content ), 60 )
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        // Models frequently wrap JSON in ```json fences despite being
        // asked not to — strip that before attempting to decode.
        $content = preg_replace( '/^```(?:json)?\s*|\s*```$/', '', trim( $response->get_content() ) );

        return array( 'schema_json' => trim( $content ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $decoded = json_decode( $output['schema_json'] ?? '', true );

        if ( ! is_array( $decoded ) || ! isset( $decoded['@context'], $decoded['@type'] ) ) {
            throw new InvalidActionOutputException(
                __( 'The AI did not return valid schema.org JSON-LD (missing @context/@type).', 'vulopilot' )
            );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        $current = get_post_meta( $input['post_id'], self::META_KEY, true );

        return new ActionPreview(
            __( 'Add structured data to this page', 'vulopilot' ),
            '' !== $current ? $current : null,
            wp_json_encode( json_decode( $output['schema_json'], true ), JSON_PRETTY_PRINT ),
            'json'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $post_id        = $input['post_id'];
        $previous_value = get_post_meta( $post_id, self::META_KEY, true );

        update_post_meta( $post_id, self::META_KEY, $output['schema_json'] );

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
