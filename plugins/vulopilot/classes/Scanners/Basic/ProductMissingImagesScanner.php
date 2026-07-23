<?php
/**
 * ProductMissingImagesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * WooCommerce AI's Product Intelligence pass (ARCHITECTURE.md's Prompt 11):
 * flags published products with no featured image — the single most
 * visible product-data gap, since a product with no image renders as a
 * placeholder everywhere it's listed (shop archive, cart, related
 * products). Guards on WooCommerce being active the same way
 * WooCommerceScanner does, since VuloPilot has no hard WooCommerce
 * dependency.
 *
 * @class       ProductMissingImagesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductMissingImagesScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 100;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-missing-images';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Images', 'vulopilot' );
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
            if ( ! $product instanceof \WC_Product || $product->get_image_id() ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the product's name. */
                    __( 'Product has no featured image: %s', 'vulopilot' ),
                    $product->get_name()
                ),
                Severity::MEDIUM,
                $this->get_category(),
                __( 'A product with no featured image shows a placeholder on the shop archive, cart, and related-product widgets.', 'vulopilot' ),
                'product',
                (string) $product->get_id(),
                array( 'check' => 'missing_image' )
            );
        }

        return $findings;
    }
}
