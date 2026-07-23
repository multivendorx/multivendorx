<?php
/**
 * ProductSkuIssuesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags two distinct SKU problems in one pass since both require the same
 * full product list to detect: a published, purchasable product with no
 * SKU at all (Severity::LOW — inventory/ops inconvenience, not
 * customer-facing), and two or more products sharing the same non-empty
 * SKU (Severity::HIGH — breaks inventory tracking, shipping integrations,
 * and third-party catalog sync that key off SKU as a unique identifier).
 *
 * @class       ProductSkuIssuesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductSkuIssuesScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 200;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-sku-issues';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product SKUs', 'vulopilot' );
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

        $products_by_sku = array();

        foreach ( $products as $product ) {
            if ( ! $product instanceof \WC_Product ) {
                continue;
            }

            $sku = trim( $product->get_sku() );

            if ( '' === $sku ) {
                $findings[] = new Finding(
                    sprintf(
                        /* translators: %s is the product's name. */
                        __( 'Product has no SKU: %s', 'vulopilot' ),
                        $product->get_name()
                    ),
                    Severity::LOW,
                    $this->get_category(),
                    __( 'A SKU is how inventory tools, shipping integrations, and catalog feeds identify this exact product.', 'vulopilot' ),
                    'product',
                    (string) $product->get_id(),
                    array( 'check' => 'missing_sku' )
                );
                continue;
            }

            $products_by_sku[ $sku ][] = $product;
        }

        foreach ( $products_by_sku as $sku => $matching_products ) {
            if ( count( $matching_products ) < 2 ) {
                continue;
            }

            foreach ( $matching_products as $product ) {
                $findings[] = new Finding(
                    sprintf(
                        /* translators: 1: SKU value, 2: product name. */
                        __( 'Duplicate SKU "%1$s": %2$s', 'vulopilot' ),
                        $sku,
                        $product->get_name()
                    ),
                    Severity::HIGH,
                    $this->get_category(),
                    sprintf(
                        /* translators: %d is how many products share this SKU. */
                        __( 'This SKU is shared by %d products, which breaks inventory tracking and any integration that relies on SKU uniqueness.', 'vulopilot' ),
                        count( $matching_products )
                    ),
                    'product',
                    (string) $product->get_id(),
                    array(
                        'check' => 'duplicate_sku',
                        'sku'   => $sku,
                    )
                );
            }
        }

        return $findings;
    }
}
