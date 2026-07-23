<?php
/**
 * GenerateProductUpsellAction class file.
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
 * GenerateProductCrossSellAction's counterpart for upsells — products
 * shown on the single product page as "you may also like", conventionally
 * a pricier or higher-quality alternative rather than a complementary
 * cart add-on. Same native-field write (`_upsell_ids` via
 * `WC_Product::set_upsell_ids()`) and same candidate-list safety
 * constraint as the cross-sell action; kept as its own class rather than
 * merged with it, since WooCommerce treats cross-sells and upsells as two
 * independent fields with different display placement and intent.
 *
 * @class       GenerateProductUpsellAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateProductUpsellAction extends AbstractBasicAction {

    private const MAX_CANDIDATES  = 30;
    private const MAX_SUGGESTIONS = 4;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-product-upsell';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Suggest upsell products', 'vulopilot' );
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
            throw new InvalidActionInputException( __( 'There are no other published products to suggest as upsells.', 'vulopilot' ) );
        }

        return array(
            'post_id'             => $post_id,
            'title'               => $product->get_name(),
            'price'               => $product->get_price(),
            'candidates'          => $candidates,
            'previous_upsell_ids' => $product->get_upsell_ids(),
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
                    'You choose e-commerce upsell products — pricier or higher-quality alternatives shown on the '
                        . 'product page as "you may also like". Choose up to %d ids from the exact candidate list given. '
                        . 'Respond with ONLY a raw JSON array of integer ids, e.g. [12, 45] — no markdown fences, no commentary.',
                    self::MAX_SUGGESTIONS
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Main product: %s (price: %s)\n\nCandidate products (id: name):\n%s",
                    $input['title'],
                    $input['price'] ?: '(not set)',
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
            throw new InvalidActionOutputException( __( 'The AI did not suggest any upsell products.', 'vulopilot' ) );
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
                __( 'Set upsell products for %s', 'vulopilot' ),
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

        $product->set_upsell_ids( $output['product_ids'] );
        $product->save();

        return new ActionExecutionResult(
            true,
            'product',
            (string) $input['post_id'],
            array(
                'post_id'             => $input['post_id'],
                'previous_upsell_ids' => $input['previous_upsell_ids'],
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

        $product->set_upsell_ids( $snapshot['previous_upsell_ids'] );
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
