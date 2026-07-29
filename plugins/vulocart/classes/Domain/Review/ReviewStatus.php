<?php
/**
 * ReviewStatus class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Review;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart ReviewStatus class.
 *
 * Every moderation state a Review can be in — same small,
 * hand-maintained constant list convention Order\Domain\PaymentStatus/
 * FulfillmentStatus already establish.
 *
 * @class       ReviewStatus class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ReviewStatus {

    /**
     * Submitted, awaiting moderation — never shown on the storefront.
     *
     * @var string
     */
    const PENDING = 'pending';

    /**
     * Moderated in, visible on the storefront.
     *
     * @var string
     */
    const APPROVED = 'approved';

    /**
     * Moderated out — never shown.
     *
     * @var string
     */
    const REJECTED = 'rejected';

    /**
     * Every known review status.
     *
     * @return string[]
     */
    public static function all(): array {
        return array(
            self::PENDING,
            self::APPROVED,
            self::REJECTED,
        );
    }
}
