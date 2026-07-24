<?php
/**
 * WriteProductShortDescriptionAction class file.
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
 * Closes RuleEngine\Rules\MissingProductShortDescriptionRule's fix loop —
 * writes to `post_excerpt`, the exact field WooCommerce renders next to
 * the add-to-cart button as the product's short description.
 *
 * @class       WriteProductShortDescriptionAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WriteProductShortDescriptionAction extends AbstractBasicAction {

    private const MAX_LENGTH = 300;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'write-product-short-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Write product short description', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_id = absint( $input['post_id'] ?? 0 );
        $product = $post_id ? wc_get_product( $post_id ) : null;

        if ( ! $product ) {
            throw new InvalidActionInputException( __( 'post_id must refer to an existing product.', 'vulopilot' ) );
        }

        return array(
            'post_id'                    => $post_id,
            'title'                      => $product->get_name(),
            'long_description'           => wp_strip_all_tags( $product->get_description() ),
            'previous_short_description' => $product->get_short_description(),
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
                    'You write short, persuasive e-commerce product summaries shown next to the add-to-cart button. '
                        . '1-2 sentences, focused on the single most compelling reason to buy. '
                        . 'Respond with ONLY the summary — no quotes, no preamble. Keep it under %d characters.',
                    self::MAX_LENGTH
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Product: %s\n\nFull description:\n%s",
                    $input['title'],
                    wp_trim_words( $input['long_description'], 150 ) ?: '(no description available)'
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        return array( 'short_description' => trim( $response->get_content(), " \t\n\r\0\x0B\"'" ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $short_description = $output['short_description'] ?? '';

        if ( '' === $short_description ) {
            throw new InvalidActionOutputException( __( 'The AI returned an empty short description.', 'vulopilot' ) );
        }

        if ( mb_strlen( $short_description ) > self::MAX_LENGTH * 2 ) {
            throw new InvalidActionOutputException( __( 'The AI returned a short description that is too long.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            sprintf(
                /* translators: %s is the product's name. */
                __( 'Set short description for %s', 'vulopilot' ),
                $input['title']
            ),
            '' !== $input['previous_short_description'] ? $input['previous_short_description'] : null,
            $output['short_description'],
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $result = wp_update_post(
            array(
                'ID'           => $input['post_id'],
                'post_excerpt' => $output['short_description'],
            ),
            true
        );

        if ( is_wp_error( $result ) ) {
            return new ActionExecutionResult( false, 'product', (string) $input['post_id'], array(), $result->get_error_message() );
        }

        return new ActionExecutionResult(
            true,
            'product',
            (string) $input['post_id'],
            array(
                'post_id'                    => $input['post_id'],
                'previous_short_description' => $input['previous_short_description'],
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
                'post_excerpt' => $snapshot['previous_short_description'],
            )
        );
    }
}
