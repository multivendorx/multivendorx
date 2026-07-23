<?php
/**
 * WooCommerceReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

defined( 'ABSPATH' ) || exit;

/**
 * Category `woocommerce` findings for one period — covers both the
 * original WooCommerceScanner (checkout page) and the 11 Product*
 * scanners from the WooCommerce AI pass (ARCHITECTURE.md's Prompt 11),
 * since both share the `woocommerce` category string.
 *
 * @class       WooCommerceReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WooCommerceReport extends AbstractCategoryReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'woocommerce';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'WooCommerce Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_category(): string {
        return 'woocommerce';
    }
}
