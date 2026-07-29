<?php
/**
 * FulfillmentStatus class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module FulfillmentStatus.
 *
 * The other of the two independent dimensions an Order now tracks — see
 * PaymentStatus's own docblock for why this replaced the old single flat
 * `OrderStatus` enum. `DRAFT` is new: an order an admin created manually
 * (`Application\OrderService::create_manual_order()`) that hasn't been
 * placed/sent to the customer yet — the admin-UX brief's "Draft Orders"
 * submenu filters on this value (`classes/Admin/Menu.php`'s
 * `add_orders_menu()`).
 *
 * @class       FulfillmentStatus class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class FulfillmentStatus {

    /**
     * Created by an admin, not yet placed/sent to the customer.
     *
     * @var string
     */
    const DRAFT = 'draft';

    /**
     * Placed, not yet started.
     *
     * @var string
     */
    const PENDING = 'pending';

    /**
     * Being prepared/picked/packed.
     *
     * @var string
     */
    const PROCESSING = 'processing';

    /**
     * Shipped/handed off for delivery — meaningful for shippable
     * offerings; a purely digital order can skip straight to
     * `COMPLETED`.
     *
     * @var string
     */
    const SHIPPED = 'shipped';

    /**
     * Fulfilled.
     *
     * @var string
     */
    const COMPLETED = 'completed';

    /**
     * Cancelled before completion.
     *
     * @var string
     */
    const CANCELLED = 'cancelled';

    /**
     * Every known fulfillment status.
     *
     * @return string[]
     */
    public static function all(): array {
        return array(
            self::DRAFT,
            self::PENDING,
            self::PROCESSING,
            self::SHIPPED,
            self::COMPLETED,
            self::CANCELLED,
        );
    }
}
