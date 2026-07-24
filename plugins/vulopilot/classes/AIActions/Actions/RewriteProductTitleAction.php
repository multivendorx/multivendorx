<?php
/**
 * RewriteProductTitleAction class file.
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
 * WooCommerce AI's "AI Improvements" pass (ARCHITECTURE.md's Prompt 11) —
 * rewrites a product's title (`post_title`) for clarity/SEO. Shaped like
 * WriteMetaDescriptionAction's `wp_update_post()` write (gets a WordPress
 * revision as a bonus safety net), restricted to `post_type = 'product'`
 * rather than reusing any of the generic post/page actions, since a
 * product title carries commerce-specific expectations (brand, size,
 * material) a generic post title rewrite has no reason to preserve.
 *
 * @class       RewriteProductTitleAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RewriteProductTitleAction extends AbstractBasicAction {

    private const MAX_LENGTH = 140;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'rewrite-product-title';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Rewrite product title', 'vulopilot' );
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
            'post_id'        => $post_id,
            'previous_title' => $product->get_name(),
            'short_desc'     => wp_strip_all_tags( $product->get_short_description() ),
            'categories'     => wp_list_pluck( wc_get_product_terms( $post_id, 'product_cat' ), 'name' ),
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
                    'You write clear, specific e-commerce product titles. Keep the core product identity, '
                        . 'improve clarity and searchability. Respond with ONLY the new title — no quotes, no preamble. '
                        . 'Keep it under %d characters.',
                    self::MAX_LENGTH
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Current title: %s\nCategories: %s\nShort description: %s\n\nRewrite this product title.",
                    $input['previous_title'],
                    implode( ', ', $input['categories'] ) ?: '(none)',
                    $input['short_desc'] ?: '(none)'
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
            __( 'Rewrite product title', 'vulopilot' ),
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
            return new ActionExecutionResult( false, 'product', (string) $input['post_id'], array(), $result->get_error_message() );
        }

        return new ActionExecutionResult(
            true,
            'product',
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
