<?php
/**
 * WriteProductLongDescriptionAction class file.
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
 * Closes RuleEngine\Rules\MissingProductDescriptionRule's fix loop —
 * writes to `post_content`, the product's main body content. Unlike
 * ImproveReadabilityAction's rewrite-in-place, there is no existing
 * content to preserve/paraphrase here (validate_input() only requires the
 * title and short description as source material), so no length-ratio
 * safety check applies the way it does there.
 *
 * @class       WriteProductLongDescriptionAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WriteProductLongDescriptionAction extends AbstractBasicAction {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'write-product-long-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Write product description', 'vulopilot' );
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
            'post_id'                   => $post_id,
            'title'                     => $product->get_name(),
            'short_description'         => wp_strip_all_tags( $product->get_short_description() ),
            'categories'                => wp_list_pluck( wc_get_product_terms( $post_id, 'product_cat' ), 'name' ),
            'price'                     => $product->get_price(),
            'previous_long_description' => $product->get_description(),
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => 'You write detailed, benefit-focused e-commerce product descriptions, 2-4 short paragraphs. '
                    . 'Describe what the product is, its key features, and why a customer should buy it. '
                    . 'Do not invent specific technical specifications you were not given. '
                    . 'Respond with ONLY the description as plain HTML paragraphs — no markdown fences, no commentary.',
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Product: %s\nCategories: %s\nPrice: %s\nShort description: %s\n\nWrite a full product description.",
                    $input['title'],
                    implode( ', ', $input['categories'] ) ?: '(none)',
                    $input['price'] ?: '(not set)',
                    $input['short_description'] ?: '(none)'
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        return array( 'long_description' => trim( $response->get_content() ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        if ( '' === trim( wp_strip_all_tags( $output['long_description'] ?? '' ) ) ) {
            throw new InvalidActionOutputException( __( 'The AI returned an empty description.', 'vulopilot' ) );
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            sprintf(
                /* translators: %s is the product's name. */
                __( 'Set description for %s', 'vulopilot' ),
                $input['title']
            ),
            '' !== trim( wp_strip_all_tags( $input['previous_long_description'] ) ) ? wp_trim_words( wp_strip_all_tags( $input['previous_long_description'] ), 30 ) : null,
            wp_trim_words( wp_strip_all_tags( $output['long_description'] ), 30 ),
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
                'post_content' => $output['long_description'],
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
                'post_id'                   => $input['post_id'],
                'previous_long_description' => $input['previous_long_description'],
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
                'post_content' => $snapshot['previous_long_description'],
            )
        );
    }
}
