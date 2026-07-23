<?php
/**
 * GenerateProductCrossSellAction class file.
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
 * Suggests cross-sell products (shown in the cart, e.g. "you might also
 * like") — writes to WooCommerce's own native `_crosssell_ids` field via
 * `WC_Product::set_cross_sell_ids()`, not a VuloPilot-owned postmeta key,
 * since this is a real, existing WooCommerce data field with its own
 * built-in frontend rendering. The AI is only ever allowed to choose from
 * a candidate list of the store's other published products in the same
 * category — validate_output() rejects any id outside that list, since an
 * AI hallucinating a nonexistent or unrelated product id would silently
 * corrupt this field.
 *
 * @class       GenerateProductCrossSellAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateProductCrossSellAction extends AbstractBasicAction {

    private const MAX_CANDIDATES  = 30;
    private const MAX_SUGGESTIONS = 4;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-product-cross-sell';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Suggest cross-sell products', 'vulopilot' );
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

        $candidates = $this->get_candidate_products( $product );

        if ( empty( $candidates ) ) {
            throw new InvalidActionInputException( __( 'There are no other published products to suggest as cross-sells.', 'vulopilot' ) );
        }

        return array(
            'post_id'                 => $post_id,
            'title'                   => $product->get_name(),
            'candidates'              => $candidates,
            'previous_cross_sell_ids' => $product->get_cross_sell_ids(),
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        $candidate_lines = array();

        foreach ( $input['candidates'] as $id => $name ) {
            $candidate_lines[] = sprintf( '%d: %s', $id, $name );
        }

        return array(
            array(
                'role'    => 'system',
                'content' => sprintf(
                    'You choose e-commerce cross-sell products — items commonly bought together with the main product, '
                        . 'shown in the shopping cart. Choose up to %d ids from the exact candidate list given. '
                        . 'Respond with ONLY a raw JSON array of integer ids, e.g. [12, 45] — no markdown fences, no commentary.',
                    self::MAX_SUGGESTIONS
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Main product: %s\n\nCandidate products (id: name):\n%s",
                    $input['title'],
                    implode( "\n", $candidate_lines )
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

        return array( 'product_ids' => is_array( $decoded ) ? array_map( 'absint', $decoded ) : array() );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $product_ids = $output['product_ids'] ?? array();

        if ( empty( $product_ids ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not suggest any cross-sell products.', 'vulopilot' ) );
        }

        foreach ( $product_ids as $product_id ) {
            if ( ! array_key_exists( $product_id, $input['candidates'] ) ) {
                throw new InvalidActionOutputException( __( 'The AI suggested a product id that was not in the candidate list.', 'vulopilot' ) );
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        $names = array_map(
            static fn( int $id ) => $input['candidates'][ $id ] ?? (string) $id,
            $output['product_ids']
        );

        return new ActionPreview(
            sprintf(
                /* translators: %s is the product's name. */
                __( 'Set cross-sell products for %s', 'vulopilot' ),
                $input['title']
            ),
            null,
            implode( ', ', $names ),
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $product = wc_get_product( $input['post_id'] );

        if ( ! $product ) {
            return new ActionExecutionResult( false, 'product', (string) $input['post_id'], array(), __( 'Product no longer exists.', 'vulopilot' ) );
        }

        $product->set_cross_sell_ids( $output['product_ids'] );
        $product->save();

        return new ActionExecutionResult(
            true,
            'product',
            (string) $input['post_id'],
            array(
                'post_id'                 => $input['post_id'],
                'previous_cross_sell_ids' => $input['previous_cross_sell_ids'],
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        $product = wc_get_product( $snapshot['post_id'] );

        if ( ! $product ) {
            return;
        }

        $product->set_cross_sell_ids( $snapshot['previous_cross_sell_ids'] );
        $product->save();
    }

    /**
     * Other published products in the same category as $product, excluding
     * itself, capped at MAX_CANDIDATES.
     *
     * @param \WC_Product $product Product to find candidates for.
     * @return array<int, string> Product id => product name.
     */
    private function get_candidate_products( \WC_Product $product ): array {
        $others = wc_get_products(
            array(
                'status'   => 'publish',
                'category' => wp_list_pluck( wc_get_product_terms( $product->get_id(), 'product_cat' ), 'slug' ),
                'exclude'  => array( $product->get_id() ),
                'limit'    => self::MAX_CANDIDATES,
                'return'   => 'objects',
            )
        );

        $candidates = array();

        foreach ( $others as $other ) {
            if ( $other instanceof \WC_Product ) {
                $candidates[ $other->get_id() ] = $other->get_name();
            }
        }

        return $candidates;
    }
}
