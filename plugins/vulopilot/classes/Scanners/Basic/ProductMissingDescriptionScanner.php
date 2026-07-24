<?php
/**
 * ProductMissingDescriptionScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published products whose long description (`post_content`) is
 * empty or too short to be useful — the product-specific counterpart to
 * ThinContentScanner, which only looks at `post`/`page`. Kept as a
 * separate scanner rather than widening ThinContentScanner's post-type
 * list, since the threshold and fix path (WriteProductLongDescriptionAction,
 * not ImproveReadabilityAction) are both product-specific.
 *
 * @class       ProductMissingDescriptionScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductMissingDescriptionScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 100;
    private const MIN_WORD_COUNT      = 20;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-missing-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Descriptions', 'vulopilot' );
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

            $word_count = str_word_count( wp_strip_all_tags( $product->get_description() ) );

            if ( $word_count >= self::MIN_WORD_COUNT ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the product's name. */
                    __( 'Product has little or no description: %s', 'vulopilot' ),
                    $product->get_name()
                ),
                Severity::MEDIUM,
                $this->get_category(),
                sprintf(
                    /* translators: %d is the minimum recommended word count. */
                    __( 'A thin product description hurts both SEO and conversion; aim for at least %d words explaining what the product is and why to buy it.', 'vulopilot' ),
                    self::MIN_WORD_COUNT
                ),
                'product',
                (string) $product->get_id(),
                array( 'check' => 'missing_description' )
            );
        }

        return $findings;
    }
}
