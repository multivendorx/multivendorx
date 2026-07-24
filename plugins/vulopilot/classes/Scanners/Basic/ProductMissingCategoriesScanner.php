<?php
/**
 * ProductMissingCategoriesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published products with no `product_cat` term assigned — an
 * uncategorized product doesn't appear in any shop-page category browse
 * or category-scoped widget, so it's effectively unreachable except via
 * direct link or search.
 *
 * @class       ProductMissingCategoriesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductMissingCategoriesScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 100;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-missing-categories';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Categories', 'vulopilot' );
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
            if ( ! $product instanceof \WC_Product || ! empty( $product->get_category_ids() ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the product's name. */
                    __( 'Product has no category: %s', 'vulopilot' ),
                    $product->get_name()
                ),
                Severity::MEDIUM,
                $this->get_category(),
                __( 'An uncategorized product does not appear in any shop category browse or category widget.', 'vulopilot' ),
                'product',
                (string) $product->get_id(),
                array( 'check' => 'missing_category' )
            );
        }

        return $findings;
    }
}
