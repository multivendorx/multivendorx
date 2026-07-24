<?php
/**
 * ProductInventoryHealthScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags two inventory-tracking inconsistencies: a product with stock
 * management enabled whose recorded quantity is null or negative (a data
 * problem, since WooCommerce expects a non-negative integer once tracking
 * is on), and a product marked 'in stock' with a tracked quantity of zero
 * or less (a status/quantity mismatch that lets customers order something
 * that isn't actually available).
 *
 * @class       ProductInventoryHealthScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductInventoryHealthScanner extends AbstractBasicScanner {

    private const PRODUCTS_BATCH_SIZE = 200;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'product-inventory-health';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Product Inventory', 'vulopilot' );
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
            if ( ! $product instanceof \WC_Product || ! $product->get_manage_stock() ) {
                continue;
            }

            $quantity = $product->get_stock_quantity();

            if ( null === $quantity || $quantity < 0 ) {
                $findings[] = new Finding(
                    sprintf(
                        /* translators: %s is the product's name. */
                        __( 'Product has an invalid stock quantity: %s', 'vulopilot' ),
                        $product->get_name()
                    ),
                    Severity::HIGH,
                    $this->get_category(),
                    __( 'Stock management is enabled for this product but its recorded quantity is missing or negative.', 'vulopilot' ),
                    'product',
                    (string) $product->get_id(),
                    array( 'check' => 'invalid_stock_quantity' )
                );
                continue;
            }

            if ( 'instock' === $product->get_stock_status() && $quantity <= 0 ) {
                $findings[] = new Finding(
                    sprintf(
                        /* translators: %s is the product's name. */
                        __( 'Product is marked in stock with zero quantity: %s', 'vulopilot' ),
                        $product->get_name()
                    ),
                    Severity::HIGH,
                    $this->get_category(),
                    __( 'This product is purchasable and shown as in-stock, but its tracked quantity is zero — customers can order something that is not actually available.', 'vulopilot' ),
                    'product',
                    (string) $product->get_id(),
                    array( 'check' => 'instock_zero_quantity' )
                );
            }
        }

        return $findings;
    }
}
