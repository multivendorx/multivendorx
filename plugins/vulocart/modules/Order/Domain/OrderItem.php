<?php
/**
 * OrderItem class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module OrderItem entity.
 *
 * Plain domain object, same shape/rules as VuloCart\Cart\Domain\CartItem —
 * but `title` is snapshotted here too (CartItem doesn't store one; its
 * Rest layer resolves it live from the Offering on every read), because an
 * Order is a permanent historical record: if the Offering's title changes or
 * the Offering is later deleted, the order still needs to show what the
 * buyer actually bought.
 *
 * @class       OrderItem class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OrderItem {

    /**
     * Order item id.
     *
     * @var int|null Null for an item not yet persisted.
     */
    public $id;

    /**
     * Owning order id.
     *
     * @var int
     */
    public $order_id;

    /**
     * The Offering this line item represents.
     *
     * @var int VuloCart\Domain\Offering\Offering id, at the time the order was placed.
     */
    public $offering_id;

    /**
     * Offering title, snapshotted at order-creation time.
     *
     * @var string
     */
    public $title;

    /**
     * Quantity.
     *
     * @var int
     */
    public $quantity;

    /**
     * Unit price, snapshotted at order-creation time.
     *
     * @var float
     */
    public $unit_price;

    /**
     * Currency code, snapshotted at order-creation time.
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
     * OrderItem constructor.
     *
     * @param int|null             $id         Null for an item not yet persisted.
     * @param int                  $order_id   Owning order id.
     * @param int                  $offering_id   VuloCart\Domain\Offering\Offering id, at the time the order was placed.
     * @param string               $title      Offering title, snapshotted at order-creation time.
     * @param int                  $quantity   Quantity.
     * @param float                $unit_price Unit price, snapshotted at order-creation time.
     * @param string|null          $currency   Currency code, snapshotted at order-creation time.
     * @param array<string, mixed> $meta       Extensible, line-item-specific attributes.
     * @param string|null          $created_at MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $order_id,
        $offering_id,
        $title,
        $quantity,
        $unit_price,
        $currency = null,
        $meta = array(),
        $created_at = null
    ) {
        $this->id          = $id;
        $this->order_id    = $order_id;
        $this->offering_id = $offering_id;
        $this->title       = $title;
        $this->quantity    = $quantity;
        $this->unit_price  = $unit_price;
        $this->currency    = $currency;
        $this->meta        = $meta;
        $this->created_at  = $created_at;
    }
}
