<?php
/**
 * ProductMissingTagsScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published products with no `product_tag` term. Lower severity
 * than ProductMissingCategoriesScanner — a missing category makes a
 * product unreachable via browse navigation, a missing tag only weakens
 * cross-linking (related products, tag clouds), so this is Severity::LOW,
 * not MEDIUM.
 *
 * @class       ProductMissingTagsScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductMissingTagsScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 100;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-missing-tags';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Tags', 'vulopilot' );
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
            if ( ! $product instanceof \WC_Product || ! empty( $product->get_tag_ids() ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the product's name. */
                    __( 'Product has no tags: %s', 'vulopilot' ),
                    $product->get_name()
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Tags help WooCommerce surface related products and power tag-based browsing; an untagged product misses both.', 'vulopilot' ),
                'product',
                (string) $product->get_id(),
                array( 'check' => 'missing_tags' )
            );
        }

        return $findings;
    }
}
