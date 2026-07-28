<?php
/**
 * GenerateProductDescriptionAction class file.
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
 * Readme.txt's "AI Content Assistant" → "Product Descriptions" — the
 * new-content-creation pattern (GenerateBlogAction's shape: a name/topic
 * the site owner types, not an existing post's object_ref), not a rewrite
 * of an existing product. Deliberately distinct from Pro's WooCommerceAi
 * module (`WriteProductLongDescriptionAction`), which rewrites the
 * `post_content` of an *existing* `WC_Product` the site owner already
 * created — this action instead drafts a brand-new product/page from
 * scratch given just a name and optional key features, the same
 * "propose new content for a human to review" job GenerateBlogAction
 * does for blog posts. Creates a `product` post type draft when
 * WooCommerce is active (so it lands directly in Products → All Products
 * as a draft), otherwise falls back to a plain `post` draft — this action
 * doesn't require WooCommerce to exist, unlike the Pro module.
 *
 * execute() always creates a `draft`, never `publish` — same safety
 * rationale as GenerateBlogAction. rollback() trashes the created post.
 *
 * @class       GenerateProductDescriptionAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateProductDescriptionAction extends AbstractBasicAction {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-product-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate product description', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $product_name = sanitize_text_field( (string) ( $input['product_name'] ?? '' ) );
        $key_features = sanitize_textarea_field( (string) ( $input['key_features'] ?? '' ) );

        if ( mb_strlen( $product_name ) < 3 ) {
            throw new InvalidActionInputException( __( 'Please provide a product name of at least 3 characters.', 'vulopilot' ) );
        }

        return array(
            'product_name' => $product_name,
            'key_features' => $key_features,
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        $user_message = sprintf( 'Product name: %s', $input['product_name'] );

        if ( '' !== $input['key_features'] ) {
            $user_message .= sprintf( "\n\nKey features:\n%s", $input['key_features'] );
        }

        return array(
            array(
                'role'    => 'system',
                'content' => 'You write persuasive, benefit-focused e-commerce product descriptions. '
                    . 'Respond in exactly this format, nothing else:'
                    . "\nTITLE: <a short product title>\n\nBODY:\n<the full description as HTML paragraphs>",
            ),
            array(
                'role'    => 'user',
                'content' => $user_message,
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        $content = $response->get_content();

        preg_match( '/TITLE:\s*(.+?)\n/i', $content, $title_match );
        preg_match( '/BODY:\s*(.+)/is', $content, $body_match );

        return array(
            'title' => trim( $title_match[1] ?? '' ),
            'body'  => trim( $body_match[1] ?? '' ),
        );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        if ( '' === ( $output['title'] ?? '' ) || '' === ( $output['body'] ?? '' ) ) {
            throw new InvalidActionOutputException(
                __( 'The AI response did not match the expected TITLE/BODY format.', 'vulopilot' )
            );
        }

        if ( mb_strlen( wp_strip_all_tags( $output['body'] ) ) < 40 ) {
            throw new InvalidActionOutputException( __( 'The AI returned a description that is too short to be useful.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            sprintf(
                /* translators: %s is the generated product title. */
                __( 'Create a new draft product: %s', 'vulopilot' ),
                $output['title']
            ),
            null,
            wp_trim_words( wp_strip_all_tags( $output['body'] ), 40 ),
            'html'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $post_id = wp_insert_post(
            array(
                'post_title'   => $output['title'],
                'post_content' => $output['body'],
                'post_status'  => 'draft',
                'post_type'    => post_type_exists( 'product' ) ? 'product' : 'post',
            ),
            true
        );

        if ( is_wp_error( $post_id ) ) {
            return new ActionExecutionResult( false, null, null, array(), $post_id->get_error_message() );
        }

        return new ActionExecutionResult(
            true,
            'post',
            (string) $post_id,
            array( 'created_post_id' => $post_id )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        wp_trash_post( $snapshot['created_post_id'] );
    }
}
