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
 * Plain domain object, same shape/rules as VuloCart\Domain\Offering\Offering/
 * VuloCart\Cart\Domain\Cart. `order_number` is the human-facing identifier
 * (shown to the buyer); `access_token` is the headless equivalent of
 * Cart's `token` — an opaque value only the buyer who placed the order (or
 * whoever it was emailed to) holds, letting a guest with no WordPress
 * account look their own order up (Rest::track_item()) without needing
 * `manage_options`.
 *
 * `$payment_status`/`$fulfillment_status` replaced a single flat `$status`
 * field (PaymentStatus.php's/FulfillmentStatus.php's own docblocks explain
 * why) — the underlying `vulocart_orders` table still has a `status`
 * column (Install.php's migration is additive-only, backward-
 * compatibility.md), kept in sync with `$fulfillment_status` on write for
 * any external code still reading it directly, but no longer read by this
 * class or anything in this codebase.
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
     * Whether/how this order has been paid.
     *
     * @var string One of PaymentStatus's constants.
     */
    public $payment_status;

    /**
     * Where this order is in fulfillment.
     *
     * @var string One of FulfillmentStatus's constants.
     */
    public $fulfillment_status;

    /**
     * Amount refunded so far — null until a refund has been issued;
     * partial refunds are possible (this can be less than $total).
     *
     * @var float|null
     */
    public $refunded_amount;

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
     * @param string|null          $customer_email     Buyer's email.
     * @param string|null          $customer_name      Buyer's display name.
     * @param string               $payment_status     One of PaymentStatus's constants.
     * @param string               $fulfillment_status One of FulfillmentStatus's constants.
     * @param string|null          $currency           ISO 4217 currency code.
     * @param float                $subtotal           Sum of every line item's (unit_price * quantity).
     * @param float                $total              `total` === `subtotal` today.
     * @param float|null           $refunded_amount    Amount refunded so far, null if none.
     * @param OrderItem[]          $items              Line items belonging to this order.
     * @param array<string, mixed> $meta               Extensible, order-specific attributes.
     * @param string|null          $created_at         MySQL datetime string, once persisted.
     * @param string|null          $updated_at         MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $order_number,
        $access_token,
        $cart_token,
        $customer_email,
        $customer_name,
        $payment_status = PaymentStatus::PENDING,
        $fulfillment_status = FulfillmentStatus::PENDING,
        $currency = null,
        $subtotal = 0.0,
        $total = 0.0,
        $refunded_amount = null,
        $items = array(),
        $meta = array(),
        $created_at = null,
        $updated_at = null
    ) {
        $this->id                 = $id;
        $this->order_number       = $order_number;
        $this->access_token       = $access_token;
        $this->cart_token         = $cart_token;
        $this->customer_email     = $customer_email;
        $this->customer_name      = $customer_name;
        $this->payment_status     = $payment_status;
        $this->fulfillment_status = $fulfillment_status;
        $this->currency           = $currency;
        $this->subtotal           = $subtotal;
        $this->total              = $total;
        $this->refunded_amount    = $refunded_amount;
        $this->items              = $items;
        $this->meta               = $meta;
        $this->created_at         = $created_at;
        $this->updated_at         = $updated_at;
    }
}
