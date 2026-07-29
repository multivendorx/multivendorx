<?php
/**
 * PaymentStatus class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module PaymentStatus.
 *
 * One of the two independent dimensions an Order now tracks — the other
 * being FulfillmentStatus. Previously a single flat `OrderStatus` enum
 * conflated "has this been paid?" and "has this been shipped/completed?"
 * into one value, which is why the admin-UX brief's Orders columns
 * ("Payment Status", "Fulfillment Status") couldn't be honestly rendered
 * as two separate cells before this split. Values match
 * `src/settings/Payments.ts`'s `default_payment_status` options exactly,
 * for the same reason `Domain\Offering\OfferingType`'s list and
 * `OfferingEdit.tsx`'s duplicate of it are kept in sync by convention.
 *
 * @class       PaymentStatus class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PaymentStatus {

    /**
     * No successful payment recorded yet.
     *
     * @var string
     */
    const PENDING = 'pending';

    /**
     * Payment received in full.
     *
     * @var string
     */
    const PAID = 'paid';

    /**
     * A payment attempt did not succeed.
     *
     * @var string
     */
    const FAILED = 'failed';

    /**
     * Previously paid, now refunded (partially or fully — see
     * `Order::$refunded_amount`).
     *
     * @var string
     */
    const REFUNDED = 'refunded';

    /**
     * Every known payment status.
     *
     * @return string[]
     */
    public static function all(): array {
        return array(
            self::PENDING,
            self::PAID,
            self::FAILED,
            self::REFUNDED,
        );
    }
}
