<?php
/**
 * Order class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module Order entity.
 *
 * Plain domain object, same shape/rules as VuloCart\Domain\Asset\Asset/
 * VuloCart\Cart\Domain\Cart. `order_number` is the human-facing identifier
 * (shown to the buyer); `access_token` is the headless equivalent of
 * Cart's `token` — an opaque value only the buyer who placed the order (or
 * whoever it was emailed to) holds, letting a guest with no WordPress
 * account look their own order up (Rest::track_item()) without needing
 * `manage_options`.
 *
 * @class       Order class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Order {

    /**
     * Order id.
     *
     * @var int|null Null for an order not yet persisted.
     */
    public $id;

    /**
     * Human-facing order identifier, e.g. 'VC-000042'.
     *
     * @var string|null Null until persisted (needs the auto-increment id).
     */
    public $order_number;

    /**
     * Opaque token letting the buyer who placed this order look it up
     * without an account — see class docblock.
     *
     * @var string
     */
    public $access_token;

    /**
     * The Cart this order was created from, for traceability. Informational
     * only — by the time an Order exists, CartService has already cleared
     * this cart's items (Application\OrderService::create_from_cart()).
     *
     * @var string|null
     */
    public $cart_token;

    /**
     * Buyer's email, for guest orders (no Customer/Identity module exists
     * yet to reference instead — vision's "Customer" module).
     *
     * @var string|null
     */
    public $customer_email;

    /**
     * Buyer's display name.
     *
     * @var string|null
     */
    public $customer_name;

    /**
     * Lifecycle status.
     *
     * @var string One of OrderStatus's constants.
     */
    public $status;

    /**
     * Currency code.
     *
     * @var string|null ISO 4217 currency code.
     */
    public $currency;

    /**
     * Sum of every line item's (unit_price * quantity), at order-creation
     * time.
     *
     * @var float
     */
    public $subtotal;

    /**
     * `total` === `subtotal` today — no tax/shipping module yet, same
     * honest gap Application\CartService::get_totals() already documents.
     *
     * @var float
     */
    public $total;

    /**
     * Line items belonging to this order.
     *
     * @var OrderItem[]
     */
    public $items;

    /**
     * Extensible, order-specific attributes.
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
     * Order constructor.
     *
     * @param int|null             $id             Null for an order not yet persisted.
     * @param string|null          $order_number   Human-facing order identifier.
     * @param string               $access_token   Opaque token letting the buyer look this order up.
     * @param string|null          $cart_token     The Cart this order was created from.
     * @param string|null          $customer_email Buyer's email.
     * @param string|null          $customer_name  Buyer's display name.
     * @param string               $status         One of OrderStatus's constants.
     * @param string|null          $currency       ISO 4217 currency code.
     * @param float                $subtotal       Sum of every line item's (unit_price * quantity).
     * @param float                $total          `total` === `subtotal` today.
     * @param OrderItem[]          $items          Line items belonging to this order.
     * @param array<string, mixed> $meta           Extensible, order-specific attributes.
     * @param string|null          $created_at     MySQL datetime string, once persisted.
     * @param string|null          $updated_at     MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $order_number,
        $access_token,
        $cart_token,
        $customer_email,
        $customer_name,
        $status = OrderStatus::PENDING,
        $currency = null,
        $subtotal = 0.0,
        $total = 0.0,
        $items = array(),
        $meta = array(),
        $created_at = null,
        $updated_at = null
    ) {
        $this->id             = $id;
        $this->order_number   = $order_number;
        $this->access_token   = $access_token;
        $this->cart_token     = $cart_token;
        $this->customer_email = $customer_email;
        $this->customer_name  = $customer_name;
        $this->status         = $status;
        $this->currency       = $currency;
        $this->subtotal       = $subtotal;
        $this->total          = $total;
        $this->items          = $items;
        $this->meta           = $meta;
        $this->created_at     = $created_at;
        $this->updated_at     = $updated_at;
    }
}
