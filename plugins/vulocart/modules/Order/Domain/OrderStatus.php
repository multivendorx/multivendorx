<?php
/**
 * OrderStatus class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module OrderStatus.
 *
 * Every lifecycle status an Order can be in — mirrors
 * VuloCart\Domain\Asset\AssetType's role as a small, hand-maintained
 * constant list rather than a free-form string.
 *
 * @class       OrderStatus class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OrderStatus {

    /**
     * Order placed, not yet processed.
     *
     * @var string
     */
    const PENDING = 'pending';

    /**
     * Order is being fulfilled.
     *
     * @var string
     */
    const PROCESSING = 'processing';

    /**
     * Order fulfilled.
     *
     * @var string
     */
    const COMPLETED = 'completed';

    /**
     * Order cancelled before completion.
     *
     * @var string
     */
    const CANCELLED = 'cancelled';

    /**
     * Order refunded after completion.
     *
     * @var string
     */
    const REFUNDED = 'refunded';

    /**
     * Every known status.
     *
     * @return string[]
     */
    public static function all(): array {
        return array(
            self::PENDING,
            self::PROCESSING,
            self::COMPLETED,
            self::CANCELLED,
            self::REFUNDED,
        );
    }
}
