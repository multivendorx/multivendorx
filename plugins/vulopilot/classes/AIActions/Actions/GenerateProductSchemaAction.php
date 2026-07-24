<?php
/**
 * GenerateProductSchemaAction class file.
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
 * The product-aware counterpart to GenerateSchemaAction. That generic
 * action infers whether a page is a product from AI-guessed content alone;
 * this one is called specifically for `post_type = 'product'` and hands
 * the AI real price/currency/availability/SKU data up front, which
 * produces far more reliable schema.org Product JSON-LD than asking the
 * AI to guess those fields from prose. Stored under its own postmeta key
 * (separate from the generic action's `_vulopilot_schema_json`) since the
 * two are never meant to coexist on the same post.
 *
 * @class       GenerateProductSchemaAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateProductSchemaAction extends AbstractBasicAction {

    private const META_KEY = '_vulopilot_product_schema_json';

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-product-schema';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate product structured data (JSON-LD)', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_id = absint( $input['post_id'] ?? 0 );
        $product = $post_id ? wc_get_product( $post_id ) : null;

        if ( ! $product || 'publish' !== get_post_status( $post_id ) ) {
            throw new InvalidActionInputException( __( 'post_id must refer to a published product.', 'vulopilot' ) );
        }

        return array(
            'post_id'      => $post_id,
            'name'         => $product->get_name(),
            'description'  => wp_strip_all_tags( $product->get_short_description() ?: $product->get_description() ),
            'price'        => $product->get_price(),
            'currency'     => get_woocommerce_currency(),
            'availability' => $product->is_in_stock() ? 'InStock' : 'OutOfStock',
            'sku'          => $product->get_sku(),
            'url'          => get_permalink( $post_id ),
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => 'You write valid schema.org Product JSON-LD. Use exactly the price, currency, availability, '
                    . 'and SKU values given — never invent or alter them. Respond with ONLY the raw JSON — no markdown '
                    . 'code fences, no commentary.',
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Name: %s\nDescription: %s\nURL: %s\nPrice: %s\nCurrency: %s\nAvailability: %s\nSKU: %s\n\n"
                        . 'Write schema.org Product JSON-LD for this product using exactly these values.',
                    $input['name'],
                    wp_trim_words( $input['description'], 60 ),
                    $input['url'],
                    $input['price'] ?: '(not set)',
                    $input['currency'],
                    $input['availability'],
                    $input['sku'] ?: '(none)'
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        $content = preg_replace( '/^```(?:json)?\s*|\s*```$/', '', trim( $response->get_content() ) );

        return array( 'schema_json' => trim( $content ) );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $decoded = json_decode( $output['schema_json'] ?? '', true );

        if ( ! is_array( $decoded ) || ! isset( $decoded['@context'], $decoded['@type'] ) || 'Product' !== $decoded['@type'] ) {
            throw new InvalidActionOutputException(
                __( 'The AI did not return valid schema.org Product JSON-LD (missing @context, or @type is not "Product").', 'vulopilot' )
            );
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
                __( 'Add structured data to %s', 'vulopilot' ),
                $input['name']
            ),
            '' !== $current ? $current : null,
            wp_json_encode( json_decode( $output['schema_json'], true ), JSON_PRETTY_PRINT ),
            'json'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $previous_value = get_post_meta( $input['post_id'], self::META_KEY, true );

        update_post_meta( $input['post_id'], self::META_KEY, $output['schema_json'] );

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
