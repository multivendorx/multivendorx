<?php
/**
 * GenerateProductBundleSuggestionsAction class file.
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
 * Core WooCommerce has no native "product bundle" data model (that's a
 * separate, paid extension's job) — so unlike GenerateProductCrossSellAction/
 * GenerateProductUpsellAction, which write to WooCommerce's own
 * `_crosssell_ids`/`_upsell_ids` fields, this is advisory-only: it stores a
 * suggested grouping of existing products in VuloPilot's own postmeta,
 * for a merchant to act on manually (or for a bundle-plugin integration to
 * read later) rather than attempting to fabricate a bundle product this
 * codebase has no mechanism to actually sell.
 *
 * @class       GenerateProductBundleSuggestionsAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateProductBundleSuggestionsAction extends AbstractBasicAction {

    private const META_KEY        = '_vulopilot_bundle_suggestions';
    private const MAX_CANDIDATES  = 30;
    private const MAX_BUNDLE_SIZE = 3;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-product-bundle-suggestions';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Suggest a product bundle', 'vulopilot' );
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
            throw new InvalidActionInputException( __( 'There are no other published products to suggest bundling with.', 'vulopilot' ) );
        }

        return array(
            'post_id'    => $post_id,
            'title'      => $product->get_name(),
            'candidates' => $candidates,
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
                    'You suggest e-commerce product bundles — a small group of products commonly purchased and used '
                        . 'together as a set. Choose up to %d ids (not including the main product) from the exact '
                        . 'candidate list given, and a short bundle name. Respond with ONLY raw JSON like '
                        . '{"bundle_name": "...", "product_ids": [12, 45]} — no markdown fences, no commentary.',
                    self::MAX_BUNDLE_SIZE
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

        if ( ! is_array( $decoded ) ) {
            return array(
                'bundle_name' => '',
                'product_ids' => array(),
            );
        }

        return array(
            'bundle_name' => is_string( $decoded['bundle_name'] ?? null ) ? $decoded['bundle_name'] : '',
            'product_ids' => is_array( $decoded['product_ids'] ?? null ) ? array_map( 'absint', $decoded['product_ids'] ) : array(),
        );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        if ( '' === $output['bundle_name'] ) {
            throw new InvalidActionOutputException( __( 'The AI did not return a bundle name.', 'vulopilot' ) );
        }

        if ( empty( $output['product_ids'] ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not suggest any bundle products.', 'vulopilot' ) );
        }

        foreach ( $output['product_ids'] as $product_id ) {
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
                /* translators: %s is the suggested bundle name. */
                __( 'Suggest bundle: %s', 'vulopilot' ),
                $output['bundle_name']
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
        $previous_value = get_post_meta( $input['post_id'], self::META_KEY, true );

        update_post_meta(
            $input['post_id'],
            self::META_KEY,
            wp_json_encode(
                array(
                    'bundle_name' => $output['bundle_name'],
                    'product_ids' => $output['product_ids'],
                )
            )
        );

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
