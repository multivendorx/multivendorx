<?php
/**
 * ProductPricingScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags two pricing problems: a purchasable simple product with no
 * regular price set at all (it cannot legally be added to cart in this
 * state), and a sale price that is greater than or equal to the regular
 * price (a discount that isn't actually a discount). Variable products
 * are skipped — their variations each carry their own price, checked at
 * the variation level, not the parent product level.
 *
 * @class       ProductPricingScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductPricingScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 200;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-pricing';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Pricing', 'vulopilot' );
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
                'type'   => array( 'simple', 'external', 'grouped' ),
                'limit'  => self::PRODUCTS_BATCH_SIZE,
                'return' => 'objects',
            )
        );

        foreach ( $products as $product ) {
            if ( ! $product instanceof \WC_Product ) {
                continue;
            }

            $regular_price = $product->get_regular_price();

            if ( '' === $regular_price || null === $regular_price ) {
                $findings[] = new Finding(
                    sprintf(
                        /* translators: %s is the product's name. */
                        __( 'Product has no price set: %s', 'vulopilot' ),
                        $product->get_name()
                    ),
                    Severity::CRITICAL,
                    $this->get_category(),
                    __( 'A published product with no regular price cannot be purchased.', 'vulopilot' ),
                    'product',
                    (string) $product->get_id(),
                    array( 'check' => 'missing_price' )
                );
                continue;
            }

            $sale_price = $product->get_sale_price();

            if ( '' !== $sale_price && null !== $sale_price && (float) $sale_price >= (float) $regular_price ) {
                $findings[] = new Finding(
                    sprintf(
                        /* translators: %s is the product's name. */
                        __( 'Product sale price is not a real discount: %s', 'vulopilot' ),
                        $product->get_name()
                    ),
                    Severity::MEDIUM,
                    $this->get_category(),
                    __( 'The sale price is greater than or equal to the regular price, so it advertises a discount that does not actually reduce the price.', 'vulopilot' ),
                    'product',
                    (string) $product->get_id(),
                    array( 'check' => 'invalid_sale_price' )
                );
            }
        }

        return $findings;
    }
}
