<?php
/**
 * AssetType class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Asset;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart AssetType class.
 *
 * The vision's "Never use Product internally. Instead use Asset." — Asset
 * represents Physical Product, Digital Product, Subscription, Course,
 * Service, Membership, Booking, Rental, Bundle, Donation, Gift Card,
 * License, and future asset types. One `vulocart_assets` table covers all
 * of them (Install.php); this class is only the closed set of known `type`
 * values that column accepts today — per-type *behavior* differences
 * (e.g. a Booking asset needing calendar availability) are a later,
 * separate layer, not something this constants class tries to encode.
 *
 * @class       AssetType class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AssetType {

    const PHYSICAL     = 'physical';
    const DIGITAL      = 'digital';
    const SUBSCRIPTION = 'subscription';
    const COURSE       = 'course';
    const SERVICE      = 'service';
    const MEMBERSHIP   = 'membership';
    const BOOKING      = 'booking';
    const RENTAL       = 'rental';
    const BUNDLE       = 'bundle';
    const DONATION     = 'donation';
    const GIFT_CARD    = 'gift_card';
    const LICENSE      = 'license';

    /**
     * Returns every known asset type value.
     *
     * @return string[] Every known asset type value.
     */
    public static function all(): array {
        return array(
            self::PHYSICAL,
            self::DIGITAL,
            self::SUBSCRIPTION,
            self::COURSE,
            self::SERVICE,
            self::MEMBERSHIP,
            self::BOOKING,
            self::RENTAL,
            self::BUNDLE,
            self::DONATION,
            self::GIFT_CARD,
            self::LICENSE,
        );
    }
}
