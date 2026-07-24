<?php
/**
 * ProductMissingShortDescriptionScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published products with an empty short description
 * (`post_excerpt`) — the summary WooCommerce renders directly beside the
 * add-to-cart button on the single product page, distinct from
 * ProductMissingDescriptionScanner's long-description check.
 *
 * @class       ProductMissingShortDescriptionScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductMissingShortDescriptionScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 100;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-missing-short-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Short Descriptions', 'vulopilot' );
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
            if ( ! $product instanceof \WC_Product || '' !== trim( wp_strip_all_tags( $product->get_short_description() ) ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the product's name. */
                    __( 'Product has no short description: %s', 'vulopilot' ),
                    $product->get_name()
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'The short description appears next to the add-to-cart button on the product page; an empty one leaves that space blank.', 'vulopilot' ),
                'product',
                (string) $product->get_id(),
                array( 'check' => 'missing_short_description' )
            );
        }

        return $findings;
    }
}
