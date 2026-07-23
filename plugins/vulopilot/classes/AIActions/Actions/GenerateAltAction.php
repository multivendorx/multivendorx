<?php
/**
 * GenerateAltAction class file.
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
 * AI-ACTIONS.md's flagship example, and the metadata-only-write pattern:
 * execute() touches exactly one postmeta value, so its snapshot/rollback
 * shape is the simplest of the four built-in actions. Naturally pairs
 * with RuleEngine\Rules\MissingAltTextRule's recommendations (same
 * underlying concept — see AI-ACTIONS.md's "Recommendations as an input
 * source" for how the two connect without a hard-coded cross-reference).
 *
 * @class       GenerateAltAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateAltAction extends AbstractBasicAction {

    private const META_KEY = '_wp_attachment_image_alt';

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-alt';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate ALT text', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $attachment_id = absint( $input['attachment_id'] ?? 0 );

        if ( ! $attachment_id || 'attachment' !== get_post_type( $attachment_id ) ) {
            throw new InvalidActionInputException( __( 'attachment_id must refer to an existing media attachment.', 'vulopilot' ) );
        }

        if ( ! wp_attachment_is_image( $attachment_id ) ) {
            throw new InvalidActionInputException( __( 'This attachment is not an image.', 'vulopilot' ) );
        }

        return array( 'attachment_id' => $attachment_id );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        $attachment_id = $input['attachment_id'];
        $filename      = wp_basename( (string) get_attached_file( $attachment_id ) );
        $parent_id     = (int) wp_get_post_parent_id( $attachment_id );

        return array(
            array(
                'role'    => 'system',
                'content' => 'You write concise, descriptive image alt text for website accessibility and SEO. '
                    . 'Respond with ONLY the alt text itself — no quotes, no preamble, no explanation. Keep it under 125 characters.',
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Image filename: %s\nUsed on page titled: %s\n\nWrite alt text for this image.",
                    $filename,
                    $parent_id ? get_the_title( $parent_id ) : '(unknown)'
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        return array( 'alt_text' => trim( $response->get_content(), " \t\n\r\0\x0B\"'" ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $alt_text = $output['alt_text'] ?? '';

        if ( '' === $alt_text ) {
            throw new InvalidActionOutputException( __( 'The AI returned empty alt text.', 'vulopilot' ) );
        }

        if ( mb_strlen( $alt_text ) > 250 ) {
            throw new InvalidActionOutputException( __( 'The AI returned alt text that is too long.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        $current = get_post_meta( $input['attachment_id'], self::META_KEY, true );

        return new ActionPreview(
            sprintf(
                /* translators: %s is the image filename. */
                __( 'Set alt text for %s', 'vulopilot' ),
                wp_basename( (string) get_attached_file( $input['attachment_id'] ) )
            ),
            '' !== $current ? $current : null,
            $output['alt_text'],
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $attachment_id  = $input['attachment_id'];
        $previous_value = get_post_meta( $attachment_id, self::META_KEY, true );

        $updated = update_post_meta( $attachment_id, self::META_KEY, $output['alt_text'] );

        if ( ! $updated ) {
            return new ActionExecutionResult( false, 'attachment', (string) $attachment_id, array(), __( 'Could not update the attachment.', 'vulopilot' ) );
        }

        return new ActionExecutionResult(
            true,
            'attachment',
            (string) $attachment_id,
            array(
                'attachment_id'  => $attachment_id,
                'previous_value' => $previous_value,
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        update_post_meta( $snapshot['attachment_id'], self::META_KEY, $snapshot['previous_value'] );
    }
}
