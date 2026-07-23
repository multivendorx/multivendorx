<?php
/**
 * ProductDuplicateScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published products that share the exact same title
 * (case-insensitive, whitespace-trimmed) with at least one other
 * published product — a common symptom of an accidental duplicate import
 * or a copy-paste-new-product workflow that never got renamed. Deliberately
 * an exact-title match, not fuzzy/AI similarity — a cheap, deterministic
 * first pass; AI Product Review (a separate, richer per-product analysis)
 * is where a fuzzier "these two products look similar" judgment belongs.
 *
 * @class       ProductDuplicateScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductDuplicateScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 200;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-duplicate';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Duplicate Products', 'vulopilot' );
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

        $products_by_title = array();

        foreach ( $products as $product ) {
            if ( ! $product instanceof \WC_Product ) {
                continue;
            }

            $normalized_title = strtolower( trim( $product->get_name() ) );

            if ( '' === $normalized_title ) {
                continue;
            }

            $products_by_title[ $normalized_title ][] = $product;
        }

        foreach ( $products_by_title as $matching_products ) {
            if ( count( $matching_products ) < 2 ) {
                continue;
            }

            foreach ( $matching_products as $product ) {
                $findings[] = new Finding(
                    sprintf(
                        /* translators: %s is the product's name. */
                        __( 'Possible duplicate product: %s', 'vulopilot' ),
                        $product->get_name()
                    ),
                    Severity::MEDIUM,
                    $this->get_category(),
                    sprintf(
                        /* translators: %d is how many products share this exact title. */
                        __( '%d published products share this exact title, which usually indicates an accidental duplicate.', 'vulopilot' ),
                        count( $matching_products )
                    ),
                    'product',
                    (string) $product->get_id(),
                    array( 'check' => 'duplicate_title' )
                );
            }
        }

        return $findings;
    }
}
