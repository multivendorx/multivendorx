<?php
/**
 * ProductAttributesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags variable products with zero attributes defined. A variable
 * product's variations are generated from its attributes — with none set,
 * WooCommerce cannot generate any variation at all, so the product is
 * effectively unpurchasable despite appearing to exist. Simple products
 * are skipped entirely: attributes are optional filtering/display data for
 * them, not a structural requirement the way they are for a variable
 * product's variations.
 *
 * @class       ProductAttributesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductAttributesScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 100;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-attributes';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Attributes', 'vulopilot' );
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
                'type'   => 'variable',
                'limit'  => self::PRODUCTS_BATCH_SIZE,
                'return' => 'objects',
            )
        );

        foreach ( $products as $product ) {
            if ( ! $product instanceof \WC_Product || ! empty( $product->get_attributes() ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the product's name. */
                    __( 'Variable product has no attributes: %s', 'vulopilot' ),
                    $product->get_name()
                ),
                Severity::HIGH,
                $this->get_category(),
                __( 'A variable product needs at least one attribute to generate any purchasable variation; without one, this product cannot actually be bought.', 'vulopilot' ),
                'product',
                (string) $product->get_id(),
                array( 'check' => 'missing_attributes' )
            );
        }

        return $findings;
    }
}
