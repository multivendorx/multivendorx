<?php
/**
 * ProductCompletenessScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Product Intelligence's "Product Completeness" check (ARCHITECTURE.md's
 * Prompt 11) — a single deterministic score per product across a fixed
 * checklist (image, categories, tags, short description, long description,
 * SKU, price), rather than a separate scanner per field the way the other
 * ProductMissing*Scanners already are. Those field-level scanners exist so
 * each gap gets its own precise, individually-fixable Finding; this one
 * exists so the dashboard/reports can show one number per product instead
 * of requiring someone to mentally tally seven separate findings. Not an
 * AI-scored analysis like GeoAnalysis\GeoAnalyzer's GeoScore — that's a
 * distinct, larger feature ("AI Product Review") explicitly out of scope
 * for this pass; this is the deterministic half only.
 *
 * @class       ProductCompletenessScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductCompletenessScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 100;

    /**
     * A product scoring below this out of 100 is flagged. Each of the 7
     * checklist items below is worth roughly 100/7 ≈ 14 points.
     */
    private const MIN_ACCEPTABLE_SCORE = 60;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-completeness';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Completeness', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'woocommerce';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings = array();

        if ( ! class_exists( 'WooCommerce' ) || ! function_exists( 'wc_get_products' ) ) {
            return $findings;
        }

        $products = wc_get_products(
            array(
                'status' => 'publish',
                'limit'  => self::PRODUCTS_BATCH_SIZE,
                'return' => 'objects',
            )
        );

        foreach ( $products as $product ) {
            if ( ! $product instanceof \WC_Product ) {
                continue;
            }

            $score = $this->calculate_completeness_score( $product );

            if ( $score >= self::MIN_ACCEPTABLE_SCORE ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: 1: product name, 2: completeness score out of 100. */
                    __( 'Product listing is incomplete (%2$d%%): %1$s', 'vulopilot' ),
                    $product->get_name(),
                    $score
                ),
                $score < 30 ? Severity::HIGH : Severity::MEDIUM,
                $this->get_category(),
                __( 'Scored against image, categories, tags, short description, long description, SKU, and price — each missing item lowers the score.', 'vulopilot' ),
                'product',
                (string) $product->get_id(),
                array(
                    'check'              => 'low_completeness',
                    'completeness_score' => $score,
                )
            );
        }

        return $findings;
    }

    /**
     * @param \WC_Product $product Product to score.
     * @return int 0-100.
     */
    private function calculate_completeness_score( \WC_Product $product ): int {
        $checklist = array(
            (bool) $product->get_image_id(),
            ! empty( $product->get_category_ids() ),
            ! empty( $product->get_tag_ids() ),
            '' !== trim( wp_strip_all_tags( $product->get_short_description() ) ),
            str_word_count( wp_strip_all_tags( $product->get_description() ) ) >= 20,
            '' !== trim( $product->get_sku() ),
            '' !== $product->get_regular_price(),
        );

        $passed = count( array_filter( $checklist ) );

        return (int) round( ( $passed / count( $checklist ) ) * 100 );
    }
}
