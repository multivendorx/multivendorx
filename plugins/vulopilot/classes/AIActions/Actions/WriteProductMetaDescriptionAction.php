<?php
/**
 * WriteProductMetaDescriptionAction class file.
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
 * WooCommerce AI's SEO metadata action. Deliberately does NOT reuse
 * WriteMetaDescriptionAction's `post_excerpt` write — for a product,
 * `post_excerpt` is WooCommerce's own visible "short description" field
 * (see WriteProductShortDescriptionAction), a different, on-page piece of
 * copy with a different job than a hidden search-engine-facing meta
 * description. Stored in VuloPilot's own postmeta key instead, the same
 * own-the-data pattern GenerateSchemaAction already uses for JSON-LD —
 * rendering it into `<meta name="description">` isn't built yet, same
 * "not here yet" status GenerateSchemaAction's own docblock documents for
 * its JSON-LD output.
 *
 * @class       WriteProductMetaDescriptionAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WriteProductMetaDescriptionAction extends AbstractBasicAction {

    private const META_KEY   = '_vulopilot_product_seo_description';
    private const MAX_LENGTH = 160;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'write-product-meta-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Write product SEO meta description', 'vulopilot' );
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
            'post_id' => $post_id,
            'title'   => $product->get_name(),
            'summary' => wp_strip_all_tags( $product->get_short_description() ?: $product->get_description() ),
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
                    'You write concise, compelling SEO meta descriptions for e-commerce product pages. '
                        . 'One sentence, under %d characters, focused on what the product is and why to click through from search results. '
                        . 'Respond with ONLY the description — no quotes, no preamble.',
                    self::MAX_LENGTH
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Product: %s\n\nSummary: %s",
                    $input['title'],
                    wp_trim_words( $input['summary'], 100 ) ?: '(no summary available)'
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        return array( 'meta_description' => trim( $response->get_content(), " \t\n\r\0\x0B\"'" ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $meta_description = $output['meta_description'] ?? '';

        if ( '' === $meta_description ) {
            throw new InvalidActionOutputException( __( 'The AI returned an empty meta description.', 'vulopilot' ) );
        }

        if ( mb_strlen( $meta_description ) > self::MAX_LENGTH * 2 ) {
            throw new InvalidActionOutputException( __( 'The AI returned a meta description that is too long.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        $current = get_post_meta( $input['post_id'], self::META_KEY, true );

        return new ActionPreview(
            sprintf(
                /* translators: %s is the product's name. */
                __( 'Set SEO meta description for %s', 'vulopilot' ),
                $input['title']
            ),
            '' !== $current ? $current : null,
            $output['meta_description'],
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $previous_value = get_post_meta( $input['post_id'], self::META_KEY, true );

        update_post_meta( $input['post_id'], self::META_KEY, $output['meta_description'] );

        return new ActionExecutionResult(
            true,
            'product',
            (string) $input['post_id'],
            array(
                'post_id'        => $input['post_id'],
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
