<?php
/**
 * WooCommerceScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags a missing or unpublished WooCommerce checkout page. VuloPilot
 * itself has no hard dependency on WooCommerce (unlike multivendorx-pro —
 * see plugin-families.md) — this is the one scanner that's inherently
 * WooCommerce-specific, so it guards on WooCommerce actually being active
 * and simply returns no findings otherwise, rather than the whole plugin
 * requiring WooCommerce to load.
 *
 * @class       WooCommerceScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WooCommerceScanner extends AbstractBasicScanner {

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
        return __( 'WooCommerce', 'vulopilot' );
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

        if ( ! class_exists( 'WooCommerce' ) || ! function_exists( 'wc_get_page_id' ) ) {
            return $findings;
        }

        $checkout_page_id = wc_get_page_id( 'checkout' );

        if ( $checkout_page_id > 0 && 'publish' === get_post_status( $checkout_page_id ) ) {
            return $findings;
        }

        $findings[] = new Finding(
            __( 'No published checkout page configured', 'vulopilot' ),
            Severity::CRITICAL,
            $this->get_category(),
            __( 'WooCommerce > Settings > Advanced must point to a published page containing the [woocommerce_checkout] block/shortcode, or customers cannot complete an order.', 'vulopilot' ),
            'setting',
            'woocommerce_checkout_page_id'
        );

        return $findings;
    }
}
