<?php
/**
 * CartItem class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Cart\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Cart module CartItem entity.
 *
 * Plain domain object, same shape/rules as VuloCart\Domain\Offering\Offering —
 * no `$wpdb`, no WordPress function calls. `unit_price`/`currency` are a
 * snapshot taken from the Offering at the moment it was added
 * (Application\CartService), not a live join — so a later price change on
 * the Offering doesn't silently reprice items already sitting in someone's
 * cart.
 *
 * @class       CartItem class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CartItem {

    /**
     * Cart item id.
     *
     * @var int|null Null for an item not yet persisted.
     */
    public $id;

    /**
     * Owning cart id.
     *
     * @var int
     */
    public $cart_id;

    /**
     * The Offering this line item represents.
     *
     * @var int VuloCart\Domain\Offering\Offering id.
     */
    public $offering_id;

    /**
     * Quantity.
     *
     * @var int
     */
    public $quantity;

    /**
     * Unit price, snapshotted from the Offering at add-time.
     *
     * @var float
     */
    public $unit_price;

    /**
     * Currency code, snapshotted from the Offering at add-time.
     *
     * @var string|null ISO 4217 currency code.
     */
    public $currency;

    /**
     * Extensible, line-item-specific attributes.
     *
     * @var array<string, mixed>
     */
    public $meta;

    /**
     * Creation timestamp.
     *
     * @var string|null MySQL datetime string, once persisted.
     */
    public $created_at;

    /**
     * Last-updated timestamp.
     *
     * @var string|null MySQL datetime string, once persisted.
     */
    public $updated_at;

    /**
     * CartItem constructor.
     *
     * @param int|null             $id         Null for an item not yet persisted.
     * @param int                  $cart_id    Owning cart id.
     * @param int                  $offering_id   VuloCart\Domain\Offering\Offering id.
     * @param int                  $quantity   Quantity.
     * @param float                $unit_price Unit price, snapshotted from the Offering at add-time.
     * @param string|null          $currency   Currency code, snapshotted from the Offering at add-time.
     * @param array<string, mixed> $meta       Extensible, line-item-specific attributes.
     * @param string|null          $created_at MySQL datetime string, once persisted.
     * @param string|null          $updated_at MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $cart_id,
        $offering_id,
        $quantity,
        $unit_price,
        $currency = null,
        $meta = array(),
        $created_at = null,
        $updated_at = null
    ) {
        $this->id          = $id;
        $this->cart_id     = $cart_id;
        $this->offering_id = $offering_id;
        $this->quantity    = $quantity;
        $this->unit_price  = $unit_price;
        $this->currency    = $currency;
        $this->meta        = $meta;
        $this->created_at  = $created_at;
        $this->updated_at  = $updated_at;
    }
}
